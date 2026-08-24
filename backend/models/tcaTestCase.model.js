// ──────────────────────────────────────────────
// TCA Test Case Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const TcaTestCaseModel = {
  create: async ({ tca_question_id, input, expected_output, is_hidden = false, order_index = 1 }) => {
    const result = await query(
      `INSERT INTO tca_test_cases (tca_question_id, input, expected_output, is_hidden, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tca_question_id, input, expected_output, is_hidden, order_index]
    );
    return result.rows[0];
  },

  findById: async (testCaseId) => {
    const result = await query(
      'SELECT * FROM tca_test_cases WHERE tca_testcase_id = $1',
      [testCaseId]
    );
    return result.rows[0] || null;
  },

  findByQuestionId: async (questionId) => {
    const result = await query(
      'SELECT * FROM tca_test_cases WHERE tca_question_id = $1 ORDER BY order_index NULLS LAST, tca_testcase_id',
      [questionId]
    );
    return result.rows;
  },

  findByQuestionIdForStudent: async (questionId) => {
    const result = await query(
      `SELECT tca_testcase_id, tca_question_id, input, expected_output, is_hidden, order_index
       FROM tca_test_cases
       WHERE tca_question_id = $1 AND is_hidden = FALSE
       ORDER BY order_index NULLS LAST, tca_testcase_id`,
      [questionId]
    );
    return result.rows;
  },

  update: async (testCaseId, { input, expected_output, is_hidden, order_index }) => {
    const result = await query(
      `UPDATE tca_test_cases
       SET input = COALESCE($1, input),
           expected_output = COALESCE($2, expected_output),
           is_hidden = COALESCE($3, is_hidden),
           order_index = COALESCE($4, order_index)
       WHERE tca_testcase_id = $5
       RETURNING *`,
      [input, expected_output, is_hidden, order_index, testCaseId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (testCaseId) => {
    const result = await query(
      'DELETE FROM tca_test_cases WHERE tca_testcase_id = $1 RETURNING tca_testcase_id',
      [testCaseId]
    );
    return result.rows[0] || null;
  },
};

export default TcaTestCaseModel;
