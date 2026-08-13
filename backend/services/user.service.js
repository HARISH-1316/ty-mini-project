// ──────────────────────────────────────────────
// User Service — Business Logic
// ──────────────────────────────────────────────

import UserModel from '../models/user.model.js';
import StudentModel from '../models/student.model.js';
import FacultyModel from '../models/faculty.model.js';
import { getClient } from '../config/database.js';

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
   * Update a user's role (Admin only).
   *
   * Transactionally updates users.role and manages student/faculty profile records:
   *  - student -> faculty: updates role, removes student record, creates faculty record
   *  - faculty -> student: updates role, removes faculty record, creates student record
   *  - to admin: updates role, removes old profile
   *  - from admin: updates role, creates new profile
   *
   * Safety checks:
   *  - Prevents changing own role (self-demotion)
   *  - Prevents demoting the LAST admin in the system
   *
   * @param {number} targetUserId  ID of user whose role is being changed
   * @param {string} newRole       New role ('student' | 'faculty' | 'admin')
   * @param {number} performingAdminId ID of admin executing the request
   * @param {object} [profileData] Optional profile fields for student/faculty
   */
  updateUserRole: async (targetUserId, newRole, performingAdminId, profileData = {}) => {
    // 1. Prevent admin from changing their own role
    if (parseInt(targetUserId, 10) === parseInt(performingAdminId, 10)) {
      const error = new Error('You cannot modify your own role.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Fetch target user
    const targetUser = await UserModel.findByIdSafe(targetUserId);
    if (!targetUser) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const currentRole = targetUser.role;

    // No-op if target role is same as current role
    if (currentRole === newRole) {
      return UserService.getUserById(targetUserId);
    }

    // 3. Prevent demoting the LAST admin
    if (currentRole === 'admin' && newRole !== 'admin') {
      const adminCount = await UserModel.countByRole('admin');
      if (adminCount <= 1) {
        const error = new Error('Cannot demote the last administrator in the system.');
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Transactional Role Update & Profile Management
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Update users.role
      await UserModel.updateRole(targetUserId, newRole, client);

      // Clean up old profiles if applicable
      if (currentRole === 'student') {
        await StudentModel.deleteByUserId(targetUserId, client);
      } else if (currentRole === 'faculty') {
        await FacultyModel.deleteByUserId(targetUserId, client);
      }

      // Create new profile if applicable
      if (newRole === 'student') {
        await StudentModel.create(
          {
            user_id: targetUserId,
            roll_number: profileData.roll_number || `TEMP_${Date.now()}`,
            course: profileData.course || null,
            year: profileData.year || null,
            phone: profileData.phone || null,
          },
          client
        );
      } else if (newRole === 'faculty') {
        await FacultyModel.create(
          {
            user_id: targetUserId,
            designation: profileData.designation || 'Assistant Professor',
            department: profileData.department || null,
            specialization: profileData.specialization || null,
            phone: profileData.phone || null,
          },
          client
        );
      }

      await client.query('COMMIT');

      // Return updated user with new profile
      return await UserService.getUserById(targetUserId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

export default UserService;
