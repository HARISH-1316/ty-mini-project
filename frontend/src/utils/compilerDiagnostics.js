// ──────────────────────────────────────────────
// Compiler Error Parser & Monaco Marker Generator
// ──────────────────────────────────────────────
// Extracts source code line and column numbers from
// compiler outputs (GCC, G++, Clang, OpenJDK, Python)
// and returns Monaco Editor diagnostic markers.
// ──────────────────────────────────────────────

/**
 * Parses raw compiler or runtime stderr string and produces Monaco markers.
 *
 * @param {string} errorText - Stderr or error text from execution service
 * @param {object} monaco - Monaco namespace object
 * @returns {Array<object>} Array of Monaco IMarkerData objects
 */
export const parseCompilerErrors = (errorText, monaco) => {
  if (!errorText || !monaco || typeof errorText !== 'string') return [];

  const markers = [];
  const lines = errorText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. GCC / G++ style:
    // solution.cpp:8:5: error: expected ';' before 'return'
    // /app/tmp/.../solution.c:12:15: warning: unused variable 'x'
    const gccMatch = line.match(/(?:solution|main|file|[a-zA-Z0-9_\-\/\\]+)\.(?:cpp|c|cc|h):(\d+):(?:(\d+):)?\s*(error|warning|fatal error)?:\s*(.*)/i);
    if (gccMatch) {
      const lineNum = Math.max(1, parseInt(gccMatch[1], 10));
      const colNum = gccMatch[2] ? Math.max(1, parseInt(gccMatch[2], 10)) : 1;
      const isWarning = (gccMatch[3] || '').toLowerCase().includes('warning');
      const msg = (gccMatch[4] || line).trim();

      markers.push({
        startLineNumber: lineNum,
        startColumn: colNum,
        endLineNumber: lineNum,
        endColumn: colNum + 15,
        message: msg,
        severity: isWarning ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
      });
      continue;
    }

    // 2. Java (javac) style:
    // Main.java:6: error: cannot find symbol
    const javaMatch = line.match(/(?:Main|[a-zA-Z0-9_\-\/\\]+)\.java:(\d+):\s*(error|warning)?:\s*(.*)/i);
    if (javaMatch) {
      const lineNum = Math.max(1, parseInt(javaMatch[1], 10));
      const isWarning = (javaMatch[2] || '').toLowerCase().includes('warning');
      const msg = (javaMatch[3] || line).trim();

      markers.push({
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: 100,
        message: msg,
        severity: isWarning ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
      });
      continue;
    }

    // 3. Python traceback / SyntaxError:
    // File "solution.py", line 4
    // File "/app/tmp/solution.py", line 12, in <module>
    const pyMatch = line.match(/File\s+["'].*?["'],\s+line\s+(\d+)(?:,\s+in\s+.*)?/i);
    if (pyMatch) {
      const lineNum = Math.max(1, parseInt(pyMatch[1], 10));
      // Next line or two usually contains the actual exception message
      let msg = line.trim();
      if (i + 1 < lines.length && lines[i + 1].trim()) {
        msg = `${lines[i + 1].trim()}`;
        if (i + 2 < lines.length && lines[i + 2].trim()) {
          msg += `: ${lines[i + 2].trim()}`;
        }
      }

      markers.push({
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: 100,
        message: msg,
        severity: monaco.MarkerSeverity.Error,
      });
      continue;
    }
  }

  return markers;
};

export default parseCompilerErrors;
