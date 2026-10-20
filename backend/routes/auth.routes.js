// ──────────────────────────────────────────────
// Auth Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  signup,
  signupFaculty,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  signupValidation,
  facultySignupValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyResetTokenValidation,
  resetPasswordValidation,
} from '../validations/auth.validation.js';

const router = Router();

// POST /api/auth/signup & /api/auth/signup/student — Register a new student user
router.post('/signup', validate(signupValidation), signup);
router.post('/signup/student', validate(signupValidation), signup);

// POST /api/auth/signup/faculty — Register a new faculty user
router.post('/signup/faculty', validate(facultySignupValidation), signupFaculty);
router.post('/signup-faculty', validate(facultySignupValidation), signupFaculty);

// POST /api/auth/login — Authenticate user (with role tab verification)
router.post('/login', validate(loginValidation), login);

// POST /api/auth/logout — Destroy session
router.post('/logout', isAuthenticated, logout);

// GET /api/auth/me — Get current authenticated user
router.get('/me', isAuthenticated, getCurrentUser);

// Password Reset Routes
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/verify-reset-token', validate(verifyResetTokenValidation), verifyResetToken);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

export default router;
