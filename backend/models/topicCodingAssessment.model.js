// ──────────────────────────────────────────────
// Topic Coding Assessment Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const TopicCodingAssessmentModel = {
  create: async ({ topic_id, title, description, total_marks, time_limit }) => {
    const result = await query(
      `INSERT INTO topic_coding_assessment (topic_id, title, description, total_marks, time_limit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [topic_id, title || null, description || null, total_marks || 0, time_limit || 0]
    );
    return result.rows[0];
  },

  findById: async (tcaId) => {
    const result = await query(
      'SELECT * FROM topic_coding_assessment WHERE tca_id = $1',
      [tcaId]
    );
    return result.rows[0] || null;
  },

  findByTopicId: async (topicId) => {
    const result = await query(
      'SELECT * FROM topic_coding_assessment WHERE topic_id = $1',
      [topicId]
    );
    return result.rows;
  },

  update: async (tcaId, { title, description, total_marks, time_limit }) => {
    const result = await query(
      `UPDATE topic_coding_assessment
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           total_marks = COALESCE($3, total_marks),
           time_limit = COALESCE($4, time_limit)
       WHERE tca_id = $5
       RETURNING *`,
      [title, description, total_marks, time_limit, tcaId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (tcaId) => {
    const result = await query(
      'DELETE FROM topic_coding_assessment WHERE tca_id = $1 RETURNING tca_id',
      [tcaId]
    );
    return result.rows[0] || null;
  },
};

export default TopicCodingAssessmentModel;
