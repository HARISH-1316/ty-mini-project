// ──────────────────────────────────────────────
// RoomTopic Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const RoomTopicModel = {
  /**
   * Associate a topic with a room.
   */
  create: async ({ room_id, topic_id, order_index }) => {
    const result = await query(
      `INSERT INTO room_topics (room_id, topic_id, order_index)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [room_id, topic_id, order_index || null]
    );
    return result.rows[0];
  },

  /**
   * Find all topics for a room (with topic details).
   */
  findByRoomId: async (roomId) => {
    const result = await query(
      `SELECT rt.*, t.title, t.description, t.created_at AS topic_created_at
       FROM room_topics rt
       JOIN topics t ON rt.topic_id = t.topic_id
       WHERE rt.room_id = $1
       ORDER BY rt.order_index NULLS LAST, t.title`,
      [roomId]
    );
    return result.rows;
  },

  /**
   * Find all rooms that contain a topic.
   */
  findByTopicId: async (topicId) => {
    const result = await query(
      `SELECT rt.*, r.room_name, r.room_code
       FROM room_topics rt
       JOIN rooms r ON rt.room_id = r.room_id
       WHERE rt.topic_id = $1`,
      [topicId]
    );
    return result.rows;
  },

  /**
   * Check if a topic is associated with a room.
   */
  findByRoomAndTopic: async (roomId, topicId) => {
    const result = await query(
      'SELECT * FROM room_topics WHERE room_id = $1 AND topic_id = $2',
      [roomId, topicId]
    );
    return result.rows[0] || null;
  },

  /**
   * Remove a topic from a room.
   */
  deleteByRoomAndTopic: async (roomId, topicId) => {
    const result = await query(
      'DELETE FROM room_topics WHERE room_id = $1 AND topic_id = $2 RETURNING *',
      [roomId, topicId]
    );
    return result.rows[0] || null;
  },
};

export default RoomTopicModel;
