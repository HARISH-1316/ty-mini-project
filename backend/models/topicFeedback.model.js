// ──────────────────────────────────────────────
// Topic Feedback Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Feedback is collected for a COMPLETE TOPIC.
// Table: topic_feedback
// UNIQUE constraint on (student_id, topic_id).
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const TopicFeedbackModel = {
  /**
   * Create a new feedback record for a topic.
   */
  create: async ({ student_id, topic_id, rating, comment }) => {
    const result = await query(
      `INSERT INTO topic_feedback (student_id, topic_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [student_id, topic_id, rating, comment || null]
    );
    return result.rows[0];
  },

  /**
   * Find feedback by student_id and topic_id.
   */
  findByStudentAndTopic: async (studentId, topicId) => {
    const result = await query(
      'SELECT * FROM topic_feedback WHERE student_id = $1 AND topic_id = $2',
      [studentId, topicId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find all feedback for a topic with student name.
   */
  findByTopicId: async (topicId) => {
    const result = await query(
      `SELECT tf.*, u.name AS student_name
       FROM topic_feedback tf
       JOIN student s ON tf.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE tf.topic_id = $1
       ORDER BY tf.created_at DESC`,
      [topicId]
    );
    return result.rows;
  },

  /**
   * Update student's feedback for a topic.
   */
  update: async (studentId, topicId, { rating, comment }) => {
    const result = await query(
      `UPDATE topic_feedback
       SET rating = COALESCE($1, rating),
           comment = COALESCE($2, comment)
       WHERE student_id = $3 AND topic_id = $4
       RETURNING *`,
      [rating, comment, studentId, topicId]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete student's feedback for a topic.
   */
  deleteByStudentAndTopic: async (studentId, topicId) => {
    const result = await query(
      'DELETE FROM topic_feedback WHERE student_id = $1 AND topic_id = $2 RETURNING *',
      [studentId, topicId]
    );
    return result.rows[0] || null;
  },
};

export default TopicFeedbackModel;
