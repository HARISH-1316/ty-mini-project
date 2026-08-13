// ──────────────────────────────────────────────
// Final Quiz Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const FinalQuizModel = {
  create: async ({ topic_id, title, total_marks, time_limit }) => {
    const result = await query(
      `INSERT INTO final_quiz (topic_id, title, total_marks, time_limit)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [topic_id, title || null, total_marks || 0, time_limit || 0]
    );
    return result.rows[0];
  },

  findById: async (finalQuizId) => {
    const result = await query(
      'SELECT * FROM final_quiz WHERE final_quiz_id = $1',
      [finalQuizId]
    );
    return result.rows[0] || null;
  },

  findByTopicId: async (topicId) => {
    const result = await query(
      'SELECT * FROM final_quiz WHERE topic_id = $1 ORDER BY created_at DESC',
      [topicId]
    );
    return result.rows;
  },

  update: async (finalQuizId, { title, total_marks, time_limit }) => {
    const result = await query(
      `UPDATE final_quiz
       SET title = COALESCE($1, title),
           total_marks = COALESCE($2, total_marks),
           time_limit = COALESCE($3, time_limit)
       WHERE final_quiz_id = $4
       RETURNING *`,
      [title, total_marks, time_limit, finalQuizId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (finalQuizId) => {
    const result = await query(
      'DELETE FROM final_quiz WHERE final_quiz_id = $1 RETURNING final_quiz_id',
      [finalQuizId]
    );
    return result.rows[0] || null;
  },
};

export default FinalQuizModel;
