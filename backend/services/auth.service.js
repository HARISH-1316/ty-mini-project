// ──────────────────────────────────────────────
// Auth Service — Business Logic
// ──────────────────────────────────────────────

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.model.js';
import StudentModel from '../models/student.model.js';
import FacultyModel from '../models/faculty.model.js';
import PasswordResetTokenModel from '../models/passwordResetToken.model.js';
import { getClient } from '../config/database.js';

const SALT_ROUNDS = 12;

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const AuthService = {
  /**
   * Register a new student user.
   * Role is ALWAYS 'student', approval_status is ALWAYS 'pending'.
   */
  signupStudent: async ({ name, email, password, roll_number, course, year, phone }) => {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Check existing account
    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) {
      if (existingUser.approval_status === 'pending') {
        const error = new Error('An account with this email is already registered and awaiting administrator approval.');
        error.statusCode = 409;
        throw error;
      }
      if (existingUser.approval_status === 'rejected') {
        const error = new Error(`Your previous registration was rejected (${existingUser.rejection_reason || 'Administrative rejection'}). Please contact administration.`);
        error.statusCode = 409;
        throw error;
      }
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // 2. Check duplicate roll_number
    if (roll_number) {
      const existingRoll = await StudentModel.findByRollNumber(roll_number.trim());
      if (existingRoll) {
        const error = new Error('A student with this roll number already exists.');
        error.statusCode = 409;
        throw error;
      }
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. PostgreSQL Transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const newUser = await UserModel.create(
        {
          name: name.trim(),
          email: normalizedEmail,
          password_hash: hashedPassword,
          role: 'student',
          approval_status: 'pending',
        },
        client
      );

      const newStudent = await StudentModel.create(
        {
          user_id: newUser.user_id,
          roll_number: roll_number ? roll_number.trim() : null,
          course: course ? course.trim() : null,
          year: year ? parseInt(year, 10) : null,
          phone: phone ? phone.trim() : null,
        },
        client
      );

      await client.query('COMMIT');

      return {
        ...newUser,
        student: newStudent,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Register a new faculty user.
   * Role is ALWAYS 'faculty', approval_status is ALWAYS 'pending'.
   */
  signupFaculty: async ({ name, email, password, department, designation, specialization, phone }) => {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Check existing account
    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) {
      if (existingUser.approval_status === 'pending') {
        const error = new Error('A faculty account with this email is already registered and awaiting administrator approval.');
        error.statusCode = 409;
        throw error;
      }
      if (existingUser.approval_status === 'rejected') {
        const error = new Error(`Your previous faculty registration was rejected (${existingUser.rejection_reason || 'Administrative rejection'}). Please contact administration.`);
        error.statusCode = 409;
        throw error;
      }
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. PostgreSQL Transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const newUser = await UserModel.create(
        {
          name: name.trim(),
          email: normalizedEmail,
          password_hash: hashedPassword,
          role: 'faculty',
          approval_status: 'pending',
        },
        client
      );

      const newFaculty = await FacultyModel.create(
        {
          user_id: newUser.user_id,
          department: department ? department.trim() : null,
          designation: designation ? designation.trim() : null,
          specialization: specialization ? specialization.trim() : null,
          phone: phone ? phone.trim() : null,
        },
        client
      );

      await client.query('COMMIT');

      return {
        ...newUser,
        faculty: newFaculty,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Backward-compatible alias for student signup.
   */
  signup: async (data) => {
    return AuthService.signupStudent(data);
  },

  /**
   * Request password reset token.
   * Returns a generic response to prevent user enumeration.
   */
  forgotPassword: async (email) => {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await UserModel.findByEmail(normalizedEmail);

    let resetToken = null;

    if (user && user.approval_status === 'approved') {
      // Invalidate existing unused tokens
      await PasswordResetTokenModel.invalidateAllForUser(user.user_id);

      // Generate secure 32-byte token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);

      // 15 minutes expiration
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await PasswordResetTokenModel.create({
        user_id: user.user_id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });

      resetToken = rawToken;
      console.log(`[PASSWORD RESET] Reset link generated for ${normalizedEmail}: /reset-password?token=${rawToken}`);
    }

    return {
      message: 'If an account with that email exists and is approved, password reset instructions have been sent.',
      // Provide token in dev/test environment for easy testing
      ...(process.env.NODE_ENV !== 'production' && resetToken ? { testResetToken: resetToken } : {}),
    };
  },

  /**
   * Verify password reset token validity.
   */
  verifyResetToken: async (rawToken) => {
    if (!rawToken || typeof rawToken !== 'string') {
      const e = new Error('Password reset token is required.');
      e.statusCode = 400; throw e;
    }

    const tokenHash = hashToken(rawToken.trim());
    const tokenRecord = await PasswordResetTokenModel.findValidToken(tokenHash);

    if (!tokenRecord) {
      const e = new Error('Password reset token is invalid, expired, or has already been used.');
      e.statusCode = 400; throw e;
    }

    return {
      valid: true,
      email: tokenRecord.email,
    };
  },

  /**
   * Reset password using a valid token.
   */
  resetPassword: async (rawToken, newPassword) => {
    if (!rawToken || typeof rawToken !== 'string') {
      const e = new Error('Password reset token is required.');
      e.statusCode = 400; throw e;
    }

    const tokenHash = hashToken(rawToken.trim());
    const tokenRecord = await PasswordResetTokenModel.findValidToken(tokenHash);

    if (!tokenRecord) {
      const e = new Error('Password reset token is invalid, expired, or has already been used.');
      e.statusCode = 400; throw e;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Update password and invalidate user sessions
      await UserModel.updatePassword(tokenRecord.user_id, hashedPassword, client);

      // Invalidate the reset token
      await PasswordResetTokenModel.markAsUsed(tokenRecord.token_id);

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Your password has been reset successfully. Please log in with your new password.',
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

export default AuthService;
