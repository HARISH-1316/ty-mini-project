// ──────────────────────────────────────────────
// User Service — Business Logic
// ──────────────────────────────────────────────

import UserModel from '../models/user.model.js';
import StudentModel from '../models/student.model.js';
import FacultyModel from '../models/faculty.model.js';

const UserService = {
  /**
   * Retrieve all users with role-specific profiles.
   */
  getAllUsers: async () => {
    const users = await UserModel.findAll();
    return users;
  },

  /**
   * Retrieve a single user by ID with full profile.
   */
  getUserById: async (userId) => {
    const user = await UserModel.findByIdSafe(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentModel.findByUserId(userId);
    } else if (user.role === 'faculty') {
      profile = await FacultyModel.findByUserId(userId);
    }

    return {
      ...user,
      profile,
    };
  },

  /**
   * Get registration approvals list (pending, approved, rejected).
   */
  getApprovals: async ({ status = null, role = null } = {}) => {
    return UserModel.findApprovals({ status, role });
  },

  /**
   * Approve a pending account registration.
   */
  approveUser: async (userId, adminUserId) => {
    const user = await UserModel.findByIdSafe(userId);
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await UserModel.setApprovalStatus(userId, {
      status: 'approved',
      rejection_reason: null,
      decisionByUserId: adminUserId,
    });

    return updated;
  },

  /**
   * Reject a registration with an optional reason and revoke active sessions.
   */
  rejectUser: async (userId, reason, adminUserId) => {
    const user = await UserModel.findByIdSafe(userId);
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    if (parseInt(userId, 10) === parseInt(adminUserId, 10)) {
      const error = new Error('Administrators cannot reject their own account.');
      error.statusCode = 400;
      throw error;
    }

    const updated = await UserModel.setApprovalStatus(userId, {
      status: 'rejected',
      rejection_reason: reason || 'Registration rejected by administrator.',
      decisionByUserId: adminUserId,
    });

    return updated;
  },

  /**
   * Update a user's role (Restricted / Disabled).
   * Prevents arbitrary role changes as required by security policy.
   */
  updateUserRole: async (targetUserId, newRole, performingAdminId) => {
    const error = new Error(
      'Direct role modifications are disabled. User accounts are created with dedicated roles during registration and must be verified through the account approval workflow.'
    );
    error.statusCode = 403;
    throw error;
  },
};

export default UserService;
