// ──────────────────────────────────────────────
// LA Attempt Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Tracks each student's attempt for a lab assessment.
// One attempt per (student, lab).
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaAttemptModel = {
  /**
   * Create a new attempt for a student.
   * effective_deadline = MIN(started_at + duration_minutes, end_time).
   */
  create: async (client, { lab_id, student_id, effective_deadline, total_marks }) => {
    const executor = client || { query };
    const result = await executor.query(
      `INSERT INTO la_attempts
         (lab_id, student_id, effective_deadline, status, total_marks, obtained_marks)
       VALUES ($1, $2, $3, 'in_progress', $4, 0)
       ON CONFLICT (lab_id, student_id) DO NOTHING
       RETURNING *`,
      [lab_id, student_id, effective_deadline, total_marks]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an attempt by student + lab.
   */
  findByStudentAndLab: async (studentId, labId) => {
    const result = await query(
      `SELECT * FROM la_attempts
       WHERE lab_id = $1 AND student_id = $2`,
      [labId, studentId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find all attempts for a lab (faculty view).
   */
  findByLabId: async (labId) => {
    const result = await query(
      `SELECT
         a.*,
         s.roll_number,
         u.name AS student_name,
         u.email AS student_email
       FROM la_attempts a
       JOIN student s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE a.lab_id = $1
       ORDER BY a.submitted_at DESC NULLS LAST, u.name`,
      [labId]
    );
    return result.rows;
  },

  /**
   * Mark attempt as submitted.
   */
  submit: async (attemptId, obtainedMarks) => {
    const result = await query(
      `UPDATE la_attempts
       SET status = 'submitted',
           submitted_at = CURRENT_TIMESTAMP,
           obtained_marks = $2
       WHERE attempt_id = $1
         AND status = 'in_progress'
       RETURNING *`,
      [attemptId, obtainedMarks]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark expired attempts as timed_out (called periodically or on access).
   */
  expireTimedOut: async () => {
    await query(
      `UPDATE la_attempts
       SET status = 'timed_out'
       WHERE status = 'in_progress'
         AND effective_deadline < CURRENT_TIMESTAMP`
    );
  },

  /**
   * Update obtained_marks for an attempt (after each question submission).
   */
  updateMarks: async (attemptId, obtainedMarks) => {
    await query(
      `UPDATE la_attempts SET obtained_marks = $2 WHERE attempt_id = $1`,
      [attemptId, obtainedMarks]
    );
  },

  /**
   * Get all attempts for a given student (across all labs).
   */
  findByStudentId: async (studentId) => {
    const result = await query(
      `SELECT a.*, la.title AS lab_title, la.start_time, la.end_time
       FROM la_attempts a
       JOIN lab_assessment la ON a.lab_id = la.lab_id
       WHERE a.student_id = $1
       ORDER BY a.started_at DESC`,
      [studentId]
    );
    return result.rows;
  },
};

export default LaAttemptModel;
