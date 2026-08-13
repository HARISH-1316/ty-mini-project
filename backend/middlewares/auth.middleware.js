// ──────────────────────────────────────────────
// Authentication & Authorisation Middlewares
// ──────────────────────────────────────────────

import { errorResponse } from '../utils/response.js';

/**
 * Ensure the request comes from an authenticated user.
 * Relies on Passport.js populating req.isAuthenticated().
 */
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return errorResponse(res, 401, 'Authentication required. Please log in.');
};

/**
 * Restrict access to users with the student role.
 * Must be used AFTER isAuthenticated.
 */
export const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }

  return errorResponse(res, 403, 'Access denied. Students only.');
};

/**
 * Restrict access to users with the faculty role.
 * Must be used AFTER isAuthenticated.
 */
export const isFaculty = (req, res, next) => {
  if (req.user && req.user.role === 'faculty') {
    return next();
  }

  return errorResponse(res, 403, 'Access denied. Faculty only.');
};

/**
 * Restrict access to users with the admin role.
 * Must be used AFTER isAuthenticated.
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return errorResponse(res, 403, 'Access denied. Admins only.');
};

/**
 * Restrict access to users with faculty OR admin role.
 * Must be used AFTER isAuthenticated.
 */
export const isFacultyOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    return next();
  }

  return errorResponse(res, 403, 'Access denied. Faculty or Admin privileges required.');
};
