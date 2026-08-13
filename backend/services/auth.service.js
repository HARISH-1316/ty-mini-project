// ──────────────────────────────────────────────
// Auth Service — Business Logic
// ──────────────────────────────────────────────

import bcrypt from 'bcrypt';
import UserModel from '../models/user.model.js';
import StudentModel from '../models/student.model.js';
import { getClient } from '../config/database.js';

const SALT_ROUNDS = 12;

const AuthService = {
  /**
   * Register a new student user.
   *
   * ALWAYS sets role = 'student'.
   * Ignores or rejects any client-supplied role.
   * Uses a PostgreSQL transaction so both users and student
   * records are created atomically or neither is created.
   *
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.email
   * @param {string} param0.password
   * @param {string} param0.roll_number
   * @param {string} [param0.course]
   * @param {number} [param0.year]
   * @param {string} [param0.phone]
   * @returns {Promise<object>} Created user and student profile (without password)
   */
  signup: async ({ name, email, password, roll_number, course, year, phone }) => {
    // 1. Check duplicate email
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // 2. Check duplicate roll_number
    if (roll_number) {
      const existingRoll = await StudentModel.findByRollNumber(roll_number);
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

      // Always force role = 'student' regardless of any client input
      const newUser = await UserModel.create(
        {
          name,
          email,
          password_hash: hashedPassword,
          role: 'student',
        },
        client
      );

      const newStudent = await StudentModel.create(
        {
          user_id: newUser.user_id,
          roll_number,
          course: course || null,
          year: year || null,
          phone: phone || null,
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
};

export default AuthService;
