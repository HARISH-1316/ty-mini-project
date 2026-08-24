// ──────────────────────────────────────────────
// Docker Service — Sandboxed Container Execution Engine
// ──────────────────────────────────────────────

import { spawn } from 'child_process';
import path from 'path';

// In-memory cache for inspected / verified local Docker images
const verifiedImages = new Set();

const DockerService = {
  /**
   * Check if a Docker image exists locally; pull it if missing.
   */
  ensureImage: async (imageName) => {
    if (verifiedImages.has(imageName)) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const inspectProc = spawn('docker', ['image', 'inspect', imageName]);

      inspectProc.on('close', (code) => {
        if (code === 0) {
          verifiedImages.add(imageName);
          return resolve(true);
        }

        // Image not found locally -> pull
        console.log(`📦 Docker image "${imageName}" not found locally. Pulling...`);
        const pullProc = spawn('docker', ['pull', imageName]);

        pullProc.on('close', (pullCode) => {
          if (pullCode === 0) {
            console.log(`✅ Docker image "${imageName}" successfully pulled.`);
            verifiedImages.add(imageName);
            resolve(true);
          } else {
            reject(new Error(`Failed to pull Docker image: ${imageName} (exit code ${pullCode})`));
          }
        });

        pullProc.on('error', (err) => {
          reject(new Error(`Docker pull process error: ${err.message}`));
        });
      });

      inspectProc.on('error', (err) => {
        reject(new Error(`Docker inspect process error: ${err.message}. Is Docker running?`));
      });
    });
  },

  /**
   * Execute a command inside a sandboxed Docker container with strict resource limits.
   *
   * @param {Object} options
   * @param {string} options.image - Docker image name (e.g. gcc:14)
   * @param {string} options.workspacePath - Absolute path to temporary workspace directory on host
   * @param {Array<string>} options.command - Command and arguments to run inside container
   * @param {string} [options.input] - Stdin input string to feed into process
   * @param {number} [options.timeoutMs] - Maximum execution time in milliseconds (default 5000)
   * @returns {Promise<{ stdout: string, stderr: string, exitCode: number, executionTime: number, timedOut: boolean }>}
   */
  runContainer: async ({ image, workspacePath, command, input = '', timeoutMs = 5000 }) => {
    // Ensure image is ready before launching container
    try {
      await DockerService.ensureImage(image);
    } catch (err) {
      console.warn(`Docker image check failed for ${image}:`, err.message);
    }

    const memoryLimit = process.env.CODE_EXECUTION_MEMORY || '256m';
    const cpuLimit = process.env.CODE_EXECUTION_CPUS || '1';
    const maxOutputBytes = 64 * 1024; // 64 KB output buffer limit

    // Format host path for docker volume mount (handle Windows backslashes)
    const normalizedWorkspace = path.resolve(workspacePath).replace(/\\/g, '/');

    const dockerArgs = [
      'run',
      '--rm',
      '-i',
      '--network', 'none',
      `--memory=${memoryLimit}`,
      `--cpus=${cpuLimit}`,
      '--pids-limit=64',
      '--security-opt', 'no-new-privileges',
      '--cap-drop', 'ALL',
      '-v', `${normalizedWorkspace}:/workspace`,
      '-w', '/workspace',
      image,
      ...command,
    ];

    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let isResolved = false;

      const proc = spawn('docker', dockerArgs);

      const timer = setTimeout(() => {
        timedOut = true;
        try {
          proc.kill('SIGKILL');
        } catch (_) {}
      }, timeoutMs);

      if (proc.stdin) {
        if (input) {
          proc.stdin.write(input);
          if (!input.endsWith('\n')) {
            proc.stdin.write('\n');
          }
        }
        proc.stdin.end();
      }

      proc.stdout.on('data', (data) => {
        if (stdout.length < maxOutputBytes) {
          stdout += data.toString('utf-8');
        }
      });

      proc.stderr.on('data', (data) => {
        if (stderr.length < maxOutputBytes) {
          stderr += data.toString('utf-8');
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        if (!isResolved) {
          isResolved = true;
          resolve({
            stdout,
            stderr: `Docker execution error: ${err.message}. Please verify Docker is running.`,
            exitCode: 1,
            executionTime: Date.now() - startTime,
            timedOut: false,
          });
        }
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (!isResolved) {
          isResolved = true;
          const executionTime = Date.now() - startTime;
          resolve({
            stdout,
            stderr,
            exitCode: timedOut ? 124 : (code ?? 0),
            executionTime,
            timedOut,
          });
        }
      });
    });
  },
};

export default DockerService;
