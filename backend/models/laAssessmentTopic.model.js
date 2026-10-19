// ──────────────────────────────────────────────
// Lab Assessment Topic Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Manages the many-to-many relationship between
// lab assessments and selected topics.
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaAssessmentTopicModel = {
  /**
   * Add a topic to a lab assessment.
   */
  create: async ({ lab_id, topic_id }) => {
    const result = await query(
      `INSERT INTO la_assessment_topics (lab_id, topic_id)
       VALUES ($1, $2)
       ON CONFLICT (lab_id, topic_id) DO NOTHING
       RETURNING *`,
      [lab_id, topic_id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all topics associated with a lab assessment.
   */
  findByLabId: async (labId) => {
    const result = await query(
      `SELECT lat.*, t.title AS topic_title, t.description AS topic_description
       FROM la_assessment_topics lat
       JOIN topics t ON lat.topic_id = t.topic_id
       WHERE lat.lab_id = $1
       ORDER BY t.title`,
      [labId]
    );
    return result.rows;
  },

  /**
   * Remove a topic from a lab assessment.
   */
  deleteByLabAndTopic: async (labId, topicId) => {
    const result = await query(
      `DELETE FROM la_assessment_topics
       WHERE lab_id = $1 AND topic_id = $2
       RETURNING *`,
      [labId, topicId]
    );
    return result.rows[0] || null;
  },

  /**
   * Remove all topics from a lab assessment.
   */
  deleteByLabId: async (labId) => {
    await query(
      'DELETE FROM la_assessment_topics WHERE lab_id = $1',
      [labId]
    );
  },

  /**
   * Count eligible published questions per topic for a given lab.
   * Returns rows: { topic_id, topic_title, question_count }
   */
  getQuestionPoolStats: async (labId) => {
    const result = await query(
      `SELECT
         t.topic_id,
         t.title AS topic_title,
         COUNT(lcq.lab_question_id)::INT AS question_count
       FROM la_assessment_topics lat
       JOIN topics t ON lat.topic_id = t.topic_id
       LEFT JOIN lab_coding_questions lcq ON lcq.topic_id = t.topic_id
         AND lcq.is_archived = FALSE
         AND lcq.is_published = TRUE
         AND lcq.status = 'published'
       WHERE lat.lab_id = $1
       GROUP BY t.topic_id, t.title
       ORDER BY t.title`,
      [labId]
    );
    return result.rows;
  },

  /**
   * Get total count of unique eligible published questions across all selected topics for a lab.
   */
  getTotalEligibleQuestions: async (labId) => {
    const result = await query(
      `SELECT COUNT(DISTINCT lcq.lab_question_id)::INT AS total
       FROM la_assessment_topics lat
       JOIN lab_coding_questions lcq ON lcq.topic_id = lat.topic_id
       WHERE lat.lab_id = $1
         AND lcq.is_archived = FALSE
         AND lcq.is_published = TRUE
         AND lcq.status = 'published'`,
      [labId]
    );
    return result.rows[0]?.total || 0;
  },

  /**
   * Get all curriculum topics with their available question pool counts (published, draft, archived).
   */
  getAllTopicsWithQuestionCounts: async () => {
    const result = await query(
      `SELECT
         t.topic_id,
         t.title,
         t.description,
         COUNT(lcq.lab_question_id)::INT AS question_count,
         COUNT(lcq.lab_question_id) FILTER (WHERE lcq.status = 'published' AND lcq.is_published = TRUE AND lcq.is_archived = FALSE)::INT AS published_count,
         COUNT(lcq.lab_question_id) FILTER (WHERE lcq.status = 'draft' AND lcq.is_archived = FALSE)::INT AS draft_count,
         COUNT(lcq.lab_question_id) FILTER (WHERE lcq.is_archived = TRUE OR lcq.status = 'archived')::INT AS archived_count
       FROM topics t
       LEFT JOIN lab_coding_questions lcq ON lcq.topic_id = t.topic_id
       WHERE t.title != 'Data Structures and Algorithms' AND t.title != 'Stacks and Queues'
       GROUP BY t.topic_id, t.title, t.description
       ORDER BY t.topic_id`
    );
    return result.rows;
  },
};

export default LaAssessmentTopicModel;
