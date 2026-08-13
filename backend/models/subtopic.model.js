// ──────────────────────────────────────────────
// Subtopic Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const SubtopicModel = {
  create: async ({ topic_id, title, order_index, is_published }) => {
    const result = await query(
      `INSERT INTO subtopics (topic_id, title, order_index, is_published)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [topic_id, title, order_index || null, is_published !== undefined ? is_published : true]
    );
    return result.rows[0];
  },

  findById: async (subtopicId) => {
    const result = await query(
      'SELECT * FROM subtopics WHERE subtopic_id = $1',
      [subtopicId]
    );
    return result.rows[0] || null;
  },

  findByTopicId: async (topicId) => {
    const result = await query(
      'SELECT * FROM subtopics WHERE topic_id = $1 ORDER BY order_index NULLS LAST, title',
      [topicId]
    );
    return result.rows;
  },

  update: async (subtopicId, { title, order_index, is_published }) => {
    const result = await query(
      `UPDATE subtopics
       SET title = COALESCE($1, title),
           order_index = COALESCE($2, order_index),
           is_published = COALESCE($3, is_published)
       WHERE subtopic_id = $4
       RETURNING *`,
      [title, order_index, is_published, subtopicId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (subtopicId) => {
    const result = await query(
      'DELETE FROM subtopics WHERE subtopic_id = $1 RETURNING subtopic_id',
      [subtopicId]
    );
    return result.rows[0] || null;
  },
};

export default SubtopicModel;
