// ──────────────────────────────────────────────
// LA Question Submission Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Tracks individual question submissions within an LA attempt.
// Uses UPSERT — latest valid submission overwrites previous.
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaQuestionSubmissionModel = {
  /**
   * Upsert a question submission (latest submission wins).
   * Only allowed when attempt is in_progress.
   */
  upsert: async ({
    attempt_id,
    lab_question_id,
    source_code,
    language,
    status,
    passed_test_cases,
    total_test_cases,
    marks_obtained,
  }) => {
    const result = await query(
      `INSERT INTO la_question_submissions
         (attempt_id, lab_question_id, source_code, language,
          status, passed_test_cases, total_test_cases, marks_obtained, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (attempt_id, lab_question_id)
       DO UPDATE SET
         source_code = EXCLUDED.source_code,
         language = EXCLUDED.language,
         status = EXCLUDED.status,
         passed_test_cases = EXCLUDED.passed_test_cases,
         total_test_cases = EXCLUDED.total_test_cases,
         marks_obtained = EXCLUDED.marks_obtained,
         submitted_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        attempt_id,
        lab_question_id,
        source_code,
        language,
        status,
        passed_test_cases,
        total_test_cases,
        marks_obtained,
      ]
    );
    return result.rows[0];
  },

  /**
   * Get all submissions for an attempt (student view — no hidden TC details).
   */
  findByAttemptId: async (attemptId) => {
    const result = await query(
      `SELECT
         s.submission_id,
         s.lab_question_id,
         s.source_code,
         s.language,
         s.status,
         s.passed_test_cases,
         s.total_test_cases,
         s.marks_obtained,
         s.submitted_at
       FROM la_question_submissions s
       WHERE s.attempt_id = $1
       ORDER BY s.submitted_at DESC`,
      [attemptId]
    );
    return result.rows;
  },

  /**
   * Get a single submission for an attempt+question.
   */
  findByAttemptAndQuestion: async (attemptId, labQuestionId) => {
    const result = await query(
      `SELECT * FROM la_question_submissions
       WHERE attempt_id = $1 AND lab_question_id = $2`,
      [attemptId, labQuestionId]
    );
    return result.rows[0] || null;
  },

  /**
   * Get total obtained marks for an attempt (sum of all question marks).
   */
  getTotalObtainedMarks: async (attemptId) => {
    const result = await query(
      `SELECT COALESCE(SUM(marks_obtained), 0)::INT AS total
       FROM la_question_submissions
       WHERE attempt_id = $1`,
      [attemptId]
    );
    return result.rows[0]?.total || 0;
  },

  /**
   * Get all submissions for a lab (faculty results view — includes source_code).
   */
  findByLabId: async (labId) => {
    const result = await query(
      `SELECT
         qs.*,
         a.student_id,
         s.roll_number,
         u.name AS student_name,
         lcq.title AS question_title
       FROM la_question_submissions qs
       JOIN la_attempts a ON qs.attempt_id = a.attempt_id
       JOIN student s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       JOIN lab_coding_questions lcq ON qs.lab_question_id = lcq.lab_question_id
       WHERE a.lab_id = $1
       ORDER BY u.name, qs.submitted_at`,
      [labId]
    );
    return result.rows;
  },
};

export default LaQuestionSubmissionModel;
