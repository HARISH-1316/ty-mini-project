// ──────────────────────────────────────────────
// Joi Validation Schemas — Authentication
// ──────────────────────────────────────────────

import Joi from 'joi';

/**
 * Password rules:
 *  - Minimum 8 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *  - At least one special character (@$!%*?&)
 */
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordMessages = {
  'string.pattern.base':
    'Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&).',
};

// ── Signup Validation ─────────────────────────
// Note: NO role field. Every public signup becomes role = 'student'.
export const signupValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters.',
      'string.max': 'Name cannot exceed 100 characters.',
      'any.required': 'Name is required.',
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.',
    }),

  password: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      ...passwordMessages,
      'any.required': 'Password is required.',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match.',
      'any.required': 'Please confirm your password.',
    }),

  roll_number: Joi.string()
    .trim()
    .max(30)
    .required()
    .messages({
      'any.required': 'Roll number is required.',
    }),

  course: Joi.string()
    .trim()
    .max(100)
    .allow('', null),

  year: Joi.number()
    .integer()
    .min(1)
    .max(6)
    .allow(null),

  phone: Joi.string()
    .trim()
    .max(20)
    .allow('', null),
});

// ── Login Validation ──────────────────────────
export const loginValidation = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required.',
    }),
});

// ── Update Role Validation (Admin only) ───────
export const updateRoleValidation = Joi.object({
  role: Joi.string()
    .valid('student', 'faculty', 'admin')
    .required()
    .messages({
      'any.only': 'Role must be one of: student, faculty, admin.',
      'any.required': 'Role is required.',
    }),

  // Optional profile details when switching roles
  roll_number: Joi.string().trim().max(30).allow('', null),
  course: Joi.string().trim().max(100).allow('', null),
  year: Joi.number().integer().min(1).max(6).allow(null),
  designation: Joi.string().trim().max(100).allow('', null),
  department: Joi.string().trim().max(100).allow('', null),
  specialization: Joi.string().trim().max(100).allow('', null),
  phone: Joi.string().trim().max(20).allow('', null),
});
