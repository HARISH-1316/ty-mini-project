// ──────────────────────────────────────────────
// Subtopic Quiz Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const SubtopicQuizQuestionModel = {
  create: async ({ content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index }) => {
    const result = await query(
      `INSERT INTO subtopic_quiz_questions (content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks || 1, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (stqId) => {
    const result = await query(
      'SELECT * FROM subtopic_quiz_questions WHERE stq_id = $1',
      [stqId]
    );
    return result.rows[0] || null;
  },

  findByContentId: async (contentId) => {
    const result = await query(
      'SELECT * FROM subtopic_quiz_questions WHERE content_id = $1 ORDER BY order_index NULLS LAST, stq_id',
      [contentId]
    );
    return result.rows;
  },

  /**
   * For student attempts — excludes correct_option.
   */
  findByContentIdForStudent: async (contentId) => {
    const result = await query(
      `SELECT stq_id, content_id, question_text, option_a, option_b, option_c, option_d, marks, order_index
       FROM subtopic_quiz_questions
       WHERE content_id = $1
       ORDER BY order_index NULLS LAST, stq_id`,
      [contentId]
    );
    return result.rows;
  },

  update: async (stqId, { question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index }) => {
    const result = await query(
      `UPDATE subtopic_quiz_questions
       SET question_text = COALESCE($1, question_text),
           option_a = COALESCE($2, option_a),
           option_b = COALESCE($3, option_b),
           option_c = COALESCE($4, option_c),
           option_d = COALESCE($5, option_d),
           correct_option = COALESCE($6, correct_option),
           marks = COALESCE($7, marks),
           order_index = COALESCE($8, order_index)
       WHERE stq_id = $9
       RETURNING *`,
      [question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index, stqId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (stqId) => {
    const result = await query(
      'DELETE FROM subtopic_quiz_questions WHERE stq_id = $1 RETURNING stq_id',
      [stqId]
    );
    return result.rows[0] || null;
  },
};

export default SubtopicQuizQuestionModel;
