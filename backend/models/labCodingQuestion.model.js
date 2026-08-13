// ──────────────────────────────────────────────
// Lab Coding Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LabCodingQuestionModel = {
  create: async ({ lab_id, problem_statement, constraints, marks, order_index }) => {
    const result = await query(
      `INSERT INTO lab_coding_questions (lab_id, problem_statement, constraints, marks, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lab_id, problem_statement, constraints || null, marks || 10, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (labQuestionId) => {
    const result = await query(
      'SELECT * FROM lab_coding_questions WHERE lab_question_id = $1',
      [labQuestionId]
    );
    return result.rows[0] || null;
  },

  findByLabId: async (labId) => {
    const result = await query(
      'SELECT * FROM lab_coding_questions WHERE lab_id = $1 ORDER BY order_index NULLS LAST, lab_question_id',
      [labId]
    );
    return result.rows;
  },

  update: async (labQuestionId, { problem_statement, constraints, marks, order_index }) => {
    const result = await query(
      `UPDATE lab_coding_questions
       SET problem_statement = COALESCE($1, problem_statement),
           constraints = COALESCE($2, constraints),
           marks = COALESCE($3, marks),
           order_index = COALESCE($4, order_index)
       WHERE lab_question_id = $5
       RETURNING *`,
      [labQuestionId, problem_statement, constraints, marks, order_index]
    );
    return result.rows[0] || null;
  },

  deleteById: async (labQuestionId) => {
    const result = await query(
      'DELETE FROM lab_coding_questions WHERE lab_question_id = $1 RETURNING lab_question_id',
      [labQuestionId]
    );
    return result.rows[0] || null;
  },
};

export default LabCodingQuestionModel;
