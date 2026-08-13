// ──────────────────────────────────────────────
// Joi Validation Schemas — Room System
// ──────────────────────────────────────────────

import Joi from 'joi';

export const createRoomValidation = Joi.object({
  room_name: Joi.string().trim().max(150).required().messages({
    'any.required': 'Room name is required.',
  }),
  description: Joi.string().trim().allow('', null),
});

export const updateRoomValidation = Joi.object({
  room_name: Joi.string().trim().max(150).allow('', null),
  description: Joi.string().trim().allow('', null),
});

export const joinRoomValidation = Joi.object({
  room_code: Joi.string().trim().max(20).required().messages({
    'any.required': 'Room code is required.',
  }),
});

export const addTopicToRoomValidation = Joi.object({
  topic_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Topic ID is required.',
  }),
  order_index: Joi.number().integer().allow(null),
});
