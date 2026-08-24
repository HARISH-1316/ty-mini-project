// ──────────────────────────────────────────────
// Subtopic Progress Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const SubtopicProgressModel = {
  /**
   * Track or update interaction with subtopic content components (aim, theory, video).
   */
  upsert: async ({ student_id, subtopic_id, aim_viewed, theory_viewed, video_viewed, status, time_spent }) => {
    const result = await query(
      `INSERT INTO subtopic_progress (student_id, subtopic_id, aim_viewed, theory_viewed, video_viewed, status, time_spent, last_accessed)
       VALUES ($1, $2, COALESCE($3, FALSE), COALESCE($4, FALSE), COALESCE($5, FALSE), COALESCE($6, 'In Progress'::progress_status), COALESCE($7, 0), CURRENT_TIMESTAMP)
       ON CONFLICT (student_id, subtopic_id) DO UPDATE
       SET aim_viewed = CASE WHEN EXCLUDED.aim_viewed = TRUE THEN TRUE ELSE subtopic_progress.aim_viewed END,
           theory_viewed = CASE WHEN EXCLUDED.theory_viewed = TRUE THEN TRUE ELSE subtopic_progress.theory_viewed END,
           video_viewed = CASE WHEN EXCLUDED.video_viewed = TRUE THEN TRUE ELSE subtopic_progress.video_viewed END,
           status = COALESCE(EXCLUDED.status, subtopic_progress.status),
           time_spent = subtopic_progress.time_spent + COALESCE(EXCLUDED.time_spent, 0),
           last_accessed = CURRENT_TIMESTAMP
       RETURNING *`,
      [student_id, subtopic_id, aim_viewed, theory_viewed, video_viewed, status, time_spent]
    );
    return result.rows[0];
  },

  findByStudentAndSubtopic: async (studentId, subtopicId) => {
    const result = await query(
      'SELECT * FROM subtopic_progress WHERE student_id = $1 AND subtopic_id = $2',
      [studentId, subtopicId]
    );
    return result.rows[0] || null;
  },

  findByStudentAndTopic: async (studentId, topicId) => {
    const result = await query(
      `SELECT sp.*, s.title AS subtopic_title, s.order_index
       FROM subtopic_progress sp
       JOIN subtopics s ON sp.subtopic_id = s.subtopic_id
       WHERE sp.student_id = $1 AND s.topic_id = $2
       ORDER BY s.order_index`,
      [studentId, topicId]
    );
    return result.rows;
  },

  findByStudentId: async (studentId) => {
    const result = await query(
      `SELECT sp.*, s.title AS subtopic_title, s.topic_id
       FROM subtopic_progress sp
       JOIN subtopics s ON sp.subtopic_id = s.subtopic_id
       WHERE sp.student_id = $1
       ORDER BY sp.last_accessed DESC`,
      [studentId]
    );
    return result.rows;
  },
};

export default SubtopicProgressModel;
