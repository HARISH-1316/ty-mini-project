// ──────────────────────────────────────────────
// Topic Video References Model — PostgreSQL DAL
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const TopicVideoModel = {
  findByTopicId: async (topicId) => {
    const sql = `
      SELECT *
      FROM topic_video_references
      WHERE topic_id = $1
      ORDER BY order_index ASC, created_at ASC
    `;
    const result = await query(sql, [topicId]);
    return result.rows;
  },

  findById: async (videoId) => {
    const sql = `SELECT * FROM topic_video_references WHERE video_id = $1`;
    const result = await query(sql, [videoId]);
    return result.rows[0] || null;
  },

  create: async ({ topic_id, title, channel_name, url, description = '', order_index = 1 }) => {
    const sql = `
      INSERT INTO topic_video_references (topic_id, title, channel_name, url, description, order_index)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(sql, [topic_id, title, channel_name, url, description, order_index]);
    return result.rows[0];
  },

  update: async (videoId, { title, channel_name, url, description, order_index }) => {
    const fields = [];
    const values = [];

    if (title !== undefined) {
      values.push(title);
      fields.push(`title = $${values.length}`);
    }
    if (channel_name !== undefined) {
      values.push(channel_name);
      fields.push(`channel_name = $${values.length}`);
    }
    if (url !== undefined) {
      values.push(url);
      fields.push(`url = $${values.length}`);
    }
    if (description !== undefined) {
      values.push(description);
      fields.push(`description = $${values.length}`);
    }
    if (order_index !== undefined) {
      values.push(order_index);
      fields.push(`order_index = $${values.length}`);
    }

    if (fields.length === 0) return null;

    values.push(videoId);
    const sql = `
      UPDATE topic_video_references
      SET ${fields.join(', ')}
      WHERE video_id = $${values.length}
      RETURNING *
    `;
    const result = await query(sql, values);
    return result.rows[0] || null;
  },

  delete: async (videoId) => {
    const sql = `DELETE FROM topic_video_references WHERE video_id = $1 RETURNING video_id`;
    const result = await query(sql, [videoId]);
    return result.rows[0] || null;
  },
};

export default TopicVideoModel;
