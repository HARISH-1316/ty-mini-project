// ──────────────────────────────────────────────
// Topic Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const TopicModel = {
  /**
   * Create a new topic.
   */
  create: async ({ title, description }) => {
    const result = await query(
      `INSERT INTO topics (title, description)
       VALUES ($1, $2)
       RETURNING *`,
      [title, description]
    );
    return result.rows[0];
  },

  /**
   * Find a topic by topic_id.
   */
  findById: async (topicId) => {
    const result = await query(
      'SELECT * FROM topics WHERE topic_id = $1',
      [topicId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a topic by title.
   */
  findByTitle: async (title) => {
    const result = await query(
      'SELECT * FROM topics WHERE title = $1 LIMIT 1',
      [title]
    );
    return result.rows[0] || null;
  },

  /**
   * Return all topics.
   */
  findAll: async () => {
    const result = await query(
      'SELECT * FROM topics ORDER BY created_at DESC'
    );
    return result.rows;
  },

  /**
   * Update a topic.
   */
  update: async (topicId, { title, description }) => {
    const result = await query(
      `UPDATE topics
       SET title = COALESCE($1, title),
           description = COALESCE($2, description)
       WHERE topic_id = $3
       RETURNING *`,
      [title, description, topicId]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a topic by topic_id.
   */
  deleteById: async (topicId) => {
    const result = await query(
      'DELETE FROM topics WHERE topic_id = $1 RETURNING topic_id',
      [topicId]
    );
    return result.rows[0] || null;
  },
};

export default TopicModel;
