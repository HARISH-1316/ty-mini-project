// ──────────────────────────────────────────────
// User Routes (Admin & Self)
// ──────────────────────────────────────────────

import { Router } from 'express';
import { getAllUsers, getUserById, updateUserRole } from '../controllers/user.controller.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import { updateRoleValidation } from '../validations/auth.validation.js';

const router = Router();

// GET /api/users — List all users (admin only)
router.get('/', isAuthenticated, isAdmin, getAllUsers);

// GET /api/users/:userId — Get single user profile
router.get('/:userId', isAuthenticated, getUserById);

// PATCH /api/users/:userId/role — Update a user's role (admin only)
router.patch(
  '/:userId/role',
  isAuthenticated,
  isAdmin,
  validate(updateRoleValidation),
  updateUserRole
);

export default router;
