// ──────────────────────────────────────────────
// Lab MCQ Question Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LabMcqQuestionModel = {
  create: async ({
    topic_id,
    subtopic_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
    explanation,
    difficulty = 'medium',
    marks = 2,
    status = 'published',
    is_published = true,
    created_by_faculty_id,
  }) => {
    const result = await query(
      `INSERT INTO lab_mcq_questions
         (topic_id, subtopic_id, question_text, option_a, option_b, option_c, option_d,
          correct_option, explanation, difficulty, marks, status, is_published, created_by_faculty_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        topic_id,
        subtopic_id || null,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option.toUpperCase(),
        explanation || null,
        difficulty.toLowerCase(),
        marks,
        status,
        is_published,
        created_by_faculty_id || null,
      ]
    );
    return result.rows[0];
  },

  findById: async (mcqId) => {
    const result = await query(
      `SELECT q.*, t.title AS topic_title, s.title AS subtopic_title, u.name AS created_by_faculty_name
       FROM lab_mcq_questions q
       JOIN topics t ON q.topic_id = t.topic_id
       LEFT JOIN subtopics s ON q.subtopic_id = s.subtopic_id
       LEFT JOIN faculty f ON q.created_by_faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       WHERE q.mcq_id = $1`,
      [mcqId]
    );
    return result.rows[0] || null;
  },

  findFiltered: async ({ topic_id, difficulty, status, search, limit = 100, offset = 0 } = {}) => {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (topic_id) {
      conditions.push(`q.topic_id = $${paramIndex++}`);
      params.push(topic_id);
    }
    if (difficulty) {
      conditions.push(`q.difficulty = $${paramIndex++}`);
      params.push(difficulty.toLowerCase());
    }
    if (status) {
      conditions.push(`q.status = $${paramIndex++}`);
      params.push(status);
    }
    if (search && search.trim()) {
      conditions.push(`(q.question_text ILIKE $${paramIndex} OR q.explanation ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await query(
      `SELECT q.*, t.title AS topic_title, s.title AS subtopic_title, u.name AS created_by_faculty_name
       FROM lab_mcq_questions q
       JOIN topics t ON q.topic_id = t.topic_id
       LEFT JOIN subtopics s ON q.subtopic_id = s.subtopic_id
       LEFT JOIN faculty f ON q.created_by_faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       ${whereClause}
       ORDER BY q.topic_id ASC, q.mcq_id ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );
    return result.rows;
  },

  update: async (mcqId, data) => {
    const {
      topic_id,
      subtopic_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation,
      difficulty,
      marks,
      status,
      is_published,
    } = data;

    const result = await query(
      `UPDATE lab_mcq_questions
       SET topic_id = COALESCE($1, topic_id),
           subtopic_id = COALESCE($2, subtopic_id),
           question_text = COALESCE($3, question_text),
           option_a = COALESCE($4, option_a),
           option_b = COALESCE($5, option_b),
           option_c = COALESCE($6, option_c),
           option_d = COALESCE($7, option_d),
           correct_option = COALESCE($8, correct_option),
           explanation = COALESCE($9, explanation),
           difficulty = COALESCE($10, difficulty),
           marks = COALESCE($11, marks),
           status = COALESCE($12, status),
           is_published = COALESCE($13, is_published)
       WHERE mcq_id = $14
       RETURNING *`,
      [
        topic_id,
        subtopic_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option ? correct_option.toUpperCase() : null,
        explanation,
        difficulty ? difficulty.toLowerCase() : null,
        marks,
        status,
        is_published,
        mcqId,
      ]
    );
    return result.rows[0] || null;
  },

  deleteById: async (mcqId) => {
    const result = await query(
      'DELETE FROM lab_mcq_questions WHERE mcq_id = $1 RETURNING mcq_id',
      [mcqId]
    );
    return result.rows[0] || null;
  },

  updateStatus: async (mcqId, status, isPublished) => {
    const result = await query(
      `UPDATE lab_mcq_questions
       SET status = $1, is_published = $2
       WHERE mcq_id = $3
       RETURNING *`,
      [status, isPublished, mcqId]
    );
    return result.rows[0] || null;
  },

  getTopicsSummary: async () => {
    const result = await query(
      `SELECT t.topic_id, t.title AS topic_title,
              COUNT(q.mcq_id)::int AS total_mcqs,
              COUNT(CASE WHEN q.status = 'published' AND q.is_published = TRUE THEN 1 END)::int AS published_mcqs,
              COUNT(CASE WHEN q.status = 'draft' THEN 1 END)::int AS draft_mcqs,
              COUNT(CASE WHEN q.status = 'archived' THEN 1 END)::int AS archived_mcqs
       FROM topics t
       LEFT JOIN lab_mcq_questions q ON t.topic_id = q.topic_id
       GROUP BY t.topic_id, t.title
       ORDER BY t.topic_id ASC`
    );
    return result.rows;
  },
};

export default LabMcqQuestionModel;
