// ──────────────────────────────────────────────
// Lab Assessment MCQ Submission Model
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaMcqSubmissionModel = {
  upsert: async ({ attempt_id, mcq_id, selected_option, is_correct, marks_obtained }) => {
    const result = await query(
      `INSERT INTO la_mcq_submissions
         (attempt_id, mcq_id, selected_option, is_correct, marks_obtained, submitted_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (attempt_id, mcq_id)
       DO UPDATE SET
         selected_option = EXCLUDED.selected_option,
         is_correct = EXCLUDED.is_correct,
         marks_obtained = EXCLUDED.marks_obtained,
         submitted_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [attempt_id, mcq_id, selected_option ? selected_option.toUpperCase() : null, is_correct, marks_obtained]
    );
    return result.rows[0];
  },

  findByAttemptId: async (attemptId) => {
    const result = await query(
      `SELECT s.*, q.question_text, q.correct_option, q.explanation, q.marks AS max_marks
       FROM la_mcq_submissions s
       JOIN lab_mcq_questions q ON s.mcq_id = q.mcq_id
       WHERE s.attempt_id = $1
       ORDER BY s.submission_id ASC`,
      [attemptId]
    );
    return result.rows;
  },

  findByAttemptAndMcq: async (attemptId, mcqId) => {
    const result = await query(
      'SELECT * FROM la_mcq_submissions WHERE attempt_id = $1 AND mcq_id = $2',
      [attemptId, mcqId]
    );
    return result.rows[0] || null;
  },

  getTotalMarksForAttempt: async (attemptId, dbClient = null) => {
    const exec = dbClient ? (text, params) => dbClient.query(text, params) : query;
    const result = await exec(
      'SELECT COALESCE(SUM(marks_obtained), 0)::int AS total_mcq_marks FROM la_mcq_submissions WHERE attempt_id = $1',
      [attemptId]
    );
    return result.rows[0]?.total_mcq_marks || 0;
  },
};

export default LaMcqSubmissionModel;
