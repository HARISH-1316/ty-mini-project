// ──────────────────────────────────────────────
// Subtopic Coding Assessment Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const SubtopicCodingAssessmentModel = {
  create: async ({ content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index }) => {
    const result = await query(
      `INSERT INTO subtopic_coding_assessment (content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [content_id, title || null, problem_statement, constraints || null, sample_input || null, sample_output || null, marks || 10, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (sccaId) => {
    const result = await query(
      'SELECT * FROM subtopic_coding_assessment WHERE scca_id = $1',
      [sccaId]
    );
    return result.rows[0] || null;
  },

  findByContentId: async (contentId) => {
    const result = await query(
      'SELECT * FROM subtopic_coding_assessment WHERE content_id = $1 ORDER BY order_index NULLS LAST, scca_id',
      [contentId]
    );
    return result.rows;
  },

  update: async (sccaId, { title, problem_statement, constraints, sample_input, sample_output, marks, order_index }) => {
    const result = await query(
      `UPDATE subtopic_coding_assessment
       SET title = COALESCE($1, title),
           problem_statement = COALESCE($2, problem_statement),
           constraints = COALESCE($3, constraints),
           sample_input = COALESCE($4, sample_input),
           sample_output = COALESCE($5, sample_output),
           marks = COALESCE($6, marks),
           order_index = COALESCE($7, order_index)
       WHERE scca_id = $8
       RETURNING *`,
      [title, problem_statement, constraints, sample_input, sample_output, marks, order_index, sccaId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (sccaId) => {
    const result = await query(
      'DELETE FROM subtopic_coding_assessment WHERE scca_id = $1 RETURNING scca_id',
      [sccaId]
    );
    return result.rows[0] || null;
  },
};

export default SubtopicCodingAssessmentModel;
