// ──────────────────────────────────────────────
// Lab Assessment Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LabAssessmentModel = {
  create: async ({
    faculty_id,
    title,
    description,
    start_time,
    end_time,
    duration,
    total_marks,
    num_questions = 5,
    marks_per_question = 10,
  }) => {
    const result = await query(
      `INSERT INTO lab_assessment
         (faculty_id, title, description, start_time, end_time,
          duration, total_marks, num_questions, marks_per_question, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft')
       RETURNING *`,
      [
        faculty_id,
        title,
        description || null,
        start_time || null,
        end_time || null,
        duration || null,
        total_marks || (num_questions * marks_per_question),
        num_questions,
        marks_per_question,
      ]
    );
    return result.rows[0];
  },

  findById: async (labId) => {
    const result = await query(
      `SELECT la.*, u.name AS faculty_name, f.department
       FROM lab_assessment la
       LEFT JOIN faculty f ON la.faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       WHERE la.lab_id = $1`,
      [labId]
    );
    return result.rows[0] || null;
  },

  findByFacultyId: async (facultyId) => {
    const result = await query(
      `SELECT * FROM lab_assessment
       WHERE faculty_id = $1
       ORDER BY lab_id DESC`,
      [facultyId]
    );
    return result.rows;
  },

  findAll: async () => {
    const result = await query(
      `SELECT la.*, u.name AS faculty_name
       FROM lab_assessment la
       LEFT JOIN faculty f ON la.faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       ORDER BY la.lab_id DESC`
    );
    return result.rows;
  },

  /**
   * Find all published/active labs that a student is eligible to see.
   * Eligibility:
   * 1. Student enrolled in a room with matching topic, OR
   * 2. Student already attempted this lab, OR
   * 3. Student has not joined any rooms yet (global availability for student practice)
   */
  findEligibleForStudent: async (studentId) => {
    const result = await query(
      `SELECT DISTINCT la.*, u.name AS faculty_name
       FROM lab_assessment la
       LEFT JOIN faculty f ON la.faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       JOIN la_assessment_topics lat ON la.lab_id = lat.lab_id
       WHERE la.status IN ('published', 'active', 'completed')
         AND (la.end_time IS NULL OR la.end_time >= CURRENT_TIMESTAMP - INTERVAL '30 days')
         AND (
           EXISTS (
             SELECT 1 FROM room_topics rt
             JOIN student_rooms sr ON sr.room_id = rt.room_id
             WHERE sr.student_id = $1 AND rt.topic_id = lat.topic_id
           )
           OR EXISTS (
             SELECT 1 FROM la_attempts att
             WHERE att.student_id = $1 AND att.lab_id = la.lab_id
           )
           OR NOT EXISTS (
             SELECT 1 FROM student_rooms sr WHERE sr.student_id = $1
           )
         )
       ORDER BY la.start_time DESC NULLS LAST`,
      [studentId]
    );
    return result.rows;
  },

  update: async (labId, {
    title,
    description,
    start_time,
    end_time,
    duration,
    total_marks,
    num_questions,
    marks_per_question,
  }) => {
    const result = await query(
      `UPDATE lab_assessment
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           duration = COALESCE($5, duration),
           total_marks = COALESCE($6, total_marks),
           num_questions = COALESCE($7, num_questions),
           marks_per_question = COALESCE($8, marks_per_question)
       WHERE lab_id = $9
         AND status = 'draft'
       RETURNING *`,
      [title, description, start_time, end_time, duration, total_marks, num_questions, marks_per_question, labId]
    );
    return result.rows[0] || null;
  },

  updateStatus: async (labId, status) => {
    const result = await query(
      `UPDATE lab_assessment SET status = $2 WHERE lab_id = $1 RETURNING *`,
      [labId, status]
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

  /**
   * Auto-resolve statuses: published → active when start_time arrived,
   * active → completed when end_time passed.
   */
  syncStatuses: async () => {
    await query(
      `UPDATE lab_assessment
       SET status = 'active'
       WHERE status = 'published'
         AND start_time <= CURRENT_TIMESTAMP
         AND end_time > CURRENT_TIMESTAMP`
    );
    await query(
      `UPDATE lab_assessment
       SET status = 'completed'
       WHERE status IN ('published', 'active')
         AND end_time <= CURRENT_TIMESTAMP`
    );
  },
};

export default LabAssessmentModel;
