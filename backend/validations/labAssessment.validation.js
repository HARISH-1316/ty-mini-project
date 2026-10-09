// ──────────────────────────────────────────────
// Lab Assessment Validation Schemas (Joi)
// ──────────────────────────────────────────────

import Joi from 'joi';

// ── Faculty: Create/Update Lab Assessment ──────
export const createLabAssessmentValidation = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(2000).optional().allow(''),
  start_time: Joi.date().iso().required().messages({
    'any.required': 'Start time is required',
  }),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).required().messages({
    'date.greater': 'End time must be after start time',
    'any.required': 'End time is required',
  }),
  duration: Joi.number().integer().min(5).max(480).required().messages({
    'number.min': 'Duration must be at least 5 minutes',
    'number.max': 'Duration cannot exceed 480 minutes (8 hours)',
    'any.required': 'Duration in minutes is required',
  }),
  num_questions: Joi.number().integer().min(1).max(50).default(5),
  marks_per_question: Joi.number().integer().min(1).max(100).default(10),
  topic_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
});

export const updateLabAssessmentValidation = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(2000).optional().allow(''),
  start_time: Joi.date().iso().optional(),
  end_time: Joi.date().iso().optional(),
  duration: Joi.number().integer().min(5).max(480).optional(),
  num_questions: Joi.number().integer().min(1).max(50).optional(),
  marks_per_question: Joi.number().integer().min(1).max(100).optional(),
  topic_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
});

// ── Faculty: Add Topic to Assessment ──────────
export const addTopicValidation = Joi.object({
  topic_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Topic ID is required',
  }),
});

// ── Faculty: Create Lab Question ───────────────
export const createLabQuestionValidation = Joi.object({
  topic_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Topic ID is required',
  }),
  title: Joi.string().min(3).max(300).required().messages({
    'any.required': 'Question title is required',
  }),
  problem_statement: Joi.string().min(10).required().messages({
    'any.required': 'Problem statement is required',
    'string.min': 'Problem statement must be at least 10 characters',
  }),
  input_format: Joi.string().optional().allow(''),
  output_format: Joi.string().optional().allow(''),
  constraints: Joi.string().optional().allow(''),
  sample_input: Joi.string().optional().allow(''),
  sample_output: Joi.string().optional().allow(''),
  explanation: Joi.string().optional().allow(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  marks: Joi.number().integer().min(1).max(100).default(10),
  order_index: Joi.number().integer().optional(),
});

export const updateLabQuestionValidation = Joi.object({
  topic_id: Joi.number().integer().positive().optional(),
  title: Joi.string().min(3).max(300).optional(),
  problem_statement: Joi.string().min(10).optional(),
  input_format: Joi.string().optional().allow(''),
  output_format: Joi.string().optional().allow(''),
  constraints: Joi.string().optional().allow(''),
  sample_input: Joi.string().optional().allow(''),
  sample_output: Joi.string().optional().allow(''),
  explanation: Joi.string().optional().allow(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  marks: Joi.number().integer().min(1).max(100).optional(),
  order_index: Joi.number().integer().optional(),
});

// ── Test Case Management ────────────────────────
export const labTestCaseValidation = Joi.object({
  input: Joi.string().optional().allow(''),
  expected_output: Joi.string().required().messages({
    'any.required': 'Expected output is required',
  }),
  is_hidden: Joi.boolean().default(false),
  order_index: Joi.number().integer().optional(),
});

// ── Student: Run Code ──────────────────────────
export const laRunCodeValidation = Joi.object({
  lab_question_id: Joi.number().integer().positive().required(),
  language: Joi.string().valid('c', 'cpp', 'java', 'python', 'C', 'C++', 'Java', 'Python').required(),
  code: Joi.string().min(1).required(),
  input: Joi.string().optional().allow(''),
});

// ── Student: Submit Question ───────────────────
export const laSubmitQuestionValidation = Joi.object({
  lab_question_id: Joi.number().integer().positive().required(),
  language: Joi.string().valid('c', 'cpp', 'java', 'python', 'C', 'C++', 'Java', 'Python').required(),
  code: Joi.string().min(1).required(),
});
