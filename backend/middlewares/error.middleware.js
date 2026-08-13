// ──────────────────────────────────────────────
// Global Error Handler Middleware
// ──────────────────────────────────────────────
// Catches all errors forwarded via next(err).
// Handles PostgreSQL-specific error codes gracefully.
// Must be the LAST middleware registered in app.js.
// ──────────────────────────────────────────────

import { errorResponse } from '../utils/response.js';

/**
 * Global error handling middleware.
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  // Log the full error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('──── ERROR ────');
    console.error(err);
    console.error('───────────────');
  }

  // ── PostgreSQL-specific errors ───────────────
  // 23505 — Unique constraint violation (e.g. duplicate email, roll_number, feedback)
  if (err.code === '23505') {
    const detail = err.detail || '';
    let message = 'A record with this information already exists.';

    if (detail.includes('email')) {
      message = 'An account with this email address already exists.';
    } else if (detail.includes('roll_number')) {
      message = 'A student with this roll number already exists.';
    } else if (detail.includes('room_code')) {
      message = 'A room with this room code already exists.';
    } else if (detail.includes('student_id, room_id') || detail.includes('student_rooms')) {
      message = 'You have already joined this room.';
    } else if (detail.includes('student_id, topic_id') || detail.includes('topic_feedback')) {
      message = 'You have already submitted feedback for this topic.';
    }

    return errorResponse(res, 409, message);
  }

  // 23503 — Foreign key violation
  if (err.code === '23503') {
    return errorResponse(res, 400, 'Referenced parent record does not exist.');
  }

  // 23514 — Check constraint violation (e.g. rating not between 1 and 5)
  if (err.code === '23514') {
    return errorResponse(res, 400, 'Data validation failed against database constraints.');
  }

  // ── Custom application errors ───────────────
  if (err.statusCode) {
    return errorResponse(res, err.statusCode, err.message, err.errors || null);
  }

  // ── Fallback — unexpected errors ────────────
  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  return errorResponse(res, statusCode, message);
};

export default globalErrorHandler;
