// ──────────────────────────────────────────────
// Async Handler Middleware
// ──────────────────────────────────────────────
// Wraps async route handlers so that any rejected
// promise is automatically forwarded to Express's
// next(err) — eliminating repetitive try/catch blocks.
// ──────────────────────────────────────────────

/**
 * Wrap an async Express route handler.
 *
 * @param {Function} fn  Async function (req, res, next) => Promise
 * @returns {Function}   Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
