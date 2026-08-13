// ──────────────────────────────────────────────
// Auth Controller
// ──────────────────────────────────────────────
// Receives requests, delegates to services, and
// returns responses using standardised helpers.
// No business logic lives here.
// ──────────────────────────────────────────────

import passport from 'passport';
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

/**
 * POST /api/auth/signup
 * Register a new student user (role is ALWAYS student).
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, roll_number, course, year, phone } = req.body;

  const result = await AuthService.signup({
    name,
    email,
    password,
    roll_number,
    course,
    year,
    phone,
  });

  return successResponse(res, 201, 'Student account created successfully.', { user: result });
});

/**
 * POST /api/auth/login
 * Authenticate user via Passport Local Strategy (email + password).
 */
export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return errorResponse(res, 401, info?.message || 'Invalid email or password.');
    }

    // Establish a login session
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      return successResponse(res, 200, 'Logged in successfully.', { user });
    });
  })(req, res, next);
};

/**
 * POST /api/auth/logout
 * Destroy session and clear cookie.
 */
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return next(destroyErr);
      }

      res.clearCookie('connect.sid');
      return successResponse(res, 200, 'Logged out successfully.');
    });
  });
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user with profile details.
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const fullUser = await UserService.getUserById(req.user.user_id);
  return successResponse(res, 200, 'Current user retrieved.', { user: fullUser });
});
