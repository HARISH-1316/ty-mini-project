// ──────────────────────────────────────────────
// User Controller
// ──────────────────────────────────────────────
// Admin-level user management & approval endpoints.
// ──────────────────────────────────────────────

import UserService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
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
 * GET /api/users/approvals
 * Return registrations filtered by approval_status and/or role (admin only).
 */
export const getApprovals = asyncHandler(async (req, res) => {
  const { status, role } = req.query;
  const approvals = await UserService.getApprovals({ status, role });
  return successResponse(res, 200, 'Registration approvals retrieved.', { approvals });
});

/**
 * PATCH /api/users/:userId/approve
 * Approve a pending registration (admin only).
 */
export const approveUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const adminUserId = req.user.user_id;
  const approved = await UserService.approveUser(parseInt(userId, 10), adminUserId);
  return successResponse(res, 200, 'User registration approved successfully.', { user: approved });
});

/**
 * PATCH /api/users/:userId/reject
 * Reject a registration with an optional reason (admin only).
 */
export const rejectUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  const adminUserId = req.user.user_id;
  const rejected = await UserService.rejectUser(parseInt(userId, 10), reason, adminUserId);
  return successResponse(res, 200, 'User registration rejected.', { user: rejected });
});

/**
 * GET /api/users/:userId
 * Return user details by ID (Admin or own profile).
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (req.user?.role !== 'admin' && parseInt(req.user?.user_id, 10) !== parseInt(userId, 10)) {
    return errorResponse(res, 403, 'Access denied. You can only view your own user profile.');
  }
  const user = await UserService.getUserById(userId);
  return successResponse(res, 200, 'User retrieved successfully.', { user });
});

/**
 * PATCH /api/users/:userId/role
 * Restricted/Disabled role change endpoint.
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const performingAdminId = req.user.user_id;

  const updatedUser = await UserService.updateUserRole(userId, role, performingAdminId);
  return successResponse(res, 200, 'User role updated successfully.', { user: updatedUser });
});
