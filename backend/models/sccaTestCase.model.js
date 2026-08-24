// ──────────────────────────────────────────────
// Subtopic Coding Assessment Test Case Model — PostgreSQL DAL
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const SccaTestCaseModel = {
  create: async ({ scca_id, input, expected_output, is_hidden = false, order_index = 1 }) => {
    const result = await query(
      `INSERT INTO subtopic_coding_test_cases (scca_id, input, expected_output, is_hidden, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [scca_id, input, expected_output, is_hidden, order_index]
    );
    return result.rows[0];
  },

  findById: async (testCaseId) => {
    const result = await query(
      'SELECT * FROM subtopic_coding_test_cases WHERE scca_testcase_id = $1',
      [testCaseId]
    );
    return result.rows[0] || null;
  },

  findBySccaId: async (sccaId) => {
    const result = await query(
      'SELECT * FROM subtopic_coding_test_cases WHERE scca_id = $1 ORDER BY order_index NULLS LAST, scca_testcase_id',
      [sccaId]
    );
    return result.rows;
  },

  findBySccaIdForStudent: async (sccaId) => {
    const result = await query(
      `SELECT scca_testcase_id, scca_id, input, expected_output, is_hidden, order_index
       FROM subtopic_coding_test_cases
       WHERE scca_id = $1 AND is_hidden = FALSE
       ORDER BY order_index NULLS LAST, scca_testcase_id`,
      [sccaId]
    );
    return result.rows;
  },

  update: async (testCaseId, { input, expected_output, is_hidden, order_index }) => {
    const result = await query(
      `UPDATE subtopic_coding_test_cases
       SET input = COALESCE($1, input),
           expected_output = COALESCE($2, expected_output),
           is_hidden = COALESCE($3, is_hidden),
           order_index = COALESCE($4, order_index)
       WHERE scca_testcase_id = $5
       RETURNING *`,
      [input, expected_output, is_hidden, order_index, testCaseId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (testCaseId) => {
    const result = await query(
      'DELETE FROM subtopic_coding_test_cases WHERE scca_testcase_id = $1 RETURNING scca_testcase_id',
      [testCaseId]
    );
    return result.rows[0] || null;
  },
};

export default SccaTestCaseModel;
