// ──────────────────────────────────────────────
// Lab Test Cases Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LabTestCaseModel = {
  create: async ({ lab_question_id, input, expected_output, is_hidden, order_index }, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `INSERT INTO lab_test_cases (lab_question_id, input, expected_output, is_hidden, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lab_question_id, input || '', expected_output || '', is_hidden !== undefined ? is_hidden : false, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (labTestcaseId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      'SELECT * FROM lab_test_cases WHERE lab_testcase_id = $1',
      [labTestcaseId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find ALL test cases for a question (Faculty / Admin view).
   */
  findByQuestionId: async (labQuestionId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      'SELECT * FROM lab_test_cases WHERE lab_question_id = $1 ORDER BY order_index NULLS LAST, lab_testcase_id',
      [labQuestionId]
    );
    return result.rows;
  },

  /**
   * Find ONLY public (sample) test cases for a question (Student view).
   * Hidden test cases (is_hidden = true) are NEVER returned.
   */
  findPublicByQuestionId: async (labQuestionId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `SELECT lab_testcase_id, lab_question_id, input, expected_output, order_index
       FROM lab_test_cases
       WHERE lab_question_id = $1 AND is_hidden = FALSE
       ORDER BY order_index NULLS LAST, lab_testcase_id`,
      [labQuestionId]
    );
    return result.rows;
  },

  update: async (labTestcaseId, { input, expected_output, is_hidden, order_index }, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `UPDATE lab_test_cases
       SET input = COALESCE($1, input),
           expected_output = COALESCE($2, expected_output),
           is_hidden = COALESCE($3, is_hidden),
           order_index = COALESCE($4, order_index)
       WHERE lab_testcase_id = $5
       RETURNING *`,
      [input, expected_output, is_hidden, order_index, labTestcaseId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (labTestcaseId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      'DELETE FROM lab_test_cases WHERE lab_testcase_id = $1 RETURNING lab_testcase_id',
      [labTestcaseId]
    );
    return result.rows[0] || null;
  },

  deleteByQuestionId: async (labQuestionId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      'DELETE FROM lab_test_cases WHERE lab_question_id = $1 RETURNING lab_testcase_id',
      [labQuestionId]
    );
    return result.rows;
  },
};

export default LabTestCaseModel;
