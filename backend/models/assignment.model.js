// ──────────────────────────────────────────────
// Assignment Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const AssignmentModel = {
  create: async ({ faculty_id, title, description, deadline, total_marks }) => {
    const result = await query(
      `INSERT INTO assignments (faculty_id, title, description, deadline, total_marks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [faculty_id, title, description || null, deadline || null, total_marks || 0]
    );
    return result.rows[0];
  },

  findById: async (assignmentId) => {
    const result = await query(
      `SELECT a.*, u.name AS faculty_name
       FROM assignments a
       JOIN faculty f ON a.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE a.assignment_id = $1`,
      [assignmentId]
    );
    return result.rows[0] || null;
  },

  findByFacultyId: async (facultyId) => {
    const result = await query(
      'SELECT * FROM assignments WHERE faculty_id = $1 ORDER BY deadline DESC',
      [facultyId]
    );
    return result.rows;
  },

  findAll: async () => {
    const result = await query(
      `SELECT a.*, u.name AS faculty_name
       FROM assignments a
       JOIN faculty f ON a.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       ORDER BY a.deadline DESC`
    );
    return result.rows;
  },

  update: async (assignmentId, { title, description, deadline, total_marks }) => {
    const result = await query(
      `UPDATE assignments
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           deadline = COALESCE($3, deadline),
           total_marks = COALESCE($4, total_marks)
       WHERE assignment_id = $5
       RETURNING *`,
      [title, description, deadline, total_marks, assignmentId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (assignmentId) => {
    const result = await query(
      'DELETE FROM assignments WHERE assignment_id = $1 RETURNING assignment_id',
      [assignmentId]
    );
    return result.rows[0] || null;
  },
};

export default AssignmentModel;
