// ──────────────────────────────────────────────
// Prerequisite Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const PrerequisiteModel = {
  create: async ({ topic_id, description, content, order_index }) => {
    const result = await query(
      `INSERT INTO prerequisite (topic_id, description, content, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [topic_id, description || null, content || null, order_index || null]
    );
    return result.rows[0];
  },

  findById: async (prereqId) => {
    const result = await query(
      'SELECT * FROM prerequisite WHERE prereq_id = $1',
      [prereqId]
    );
    return result.rows[0] || null;
  },

  findByTopicId: async (topicId) => {
    const result = await query(
      'SELECT * FROM prerequisite WHERE topic_id = $1 ORDER BY order_index NULLS LAST',
      [topicId]
    );
    return result.rows;
  },

  update: async (prereqId, { description, content, order_index }) => {
    const result = await query(
      `UPDATE prerequisite
       SET description = COALESCE($1, description),
           content = COALESCE($2, content),
           order_index = COALESCE($3, order_index)
       WHERE prereq_id = $4
       RETURNING *`,
      [description, content, order_index, prereqId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (prereqId) => {
    const result = await query(
      'DELETE FROM prerequisite WHERE prereq_id = $1 RETURNING prereq_id',
      [prereqId]
    );
    return result.rows[0] || null;
  },
};

export default PrerequisiteModel;
