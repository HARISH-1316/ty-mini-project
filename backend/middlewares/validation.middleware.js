// ──────────────────────────────────────────────
// Joi Validation Middleware
// ──────────────────────────────────────────────
// Higher-order middleware that validates req.body
// against a supplied Joi schema.  Controllers
// never validate manually — they rely on this.
// ──────────────────────────────────────────────

import { errorResponse } from '../utils/response.js';

/**
 * Create a validation middleware for a given Joi schema.
 *
 * @param {import('joi').ObjectSchema} schema  Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // Collect ALL errors, not just the first
    stripUnknown: true,  // Remove fields not defined in the schema
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, ''),
    }));

    return errorResponse(res, 400, 'Validation failed.', errors);
  }

  // Replace req.body with the validated & sanitised value
  req.body = value;
  return next();
};

export default validate;
