// ──────────────────────────────────────────────
// Safe Output Comparator Utility
// ──────────────────────────────────────────────

export const normalizeOutput = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\r\n/g, '\n')       // Convert Windows CRLF to LF
    .replace(/\r/g, '\n')         // Convert old Mac CR to LF
    .split('\n')
    .map((line) => line.trimEnd()) // Trim trailing spaces/tabs on each line
    .join('\n')
    .trim();                      // Trim leading and trailing blank lines
};

export const compareOutputs = (actual, expected) => {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  return {
    isMatch: normActual === normExpected,
    actual: normActual,
    expected: normExpected,
  };
};

export default {
  normalizeOutput,
  compareOutputs,
};
