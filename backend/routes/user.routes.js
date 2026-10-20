// ──────────────────────────────────────────────
// User Routes (Admin & Self)
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  getAllUsers,
  getApprovals,
  approveUser,
  rejectUser,
  getUserById,
  updateUserRole,
} from '../controllers/user.controller.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import { rejectAccountValidation } from '../validations/auth.validation.js';

const router = Router();

// GET /api/users — List all users (admin only)
router.get('/', isAuthenticated, isAdmin, getAllUsers);

// GET /api/users/approvals — List registrations by status / role (admin only)
router.get('/approvals', isAuthenticated, isAdmin, getApprovals);

// PATCH /api/users/:userId/approve — Approve a user registration (admin only)
router.patch('/:userId/approve', isAuthenticated, isAdmin, approveUser);

// PATCH /api/users/:userId/reject — Reject a user registration with reason (admin only)
router.patch('/:userId/reject', isAuthenticated, isAdmin, validate(rejectAccountValidation), rejectUser);

// GET /api/users/:userId — Get single user profile
router.get('/:userId', isAuthenticated, getUserById);

// PATCH /api/users/:userId/role — Restricted role change endpoint (returns 403 Forbidden)
router.patch('/:userId/role', isAuthenticated, isAdmin, updateUserRole);

export default router;
