// ──────────────────────────────────────────────
// Lab Assessment Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LabAssessmentModel = {
  create: async ({ faculty_id, title, description, start_time, end_time, duration, total_marks }) => {
    const result = await query(
      `INSERT INTO lab_assessment (faculty_id, title, description, start_time, end_time, duration, total_marks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [faculty_id, title, description || null, start_time || null, end_time || null, duration || null, total_marks || 0]
    );
    return result.rows[0];
  },

  findById: async (labId) => {
    const result = await query(
      `SELECT la.*, u.name AS faculty_name
       FROM lab_assessment la
       JOIN faculty f ON la.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE la.lab_id = $1`,
      [labId]
    );
    return result.rows[0] || null;
  },

  findByFacultyId: async (facultyId) => {
    const result = await query(
      'SELECT * FROM lab_assessment WHERE faculty_id = $1 ORDER BY start_time DESC',
      [facultyId]
    );
    return result.rows;
  },

  findAll: async () => {
    const result = await query(
      `SELECT la.*, u.name AS faculty_name
       FROM lab_assessment la
       JOIN faculty f ON la.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       ORDER BY la.start_time DESC`
    );
    return result.rows;
  },

  update: async (labId, { title, description, start_time, end_time, duration, total_marks }) => {
    const result = await query(
      `UPDATE lab_assessment
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           duration = COALESCE($5, duration),
           total_marks = COALESCE($6, total_marks)
       WHERE lab_id = $7
       RETURNING *`,
      [title, description, start_time, end_time, duration, total_marks, labId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (labId) => {
    const result = await query(
      'DELETE FROM lab_assessment WHERE lab_id = $1 RETURNING lab_id',
      [labId]
    );
    return result.rows[0] || null;
  },
};

export default LabAssessmentModel;
