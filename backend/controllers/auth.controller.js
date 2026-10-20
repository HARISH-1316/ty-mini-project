// ──────────────────────────────────────────────
// Auth Controller
// ──────────────────────────────────────────────
// Receives requests, delegates to services, and
// returns responses using standardised helpers.
// ──────────────────────────────────────────────

import passport from 'passport';
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

/**
 * POST /api/auth/signup / POST /api/auth/signup/student
 * Register a new student user (role: 'student', approval_status: 'pending').
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, roll_number, course, year, phone } = req.body;

  const result = await AuthService.signupStudent({
    name,
    email,
    password,
    roll_number,
    course,
    year,
    phone,
  });

  return successResponse(
    res,
    201,
    'Student registration submitted successfully. Your account is pending administrator approval before you can log in.',
    { user: result }
  );
});

/**
 * POST /api/auth/signup/faculty
 * Register a new faculty user (role: 'faculty', approval_status: 'pending').
 */
export const signupFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, department, designation, specialization, phone } = req.body;

  const result = await AuthService.signupFaculty({
    name,
    email,
    password,
    department,
    designation,
    specialization,
    phone,
  });

  return successResponse(
    res,
    201,
    'Faculty registration submitted successfully. Your account is pending administrator approval before you can log in.',
    { user: result }
  );
});

/**
 * POST /api/auth/login
 * Authenticate user via Passport Local Strategy.
 * Enforces role tab verification: role tab selected in UI must match actual stored role.
 */
export const login = (req, res, next) => {
  const requestedRole = req.body.role ? req.body.role.toLowerCase().trim() : null;

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      const statusCode = info?.status === 'pending' || info?.status === 'rejected' ? 403 : 401;
      return errorResponse(res, statusCode, info?.message || 'Invalid email or password.');
    }

    // Role Verification: Selected Tab must match the user's actual stored role
    if (requestedRole && user.role !== requestedRole) {
      const roleDisplayName = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      return errorResponse(
        res,
        403,
        `Access denied: This account is registered as a ${user.role}. Please sign in through the ${roleDisplayName} tab.`
      );
    }

    // Establish session
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

/**
 * POST /api/auth/forgot-password
 * Request password reset instructions.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  return successResponse(res, 200, result.message, result);
});

/**
 * POST /api/auth/verify-reset-token
 * Validate token prior to password update.
 */
export const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await AuthService.verifyResetToken(token);
  return successResponse(res, 200, 'Token is valid.', result);
});

/**
 * POST /api/auth/reset-password
 * Set new password using token.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await AuthService.resetPassword(token, password);
  return successResponse(res, 200, result.message, result);
});
