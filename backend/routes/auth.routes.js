// ──────────────────────────────────────────────
// Auth Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { signup, login, logout, getCurrentUser } from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import { signupValidation, loginValidation } from '../validations/auth.validation.js';

const router = Router();

// POST /api/auth/signup — Register a new student user
router.post('/signup', validate(signupValidation), signup);

// POST /api/auth/login — Authenticate user
router.post('/login', validate(loginValidation), login);

// POST /api/auth/logout — Destroy session
router.post('/logout', isAuthenticated, logout);

// GET /api/auth/me — Get current authenticated user
router.get('/me', isAuthenticated, getCurrentUser);

export default router;
