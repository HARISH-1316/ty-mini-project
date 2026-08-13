// ──────────────────────────────────────────────
// Reusable Response Helpers
// ──────────────────────────────────────────────
// Every controller must use these functions
// instead of manually writing res.status().json().
// ──────────────────────────────────────────────

/**
 * Send a standardised success response.
 *
 * @param {import('express').Response} res
 * @param {number}  statusCode  HTTP status code (e.g. 200, 201)
 * @param {string}  message     Human-readable success message
 * @param {*}       [data=null] Optional payload
 */
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a standardised error response.
 *
 * @param {import('express').Response} res
 * @param {number}  statusCode  HTTP status code (e.g. 400, 401, 500)
 * @param {string}  message     Human-readable error message
 * @param {*}       [errors=null] Optional error details (e.g. Joi validation errors)
 */
export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
