// ──────────────────────────────────────────────
// Quiz Attempt Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const QuizAttemptModel = {
  create: async ({ student_id, quiz_type, quiz_ref_id }) => {
    const result = await query(
      `INSERT INTO quiz_attempts (student_id, quiz_type, quiz_ref_id, started_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [student_id, quiz_type, quiz_ref_id]
    );
    return result.rows[0];
  },

  findById: async (attemptId) => {
    const result = await query(
      'SELECT * FROM quiz_attempts WHERE attempt_id = $1',
      [attemptId]
    );
    return result.rows[0] || null;
  },

  findByStudentId: async (studentId) => {
    const result = await query(
      `SELECT * FROM quiz_attempts
       WHERE student_id = $1
       ORDER BY started_at DESC`,
      [studentId]
    );
    return result.rows;
  },

  findByStudentAndQuiz: async (studentId, quizType, quizRefId) => {
    const result = await query(
      `SELECT * FROM quiz_attempts
       WHERE student_id = $1 AND quiz_type = $2 AND quiz_ref_id = $3
       ORDER BY started_at DESC`,
      [studentId, quizType, quizRefId]
    );
    return result.rows;
  },

  findLatestAttempt: async (studentId, quizType, quizRefId) => {
    const result = await query(
      `SELECT * FROM quiz_attempts
       WHERE student_id = $1 AND quiz_type = $2 AND quiz_ref_id = $3
       ORDER BY started_at DESC
       LIMIT 1`,
      [studentId, quizType, quizRefId]
    );
    return result.rows[0] || null;
  },

  submitAttempt: async (attemptId, { score, total_marks, percentage, correct_answers, incorrect_answers, unanswered, passed, answers }) => {
    const result = await query(
      `UPDATE quiz_attempts
       SET submitted_at = CURRENT_TIMESTAMP,
           score = $1,
           total_marks = $2,
           percentage = $3,
           correct_answers = $4,
           incorrect_answers = $5,
           unanswered = $6,
           passed = $7,
           answers = $8
       WHERE attempt_id = $9
       RETURNING *`,
      [
        score,
        total_marks,
        percentage,
        correct_answers,
        incorrect_answers,
        unanswered,
        passed,
        answers ? JSON.stringify(answers) : null,
        attemptId,
      ]
    );
    return result.rows[0] || null;
  },
};

export default QuizAttemptModel;
