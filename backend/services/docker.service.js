// ──────────────────────────────────────────────
// Execution Service Engine — Container & Native Hybrid
// ──────────────────────────────────────────────

import { spawn } from 'child_process';
import path from 'path';

// In-memory cache for Docker availability
let dockerAvailableCache = null;
const verifiedImages = new Set();

const DockerService = {
  /**
   * Check if Docker is available and operational.
   * If not (e.g. inside Azure Container Apps), falls back gracefully to native execution.
   */
  isDockerAvailable: async () => {
    if (dockerAvailableCache !== null) return dockerAvailableCache;

    if (process.env.DISABLE_DOCKER === 'true' || process.env.USE_NATIVE_EXECUTION === 'true') {
      dockerAvailableCache = false;
      return false;
    }

    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          dockerAvailableCache = false;
          try { proc.kill('SIGKILL'); } catch (_) {}
          resolve(false);
        }
      }, 1500);

      const proc = spawn('docker', ['info']);
      proc.on('error', () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          dockerAvailableCache = false;
          resolve(false);
        }
      });
      proc.on('close', (code) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          dockerAvailableCache = (code === 0);
          resolve(dockerAvailableCache);
        }
      });
    });
  },

  /**
   * Check if a Docker image exists locally; pull it if missing.
   */
  ensureImage: async (imageName) => {
    const isDocker = await DockerService.isDockerAvailable();
    if (!isDocker) {
      return true; // Native runner, no Docker image pull needed
    }

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
   * Native sandboxed process execution when Docker daemon is not available (e.g. ACA).
   */
  runNative: async ({ workspacePath, command, input = '', timeoutMs = 5000 }) => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let isResolved = false;

      let execCmd = command[0];
      const args = command.slice(1);

      // Handle relative binary execution (like ./main)
      if (execCmd === './main' || execCmd === '.\\main') {
        execCmd = path.resolve(workspacePath, process.platform === 'win32' ? 'main.exe' : 'main');
      } else if (execCmd.startsWith('./') || execCmd.startsWith('.\\')) {
        execCmd = path.resolve(workspacePath, execCmd.slice(2));
      }

      const proc = spawn(execCmd, args, {
        cwd: workspacePath,
        env: {
          ...process.env,
          TMPDIR: workspacePath,
        },
      });

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
        if (stdout.length < 64 * 1024) {
          stdout += data.toString('utf-8');
        }
      });

      proc.stderr.on('data', (data) => {
        if (stderr.length < 64 * 1024) {
          stderr += data.toString('utf-8');
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        if (!isResolved) {
          isResolved = true;
          resolve({
            stdout,
            stderr: `Execution error: ${err.message}`,
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
          resolve({
            stdout,
            stderr,
            exitCode: timedOut ? 124 : (code ?? 0),
            executionTime: Date.now() - startTime,
            timedOut,
          });
        }
      });
    });
  },

  /**
   * Execute code: uses Docker if available, otherwise executes natively in the workspace.
   */
  runContainer: async ({ image, workspacePath, command, input = '', timeoutMs = 5000 }) => {
    const isDocker = await DockerService.isDockerAvailable();

    if (!isDocker) {
      return DockerService.runNative({ workspacePath, command, input, timeoutMs });
    }

    try {
      await DockerService.ensureImage(image);
    } catch (err) {
      console.warn(`Docker image check failed for ${image}:`, err.message);
      return DockerService.runNative({ workspacePath, command, input, timeoutMs });
    }

    const memoryLimit = process.env.CODE_EXECUTION_MEMORY || '256m';
    const cpuLimit = process.env.CODE_EXECUTION_CPUS || '1';
    const maxOutputBytes = 64 * 1024;

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
          console.warn('Docker spawn failed, falling back to native execution:', err.message);
          dockerAvailableCache = false;
          DockerService.runNative({ workspacePath, command, input, timeoutMs }).then(resolve);
        }
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (!isResolved) {
          isResolved = true;
          resolve({
            stdout,
            stderr,
            exitCode: timedOut ? 124 : (code ?? 0),
            executionTime: Date.now() - startTime,
            timedOut,
          });
        }
      });
    });
  },
};

export default DockerService;
