// ──────────────────────────────────────────────
// Lab Coding Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// This table serves as the lab practical question bank.
// Questions are associated with curriculum topics and optional subtopics.
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LabCodingQuestionModel = {
  /**
   * Create a new question in the bank (associated with a topic).
   */
  create: async (
    {
      topic_id,
      subtopic_id = null,
      lab_id = null,
      title,
      problem_statement,
      input_format,
      output_format,
      constraints,
      sample_input,
      sample_output,
      explanation,
      difficulty = 'medium',
      marks = 10,
      order_index,
      created_by_faculty_id,
      supported_languages = ['c', 'cpp', 'java', 'python'],
      is_archived = false,
      status = 'published',
      is_published = true,
    },
    client = null
  ) => {
    const executor = client || { query };
    const result = await executor.query(
      `INSERT INTO lab_coding_questions
         (topic_id, subtopic_id, lab_id, title, problem_statement, input_format, output_format,
          constraints, sample_input, sample_output, explanation,
          difficulty, marks, order_index, created_by_faculty_id, supported_languages, is_archived, status, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        topic_id || null,
        subtopic_id || null,
        lab_id,
        title || null,
        problem_statement,
        input_format || null,
        output_format || null,
        constraints || null,
        sample_input || null,
        sample_output || null,
        explanation || null,
        difficulty,
        marks,
        order_index || null,
        created_by_faculty_id || null,
        JSON.stringify(supported_languages || ['c', 'cpp', 'java', 'python']),
        is_archived || false,
        status || 'published',
        is_published !== undefined ? is_published : true,
      ]
    );
    return result.rows[0];
  },

  findById: async (labQuestionId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `SELECT lcq.*, t.title AS topic_title, st.title AS subtopic_title,
              f.faculty_id, u.name AS faculty_name, u.email AS faculty_email
       FROM lab_coding_questions lcq
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       LEFT JOIN subtopics st ON lcq.subtopic_id = st.subtopic_id
       LEFT JOIN faculty f ON lcq.created_by_faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       WHERE lcq.lab_question_id = $1`,
      [labQuestionId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find all questions in the bank for a specific topic.
   */
  findByTopicId: async (topicId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `SELECT lcq.*, t.title AS topic_title, st.title AS subtopic_title
       FROM lab_coding_questions lcq
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       LEFT JOIN subtopics st ON lcq.subtopic_id = st.subtopic_id
       WHERE lcq.topic_id = $1 AND lcq.is_archived = FALSE
       ORDER BY lcq.difficulty, lcq.order_index NULLS LAST, lcq.lab_question_id`,
      [topicId]
    );
    return result.rows;
  },

  /**
   * Find all questions created by a specific faculty member.
   */
  findByFacultyId: async (facultyId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `SELECT lcq.*, t.title AS topic_title, st.title AS subtopic_title
       FROM lab_coding_questions lcq
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       LEFT JOIN subtopics st ON lcq.subtopic_id = st.subtopic_id
       WHERE lcq.created_by_faculty_id = $1
       ORDER BY lcq.created_at DESC`,
      [facultyId]
    );
    return result.rows;
  },

  /**
   * Find all questions with attached test cases.
   * Supports filtering by topicId, subtopicId, status, difficulty, search, and student published-only mode.
   */
  findAll: async (topicId = null, optionsOrIncludeArchived = false, client = null) => {
    const executor = client || { query };
    const params = [];
    const conditions = [];

    // Support both legacy boolean `includeArchived` and options object
    const options = typeof optionsOrIncludeArchived === 'object' && optionsOrIncludeArchived !== null
      ? optionsOrIncludeArchived
      : { includeArchived: !!optionsOrIncludeArchived };

    const effectiveTopicId = topicId || options.topicId;
    if (effectiveTopicId) {
      params.push(effectiveTopicId);
      conditions.push(`lcq.topic_id = $${params.length}`);
    }

    if (options.subtopicId) {
      params.push(options.subtopicId);
      conditions.push(`lcq.subtopic_id = $${params.length}`);
    }

    if (options.difficulty) {
      params.push(options.difficulty.toLowerCase());
      conditions.push(`lcq.difficulty = $${params.length}`);
    }

    if (options.onlyPublished) {
      conditions.push(`lcq.is_published = TRUE AND lcq.status = 'published' AND lcq.is_archived = FALSE`);
    } else if (options.status && options.status !== 'all') {
      if (options.status === 'archived') {
        conditions.push(`(lcq.is_archived = TRUE OR lcq.status = 'archived')`);
      } else if (options.status === 'published') {
        conditions.push(`lcq.status = 'published' AND lcq.is_published = TRUE AND lcq.is_archived = FALSE`);
      } else if (options.status === 'draft') {
        conditions.push(`lcq.status = 'draft' AND lcq.is_archived = FALSE`);
      }
    } else if (!options.includeArchived) {
      conditions.push('lcq.is_archived = FALSE');
    }

    if (options.search && options.search.trim()) {
      params.push(`%${options.search.trim()}%`);
      conditions.push(`(lcq.title ILIKE $${params.length} OR lcq.problem_statement ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await executor.query(
      `SELECT lcq.*,
              t.title AS topic_title,
              st.title AS subtopic_title,
              u.name AS faculty_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'lab_testcase_id', tc.lab_testcase_id,
                    'lab_question_id', tc.lab_question_id,
                    'input', tc.input,
                    'expected_output', tc.expected_output,
                    'is_hidden', tc.is_hidden,
                    'order_index', tc.order_index
                  ) ORDER BY tc.order_index NULLS LAST, tc.lab_testcase_id
                ) FILTER (WHERE tc.lab_testcase_id IS NOT NULL),
                '[]'::json
              ) AS "testCases"
       FROM lab_coding_questions lcq
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       LEFT JOIN subtopics st ON lcq.subtopic_id = st.subtopic_id
       LEFT JOIN faculty f ON lcq.created_by_faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       LEFT JOIN lab_test_cases tc ON lcq.lab_question_id = tc.lab_question_id
       ${whereClause}
       GROUP BY lcq.lab_question_id, t.title, st.title, u.name
       ORDER BY t.title NULLS LAST, lcq.difficulty, lcq.lab_question_id`,
      params
    );
    return result.rows;
  },

  /**
   * Get topic-wise statistics: total, published, draft, archived counts for all 17 topics.
   */
  getTopicQuestionStats: async (client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `SELECT
         t.topic_id,
         t.title,
         t.description,
         COUNT(lcq.lab_question_id)::INT AS total_questions,
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

  /**
   * Legacy: find questions by lab_id (for old direct-linked questions).
   */
  findByLabId: async (labId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      'SELECT * FROM lab_coding_questions WHERE lab_id = $1 ORDER BY order_index NULLS LAST, lab_question_id',
      [labId]
    );
    return result.rows;
  },

  update: async (
    labQuestionId,
    {
      topic_id,
      subtopic_id,
      title,
      problem_statement,
      input_format,
      output_format,
      constraints,
      sample_input,
      sample_output,
      explanation,
      difficulty,
      marks,
      order_index,
      supported_languages,
      is_archived,
      status,
      is_published,
    },
    client = null
  ) => {
    const executor = client || { query };
    const result = await executor.query(
      `UPDATE lab_coding_questions
       SET topic_id = COALESCE($1, topic_id),
           subtopic_id = CASE WHEN $2::integer IS NOT NULL THEN $2 ELSE subtopic_id END,
           title = COALESCE($3, title),
           problem_statement = COALESCE($4, problem_statement),
           input_format = COALESCE($5, input_format),
           output_format = COALESCE($6, output_format),
           constraints = COALESCE($7, constraints),
           sample_input = COALESCE($8, sample_input),
           sample_output = COALESCE($9, sample_output),
           explanation = COALESCE($10, explanation),
           difficulty = COALESCE($11, difficulty),
           marks = COALESCE($12, marks),
           order_index = COALESCE($13, order_index),
           supported_languages = COALESCE($14::jsonb, supported_languages),
           is_archived = COALESCE($15, is_archived),
           status = COALESCE($16, status),
           is_published = COALESCE($17, is_published)
       WHERE lab_question_id = $18
       RETURNING *`,
      [
        topic_id,
        subtopic_id !== undefined ? subtopic_id : null,
        title,
        problem_statement,
        input_format,
        output_format,
        constraints,
        sample_input,
        sample_output,
        explanation,
        difficulty,
        marks,
        order_index,
        supported_languages ? JSON.stringify(supported_languages) : null,
        is_archived !== undefined ? is_archived : null,
        status !== undefined ? status : null,
        is_published !== undefined ? is_published : null,
        labQuestionId,
      ]
    );
    return result.rows[0] || null;
  },

  /**
   * Check if a question is referenced in assessments allocations or submissions.
   */
  isReferenced: async (labQuestionId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `SELECT (
         EXISTS(SELECT 1 FROM la_student_allocations WHERE lab_question_id = $1)
         OR EXISTS(SELECT 1 FROM la_question_submissions WHERE lab_question_id = $1)
         OR EXISTS(SELECT 1 FROM la_selected_questions WHERE lab_question_id = $1)
       ) AS is_referenced`,
      [labQuestionId]
    );
    return !!result.rows[0]?.is_referenced;
  },

  /**
   * Soft-delete/archive a question to protect historical records.
   */
  archive: async (labQuestionId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `UPDATE lab_coding_questions
       SET is_archived = TRUE, status = 'archived', is_published = FALSE
       WHERE lab_question_id = $1
       RETURNING *`,
      [labQuestionId]
    );
    return result.rows[0] || null;
  },

  /**
   * Unarchive a question.
   */
  unarchive: async (labQuestionId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `UPDATE lab_coding_questions
       SET is_archived = FALSE, status = 'published', is_published = TRUE
       WHERE lab_question_id = $1
       RETURNING *`,
      [labQuestionId]
    );
    return result.rows[0] || null;
  },

  /**
   * Publish or unpublish a question.
   */
  setPublishStatus: async (labQuestionId, isPublished, client = null) => {
    const executor = client || { query };
    const status = isPublished ? 'published' : 'draft';
    const result = await executor.query(
      `UPDATE lab_coding_questions
       SET is_published = $2, status = $3, is_archived = FALSE
       WHERE lab_question_id = $1
       RETURNING *`,
      [labQuestionId, !!isPublished, status]
    );
    return result.rows[0] || null;
  },

  deleteById: async (labQuestionId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      'DELETE FROM lab_coding_questions WHERE lab_question_id = $1 RETURNING lab_question_id',
      [labQuestionId]
    );
    return result.rows[0] || null;
  },
};

export default LabCodingQuestionModel;
