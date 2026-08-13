// ──────────────────────────────────────────────
// Final Quiz Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const FinalQuizQuestionModel = {
  create: async ({ final_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index }) => {
    const result = await query(
      `INSERT INTO final_quiz_questions (final_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [final_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks || 1, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (fqQuestionId) => {
    const result = await query(
      'SELECT * FROM final_quiz_questions WHERE fq_question_id = $1',
      [fqQuestionId]
    );
    return result.rows[0] || null;
  },

  findByQuizId: async (finalQuizId) => {
    const result = await query(
      'SELECT * FROM final_quiz_questions WHERE final_quiz_id = $1 ORDER BY order_index NULLS LAST, fq_question_id',
      [finalQuizId]
    );
    return result.rows;
  },

  /**
   * For student test attempts — excludes correct_option.
   */
  findByQuizIdForStudent: async (finalQuizId) => {
    const result = await query(
      `SELECT fq_question_id, final_quiz_id, question_text, option_a, option_b, option_c, option_d, marks, order_index
       FROM final_quiz_questions
       WHERE final_quiz_id = $1
       ORDER BY order_index NULLS LAST, fq_question_id`,
      [finalQuizId]
    );
    return result.rows;
  },

  update: async (fqQuestionId, { question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index }) => {
    const result = await query(
      `UPDATE final_quiz_questions
       SET question_text = COALESCE($1, question_text),
           option_a = COALESCE($2, option_a),
           option_b = COALESCE($3, option_b),
           option_c = COALESCE($4, option_c),
           option_d = COALESCE($5, option_d),
           correct_option = COALESCE($6, correct_option),
           marks = COALESCE($7, marks),
           order_index = COALESCE($8, order_index)
       WHERE fq_question_id = $9
       RETURNING *`,
      [question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index, fqQuestionId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (fqQuestionId) => {
    const result = await query(
      'DELETE FROM final_quiz_questions WHERE fq_question_id = $1 RETURNING fq_question_id',
      [fqQuestionId]
    );
    return result.rows[0] || null;
  },
};

export default FinalQuizQuestionModel;
