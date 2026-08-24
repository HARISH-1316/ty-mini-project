// ──────────────────────────────────────────────
// Quiz Validation Schemas — Joi
// ──────────────────────────────────────────────

import Joi from 'joi';

export const questionValidation = Joi.object({
  question_text: Joi.string().trim().required().messages({
    'string.empty': 'Question text is required.',
    'any.required': 'Question text is required.',
  }),
  option_a: Joi.string().trim().required().messages({
    'string.empty': 'Option A is required.',
    'any.required': 'Option A is required.',
  }),
  option_b: Joi.string().trim().required().messages({
    'string.empty': 'Option B is required.',
    'any.required': 'Option B is required.',
  }),
  option_c: Joi.string().trim().required().messages({
    'string.empty': 'Option C is required.',
    'any.required': 'Option C is required.',
  }),
  option_d: Joi.string().trim().required().messages({
    'string.empty': 'Option D is required.',
    'any.required': 'Option D is required.',
  }),
  correct_option: Joi.string()
    .valid('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd')
    .custom((val) => val.toUpperCase())
    .required()
    .messages({
      'any.only': 'Correct option must be A, B, C, or D.',
      'any.required': 'Correct option is required.',
    }),
  marks: Joi.number().integer().min(1).default(1).messages({
    'number.min': 'Marks must be at least 1.',
  }),
  order_index: Joi.number().integer().min(1).allow(null).optional(),
});

export const updateQuestionValidation = Joi.object({
  question_text: Joi.string().trim().optional(),
  option_a: Joi.string().trim().optional(),
  option_b: Joi.string().trim().optional(),
  option_c: Joi.string().trim().optional(),
  option_d: Joi.string().trim().optional(),
  correct_option: Joi.string()
    .valid('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd')
    .custom((val) => val.toUpperCase())
    .optional()
    .messages({
      'any.only': 'Correct option must be A, B, C, or D.',
    }),
  marks: Joi.number().integer().min(1).optional(),
  order_index: Joi.number().integer().min(1).allow(null).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update.',
});

export const submitQuizValidation = Joi.object({
  answers: Joi.object().pattern(
    Joi.string(),
    Joi.string().valid('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd', '').allow(null)
  ).required().messages({
    'any.required': 'Answers payload is required.',
  }),
});

export const updatePrereqQuizConfigValidation = Joi.object({
  title: Joi.string().trim().optional(),
  total_marks: Joi.number().integer().min(1).optional(),
  passing_criteria: Joi.number().integer().min(0).max(100).optional(),
});

export const updateFinalQuizConfigValidation = Joi.object({
  title: Joi.string().trim().optional(),
  total_marks: Joi.number().integer().min(1).optional(),
  time_limit: Joi.number().integer().min(1).max(300).optional(),
});
