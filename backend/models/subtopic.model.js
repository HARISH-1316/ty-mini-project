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

  findByTopicId: async (topicId, { onlyPublished = false } = {}) => {
    let sql = `
      SELECT 
        s.subtopic_id,
        s.topic_id,
        s.title,
        s.order_index,
        s.is_published,
        sc.content_id,
        sc.aim,
        sc.theory,
        sc.video_explanation_url
      FROM subtopics s
      LEFT JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
      WHERE s.topic_id = $1
    `;
    if (onlyPublished) {
      sql += ' AND s.is_published = TRUE';
    }
    sql += ' ORDER BY s.order_index NULLS LAST, s.title';
    const result = await query(sql, [topicId]);

    return result.rows.map((row) => ({
      subtopic_id: row.subtopic_id,
      topic_id: row.topic_id,
      title: row.title,
      order_index: row.order_index,
      is_published: row.is_published,
      content: row.content_id || row.aim || row.theory
        ? {
            content_id: row.content_id || null,
            aim: row.aim || null,
            theory: row.theory || null,
            video_explanation_url: row.video_explanation_url || null,
          }
        : null,
    }));
  },

  setPublishStatus: async (subtopicId, isPublished) => {
    const result = await query(
      `UPDATE subtopics
       SET is_published = $1
       WHERE subtopic_id = $2
       RETURNING *`,
      [isPublished, subtopicId]
    );
    return result.rows[0] || null;
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
