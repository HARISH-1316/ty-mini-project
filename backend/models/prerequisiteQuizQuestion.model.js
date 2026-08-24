// ──────────────────────────────────────────────
// Prerequisite Quiz Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const PrerequisiteQuizQuestionModel = {
  create: async ({ prereq_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index }) => {
    const result = await query(
      `INSERT INTO prerequisite_quiz_questions (prereq_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [prereq_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks || 1, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (pqQuestionId) => {
    const result = await query(
      'SELECT * FROM prerequisite_quiz_questions WHERE pq_question_id = $1',
      [pqQuestionId]
    );
    return result.rows[0] || null;
  },

  findByQuizId: async (prereqQuizId) => {
    const result = await query(
      'SELECT * FROM prerequisite_quiz_questions WHERE prereq_quiz_id = $1 ORDER BY order_index NULLS LAST, pq_question_id',
      [prereqQuizId]
    );
    return result.rows;
  },

  /**
   * For student test attempts — excludes correct_option.
   */
  findByQuizIdForStudent: async (prereqQuizId) => {
    const result = await query(
      `SELECT pq_question_id, prereq_quiz_id, question_text, option_a, option_b, option_c, option_d, marks, order_index
       FROM prerequisite_quiz_questions
       WHERE prereq_quiz_id = $1
       ORDER BY order_index NULLS LAST, pq_question_id`,
      [prereqQuizId]
    );
    return result.rows;
  },

  update: async (pqQuestionId, { question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index }) => {
    const result = await query(
      `UPDATE prerequisite_quiz_questions
       SET question_text = COALESCE($1, question_text),
           option_a = COALESCE($2, option_a),
           option_b = COALESCE($3, option_b),
           option_c = COALESCE($4, option_c),
           option_d = COALESCE($5, option_d),
           correct_option = COALESCE($6, correct_option),
           marks = COALESCE($7, marks),
           order_index = COALESCE($8, order_index)
       WHERE pq_question_id = $9
       RETURNING *`,
      [question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index, pqQuestionId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (pqQuestionId) => {
    const result = await query(
      'DELETE FROM prerequisite_quiz_questions WHERE pq_question_id = $1 RETURNING pq_question_id',
      [pqQuestionId]
    );
    return result.rows[0] || null;
  },
};

export default PrerequisiteQuizQuestionModel;
