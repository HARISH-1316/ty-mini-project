// ──────────────────────────────────────────────
// Faculty Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const FacultyModel = {
  /**
   * Create a new faculty record.
   */
  create: async ({ user_id, designation, department, specialization, phone }, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      `INSERT INTO faculty (user_id, designation, department, specialization, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, designation, department, specialization, phone]
    );
    return result.rows[0];
  },

  /**
   * Find a faculty by user_id.
   */
  findByUserId: async (userId, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      'SELECT * FROM faculty WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a faculty by faculty_id.
   */
  findById: async (facultyId) => {
    const result = await query(
      'SELECT * FROM faculty WHERE faculty_id = $1',
      [facultyId]
    );
    return result.rows[0] || null;
  },

  /**
   * Return all faculty with joined user information.
   */
  findAll: async () => {
    const result = await query(
      `SELECT f.*, u.name, u.email, u.role, u.created_at, u.last_login
       FROM faculty f
       JOIN users u ON f.user_id = u.user_id
       ORDER BY f.faculty_id`
    );
    return result.rows;
  },

  /**
   * Update a faculty record.
   */
  update: async (facultyId, { designation, department, specialization, phone }) => {
    const result = await query(
      `UPDATE faculty
       SET designation = COALESCE($1, designation),
           department = COALESCE($2, department),
           specialization = COALESCE($3, specialization),
           phone = COALESCE($4, phone)
       WHERE faculty_id = $5
       RETURNING *`,
      [designation, department, specialization, phone, facultyId]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a faculty record by user_id.
   */
  deleteByUserId: async (userId, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      'DELETE FROM faculty WHERE user_id = $1 RETURNING *',
      [userId]
    );
    return result.rows[0] || null;
  },
};

export default FacultyModel;
