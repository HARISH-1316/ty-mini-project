// ──────────────────────────────────────────────
// Lab Coding Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// This table now serves as the lab question bank.
// Questions are associated with topics, not directly with labs.
// lab_id is nullable (legacy questions may have it set).
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LabCodingQuestionModel = {
  /**
   * Create a new question in the bank (associated with a topic).
   */
  create: async ({
    topic_id,
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
    lab_id = null,
  }) => {
    const result = await query(
      `INSERT INTO lab_coding_questions
         (topic_id, lab_id, title, problem_statement, input_format, output_format,
          constraints, sample_input, sample_output, explanation,
          difficulty, marks, order_index, created_by_faculty_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        topic_id || null,
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
      ]
    );
    return result.rows[0];
  },

  findById: async (labQuestionId) => {
    const result = await query(
      `SELECT lcq.*, t.title AS topic_title
       FROM lab_coding_questions lcq
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       WHERE lcq.lab_question_id = $1`,
      [labQuestionId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find all questions in the bank for a specific topic.
   */
  findByTopicId: async (topicId) => {
    const result = await query(
      `SELECT lcq.*, t.title AS topic_title
       FROM lab_coding_questions lcq
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       WHERE lcq.topic_id = $1
       ORDER BY lcq.difficulty, lcq.order_index NULLS LAST, lcq.lab_question_id`,
      [topicId]
    );
    return result.rows;
  },

  /**
   * Find all questions created by a specific faculty member.
   */
  findByFacultyId: async (facultyId) => {
    const result = await query(
      `SELECT lcq.*, t.title AS topic_title
       FROM lab_coding_questions lcq
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       WHERE lcq.created_by_faculty_id = $1
       ORDER BY lcq.created_at DESC`,
      [facultyId]
    );
    return result.rows;
  },

  /**
   * Find all questions (admin/faculty view, optional topicId filter).
   */
  findAll: async (topicId = null) => {
    const params = [];
    let whereClause = '';
    if (topicId) {
      params.push(topicId);
      whereClause = 'WHERE lcq.topic_id = $1';
    }
    const result = await query(
      `SELECT lcq.*, t.title AS topic_title
       FROM lab_coding_questions lcq
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       ${whereClause}
       ORDER BY t.title NULLS LAST, lcq.difficulty, lcq.lab_question_id`,
      params
    );
    return result.rows;
  },

  /**
   * Legacy: find questions by lab_id (for old direct-linked questions).
   */
  findByLabId: async (labId) => {
    const result = await query(
      'SELECT * FROM lab_coding_questions WHERE lab_id = $1 ORDER BY order_index NULLS LAST, lab_question_id',
      [labId]
    );
    return result.rows;
  },

  update: async (labQuestionId, {
    topic_id,
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
  }) => {
    const result = await query(
      `UPDATE lab_coding_questions
       SET topic_id = COALESCE($1, topic_id),
           title = COALESCE($2, title),
           problem_statement = COALESCE($3, problem_statement),
           input_format = COALESCE($4, input_format),
           output_format = COALESCE($5, output_format),
           constraints = COALESCE($6, constraints),
           sample_input = COALESCE($7, sample_input),
           sample_output = COALESCE($8, sample_output),
           explanation = COALESCE($9, explanation),
           difficulty = COALESCE($10, difficulty),
           marks = COALESCE($11, marks),
           order_index = COALESCE($12, order_index)
       WHERE lab_question_id = $13
       RETURNING *`,
      [
        topic_id, title, problem_statement, input_format, output_format,
        constraints, sample_input, sample_output, explanation,
        difficulty, marks, order_index, labQuestionId,
      ]
    );
    return result.rows[0] || null;
  },

  deleteById: async (labQuestionId) => {
    const result = await query(
      'DELETE FROM lab_coding_questions WHERE lab_question_id = $1 RETURNING lab_question_id',
      [labQuestionId]
    );
    return result.rows[0] || null;
  },
};

export default LabCodingQuestionModel;
