// ──────────────────────────────────────────────
// User Controller
// ──────────────────────────────────────────────
// Admin-level user management endpoints.
// No business logic — delegates to UserService.
// ──────────────────────────────────────────────

import UserService from '../services/user.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

/**
 * GET /api/users
 * Return all users (admin only).
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserService.getAllUsers();
  return successResponse(res, 200, 'Users retrieved successfully.', { users });
});

/**
 * GET /api/users/:userId
 * Return user details by ID.
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await UserService.getUserById(userId);
  return successResponse(res, 200, 'User retrieved successfully.', { user });
});

/**
 * PATCH /api/users/:userId/role
 * Update a user's role (admin only).
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role, ...profileData } = req.body;
  const performingAdminId = req.user.user_id;

  const updatedUser = await UserService.updateUserRole(
    userId,
    role,
    performingAdminId,
    profileData
  );

  return successResponse(res, 200, 'User role updated successfully.', { user: updatedUser });
});
