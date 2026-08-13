// ──────────────────────────────────────────────
// Progress Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const ProgressModel = {
  /**
   * Create or update student progress on a topic (UPSERT).
   */
  upsert: async ({ student_id, topic_id, status, time_spent }) => {
    const result = await query(
      `INSERT INTO progress (student_id, topic_id, status, time_spent, last_accessed)
       VALUES ($1, $2, $3, COALESCE($4, 0), CURRENT_TIMESTAMP)
       ON CONFLICT (student_id, topic_id) DO UPDATE
       SET status = COALESCE(EXCLUDED.status, progress.status),
           time_spent = progress.time_spent + COALESCE(EXCLUDED.time_spent, 0),
           last_accessed = CURRENT_TIMESTAMP
       RETURNING *`,
      [student_id, topic_id, status || 'Not Started', time_spent || 0]
    );
    return result.rows[0];
  },

  findByStudentAndTopic: async (studentId, topicId) => {
    const result = await query(
      'SELECT * FROM progress WHERE student_id = $1 AND topic_id = $2',
      [studentId, topicId]
    );
    return result.rows[0] || null;
  },

  findByStudentId: async (studentId) => {
    const result = await query(
      `SELECT p.*, t.title AS topic_title
       FROM progress p
       JOIN topics t ON p.topic_id = t.topic_id
       WHERE p.student_id = $1
       ORDER BY p.last_accessed DESC NULLS LAST`,
      [studentId]
    );
    return result.rows;
  },

  findByTopicId: async (topicId) => {
    const result = await query(
      `SELECT p.*, s.roll_number, u.name AS student_name
       FROM progress p
       JOIN student s ON p.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE p.topic_id = $1`,
      [topicId]
    );
    return result.rows;
  },
};

export default ProgressModel;
