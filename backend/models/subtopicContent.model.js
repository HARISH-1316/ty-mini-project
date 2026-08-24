// ──────────────────────────────────────────────
// Subtopic Content Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const SubtopicContentModel = {
  create: async ({ subtopic_id, aim, theory, video_explanation_url, time_limit }) => {
    const result = await query(
      `INSERT INTO subtopic_content (subtopic_id, aim, theory, video_explanation_url, time_limit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [subtopic_id, aim || null, theory || null, video_explanation_url || null, time_limit || 15]
    );
    return result.rows[0];
  },

  findById: async (contentId) => {
    const result = await query(
      'SELECT * FROM subtopic_content WHERE content_id = $1',
      [contentId]
    );
    return result.rows[0] || null;
  },

  findBySubtopicId: async (subtopicId) => {
    const result = await query(
      'SELECT * FROM subtopic_content WHERE subtopic_id = $1',
      [subtopicId]
    );
    return result.rows[0] || null;
  },

  update: async (contentId, { aim, theory, video_explanation_url, time_limit }) => {
    const result = await query(
      `UPDATE subtopic_content
       SET aim = COALESCE($1, aim),
           theory = COALESCE($2, theory),
           video_explanation_url = COALESCE($3, video_explanation_url),
           time_limit = COALESCE($4, time_limit)
       WHERE content_id = $5
       RETURNING *`,
      [aim, theory, video_explanation_url, time_limit, contentId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (contentId) => {
    const result = await query(
      'DELETE FROM subtopic_content WHERE content_id = $1 RETURNING content_id',
      [contentId]
    );
    return result.rows[0] || null;
  },
};

export default SubtopicContentModel;
