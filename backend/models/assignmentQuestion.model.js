// ──────────────────────────────────────────────
// Assignment Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const AssignmentQuestionModel = {
  create: async ({ assignment_id, problem_statement, constraints, marks, order_index }) => {
    const result = await query(
      `INSERT INTO assignment_questions (assignment_id, problem_statement, constraints, marks, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [assignment_id, problem_statement, constraints || null, marks || 10, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (asgQuestionId) => {
    const result = await query(
      'SELECT * FROM assignment_questions WHERE asg_question_id = $1',
      [asgQuestionId]
    );
    return result.rows[0] || null;
  },

  findByAssignmentId: async (assignmentId) => {
    const result = await query(
      'SELECT * FROM assignment_questions WHERE assignment_id = $1 ORDER BY order_index NULLS LAST, asg_question_id',
      [assignmentId]
    );
    return result.rows;
  },

  update: async (asgQuestionId, { problem_statement, constraints, marks, order_index }) => {
    const result = await query(
      `UPDATE assignment_questions
       SET problem_statement = COALESCE($1, problem_statement),
           constraints = COALESCE($2, constraints),
           marks = COALESCE($3, marks),
           order_index = COALESCE($4, order_index)
       WHERE asg_question_id = $5
       RETURNING *`,
      [asgQuestionId, problem_statement, constraints, marks, order_index]
    );
    return result.rows[0] || null;
  },

  deleteById: async (asgQuestionId) => {
    const result = await query(
      'DELETE FROM assignment_questions WHERE asg_question_id = $1 RETURNING asg_question_id',
      [asgQuestionId]
    );
    return result.rows[0] || null;
  },
};

export default AssignmentQuestionModel;
