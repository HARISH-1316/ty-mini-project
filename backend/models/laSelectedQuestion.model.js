// ──────────────────────────────────────────────
// LA Selected Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Manages explicitly selected questions for a lab assessment (Mode A & Mode C)
// Stores assessment-specific snapshot marks that override question bank defaults.
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaSelectedQuestionModel = {
  /**
   * Find all questions selected for a specific lab assessment.
   * Assessment-specific marks from la_selected_questions are authoritative.
   */
  findByLabId: async (labId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `SELECT lsq.id, lsq.lab_id, lsq.question_order,
              COALESCE(lsq.marks, lcq.marks, 10) AS marks,
              lsq.marks AS configured_marks,
              lcq.marks AS question_bank_marks,
              lcq.lab_question_id, lcq.title, lcq.problem_statement,
              lcq.difficulty, lcq.topic_id, lcq.subtopic_id,
              lcq.input_format, lcq.output_format, lcq.constraints,
              lcq.sample_input, lcq.sample_output, lcq.explanation,
              lcq.is_published, lcq.status,
              t.title AS topic_title,
              st.title AS subtopic_title
       FROM la_selected_questions lsq
       JOIN lab_coding_questions lcq ON lsq.lab_question_id = lcq.lab_question_id
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       LEFT JOIN subtopics st ON lcq.subtopic_id = st.subtopic_id
       WHERE lsq.lab_id = $1
       ORDER BY lsq.question_order, lsq.id`,
      [labId]
    );
    return result.rows;
  },

  /**
   * Replace all selected questions for a lab assessment.
   * Supports either an array of question IDs or an array of { lab_question_id, marks }.
   */
  bulkSet: async (labId, questions, client = null, defaultMarks = 10) => {
    const executor = client || { query };
    await executor.query('DELETE FROM la_selected_questions WHERE lab_id = $1', [labId]);
    if (!Array.isArray(questions) || questions.length === 0) return [];

    const inserted = [];
    for (let i = 0; i < questions.length; i++) {
      const item = questions[i];
      const qId = typeof item === 'object' && item !== null ? (item.lab_question_id || item.id) : item;
      const qMarks = typeof item === 'object' && item !== null && item.marks !== undefined
        ? Math.max(1, parseInt(item.marks, 10) || 10)
        : Math.max(1, parseInt(defaultMarks, 10) || 10);

      const res = await executor.query(
        `INSERT INTO la_selected_questions (lab_id, lab_question_id, question_order, marks)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (lab_id, lab_question_id) DO UPDATE
         SET marks = EXCLUDED.marks, question_order = EXCLUDED.question_order
         RETURNING *`,
        [labId, qId, i + 1, qMarks]
      );
      if (res.rows[0]) inserted.push(res.rows[0]);
    }
    return inserted;
  },

  /**
   * Delete selected questions for a lab.
   */
  deleteByLabId: async (labId, client = null) => {
    const executor = client || { query };
    await executor.query('DELETE FROM la_selected_questions WHERE lab_id = $1', [labId]);
  },
};

export default LaSelectedQuestionModel;
