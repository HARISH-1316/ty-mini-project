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
    },
    client = null
  ) => {
    const executor = client || { query };
    const result = await executor.query(
      `INSERT INTO lab_coding_questions
         (topic_id, subtopic_id, lab_id, title, problem_statement, input_format, output_format,
          constraints, sample_input, sample_output, explanation,
          difficulty, marks, order_index, created_by_faculty_id, supported_languages, is_archived)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
   * Find all questions with attached test cases (admin/faculty view, optional topicId filter).
   */
  findAll: async (topicId = null, includeArchived = false, client = null) => {
    const executor = client || { query };
    const params = [];
    const conditions = [];

    if (topicId) {
      params.push(topicId);
      conditions.push(`lcq.topic_id = $${params.length}`);
    }

    if (!includeArchived) {
      conditions.push('lcq.is_archived = FALSE');
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
           is_archived = COALESCE($15, is_archived)
       WHERE lab_question_id = $16
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
      'UPDATE lab_coding_questions SET is_archived = TRUE WHERE lab_question_id = $1 RETURNING *',
      [labQuestionId]
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
