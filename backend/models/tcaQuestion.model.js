// ──────────────────────────────────────────────
// TCA Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const TcaQuestionModel = {
  create: async ({ tca_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index }) => {
    const result = await query(
      `INSERT INTO tca_questions (tca_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tca_id, title || null, problem_statement, constraints || null, sample_input || null, sample_output || null, marks || 10, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (tcaQuestionId) => {
    const result = await query(
      'SELECT * FROM tca_questions WHERE tca_question_id = $1',
      [tcaQuestionId]
    );
    return result.rows[0] || null;
  },

  findByTcaId: async (tcaId) => {
    const result = await query(
      'SELECT * FROM tca_questions WHERE tca_id = $1 ORDER BY order_index NULLS LAST, tca_question_id',
      [tcaId]
    );
    return result.rows;
  },

  update: async (tcaQuestionId, { title, problem_statement, constraints, sample_input, sample_output, marks, order_index }) => {
    const result = await query(
      `UPDATE tca_questions
       SET title = COALESCE($1, title),
           problem_statement = COALESCE($2, problem_statement),
           constraints = COALESCE($3, constraints),
           sample_input = COALESCE($4, sample_input),
           sample_output = COALESCE($5, sample_output),
           marks = COALESCE($6, marks),
           order_index = COALESCE($7, order_index)
       WHERE tca_question_id = $8
       RETURNING *`,
      [title, problem_statement, constraints, sample_input, sample_output, marks, order_index, tcaQuestionId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (tcaQuestionId) => {
    const result = await query(
      'DELETE FROM tca_questions WHERE tca_question_id = $1 RETURNING tca_question_id',
      [tcaQuestionId]
    );
    return result.rows[0] || null;
  },
};

export default TcaQuestionModel;
