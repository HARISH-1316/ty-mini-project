// ──────────────────────────────────────────────
// Joi Validation Schemas — Subtopic Content
// ──────────────────────────────────────────────

import Joi from 'joi';

export const upsertSubtopicContentValidation = Joi.object({
  aim: Joi.string().trim().required().messages({
    'string.empty': 'Aim cannot be empty.',
    'any.required': 'Aim is required.',
  }),
  theory: Joi.string().trim().required().messages({
    'string.empty': 'Theory cannot be empty.',
    'any.required': 'Theory is required.',
  }),
  video_explanation_url: Joi.string().trim().uri().allow('', null).messages({
    'string.uri': 'Video explanation URL must be a valid URL.',
  }),
});
