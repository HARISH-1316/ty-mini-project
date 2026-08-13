// ──────────────────────────────────────────────
// Assignment Test Cases Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const AssignmentTestCaseModel = {
  create: async ({ asg_question_id, input, expected_output, is_hidden, order_index }) => {
    const result = await query(
      `INSERT INTO assignment_test_cases (asg_question_id, input, expected_output, is_hidden, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [asg_question_id, input || '', expected_output || '', is_hidden !== undefined ? is_hidden : false, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (asgTestcaseId) => {
    const result = await query(
      'SELECT * FROM assignment_test_cases WHERE asg_testcase_id = $1',
      [asgTestcaseId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find ALL test cases for an assignment question (Faculty / Admin view).
   */
  findByQuestionId: async (asgQuestionId) => {
    const result = await query(
      'SELECT * FROM assignment_test_cases WHERE asg_question_id = $1 ORDER BY order_index NULLS LAST, asg_testcase_id',
      [asgQuestionId]
    );
    return result.rows;
  },

  /**
   * Find ONLY public (sample) test cases (Student view).
   * Hidden test cases (is_hidden = true) are NEVER returned.
   */
  findPublicByQuestionId: async (asgQuestionId) => {
    const result = await query(
      `SELECT asg_testcase_id, asg_question_id, input, expected_output, order_index
       FROM assignment_test_cases
       WHERE asg_question_id = $1 AND is_hidden = FALSE
       ORDER BY order_index NULLS LAST, asg_testcase_id`,
      [asgQuestionId]
    );
    return result.rows;
  },

  update: async (asgTestcaseId, { input, expected_output, is_hidden, order_index }) => {
    const result = await query(
      `UPDATE assignment_test_cases
       SET input = COALESCE($1, input),
           expected_output = COALESCE($2, expected_output),
           is_hidden = COALESCE($3, is_hidden),
           order_index = COALESCE($4, order_index)
       WHERE asg_testcase_id = $5
       RETURNING *`,
      [input, expected_output, is_hidden, order_index, asgTestcaseId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (asgTestcaseId) => {
    const result = await query(
      'DELETE FROM assignment_test_cases WHERE asg_testcase_id = $1 RETURNING asg_testcase_id',
      [asgTestcaseId]
    );
    return result.rows[0] || null;
  },
};

export default AssignmentTestCaseModel;
