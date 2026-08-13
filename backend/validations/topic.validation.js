// ──────────────────────────────────────────────
// Joi Validation Schemas — Topics & Feedback
// ──────────────────────────────────────────────

import Joi from 'joi';

export const createTopicValidation = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'any.required': 'Topic title is required.',
  }),
  description: Joi.string().trim().allow('', null),
});

export const updateTopicValidation = Joi.object({
  title: Joi.string().trim().max(200).allow('', null),
  description: Joi.string().trim().allow('', null),
});

export const topicFeedbackValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be between 1 and 5.',
    'number.max': 'Rating must be between 1 and 5.',
    'any.required': 'Rating is required.',
  }),
  comment: Joi.string().trim().allow('', null),
});

export const updateProgressValidation = Joi.object({
  status: Joi.string().valid('Not Started', 'In Progress', 'Completed').required().messages({
    'any.only': 'Status must be one of: Not Started, In Progress, Completed.',
    'any.required': 'Status is required.',
  }),
  time_spent: Joi.number().integer().min(0).allow(null),
});
