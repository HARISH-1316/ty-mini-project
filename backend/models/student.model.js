// ──────────────────────────────────────────────
// Student Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const StudentModel = {
  /**
   * Create a new student record.
   */
  create: async ({ user_id, roll_number, course, year, phone }, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      `INSERT INTO student (user_id, roll_number, course, year, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, roll_number, course, year, phone]
    );
    return result.rows[0];
  },

  /**
   * Find a student by user_id.
   */
  findByUserId: async (userId, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      'SELECT * FROM student WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a student by student_id.
   */
  findById: async (studentId) => {
    const result = await query(
      'SELECT * FROM student WHERE student_id = $1',
      [studentId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a student by roll_number.
   */
  findByRollNumber: async (rollNumber) => {
    const result = await query(
      'SELECT * FROM student WHERE roll_number = $1',
      [rollNumber]
    );
    return result.rows[0] || null;
  },

  /**
   * Return all students with joined user information.
   */
  findAll: async () => {
    const result = await query(
      `SELECT s.*, u.name, u.email, u.role, u.created_at, u.last_login
       FROM student s
       JOIN users u ON s.user_id = u.user_id
       ORDER BY s.student_id`
    );
    return result.rows;
  },

  /**
   * Update a student record.
   */
  update: async (studentId, { roll_number, course, year, phone }) => {
    const result = await query(
      `UPDATE student
       SET roll_number = COALESCE($1, roll_number),
           course = COALESCE($2, course),
           year = COALESCE($3, year),
           phone = COALESCE($4, phone)
       WHERE student_id = $5
       RETURNING *`,
      [roll_number, course, year, phone, studentId]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a student record by user_id.
   */
  deleteByUserId: async (userId, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      'DELETE FROM student WHERE user_id = $1 RETURNING *',
      [userId]
    );
    return result.rows[0] || null;
  },
};

export default StudentModel;
