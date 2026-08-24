// ──────────────────────────────────────────────
// Editor & Execution Request Validations
// ──────────────────────────────────────────────

import Joi from 'joi';

export const executeCodeValidation = Joi.object({
  language: Joi.string().valid('c', 'cpp', 'java', 'python', 'C', 'C++', 'Java', 'Python').required().messages({
    'any.only': 'Language must be one of: c, cpp, java, python',
    'any.required': 'Language is required',
  }),
  code: Joi.string().min(1).required().messages({
    'string.empty': 'Code cannot be empty',
    'any.required': 'Code is required',
  }),
  input: Joi.string().allow('').optional(),
});

export const submitCodeValidation = Joi.object({
  language: Joi.string().valid('c', 'cpp', 'java', 'python', 'C', 'C++', 'Java', 'Python').required().messages({
    'any.only': 'Language must be one of: c, cpp, java, python',
    'any.required': 'Language is required',
  }),
  code: Joi.string().min(1).required().messages({
    'string.empty': 'Code cannot be empty',
    'any.required': 'Code is required',
  }),
  questionId: Joi.number().integer().positive().required().messages({
    'number.base': 'Question ID must be a number',
    'any.required': 'Question ID is required',
  }),
  assessmentType: Joi.string().valid('topic', 'subtopic', 'lab', 'assignment').default('topic'),
});

export const questionManageValidation = Joi.object({
  title: Joi.string().max(200).optional().allow(''),
  problem_statement: Joi.string().required(),
  constraints: Joi.string().optional().allow(''),
  sample_input: Joi.string().optional().allow(''),
  sample_output: Joi.string().optional().allow(''),
  marks: Joi.number().integer().min(1).default(10),
  order_index: Joi.number().integer().optional(),
});

export const testCaseManageValidation = Joi.object({
  input: Joi.string().optional().allow(''),
  expected_output: Joi.string().required(),
  is_hidden: Joi.boolean().default(false),
  order_index: Joi.number().integer().optional(),
});
