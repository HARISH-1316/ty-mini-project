// ──────────────────────────────────────────────
// LA Selected Questions Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Manages explicitly selected questions for a lab assessment (Mode A & Mode C)
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaSelectedQuestionModel = {
  /**
   * Find all questions selected for a specific lab assessment.
   */
  findByLabId: async (labId, client = null) => {
    const executor = client || { query };
    const result = await executor.query(
      `SELECT lsq.id, lsq.lab_id, lsq.question_order,
              lcq.lab_question_id, lcq.title, lcq.problem_statement,
              lcq.difficulty, lcq.marks, lcq.topic_id, lcq.subtopic_id,
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
   */
  bulkSet: async (labId, questionIds, client = null) => {
    const executor = client || { query };
    await executor.query('DELETE FROM la_selected_questions WHERE lab_id = $1', [labId]);
    if (!Array.isArray(questionIds) || questionIds.length === 0) return [];

    const inserted = [];
    for (let i = 0; i < questionIds.length; i++) {
      const qId = questionIds[i];
      const res = await executor.query(
        `INSERT INTO la_selected_questions (lab_id, lab_question_id, question_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (lab_id, lab_question_id) DO NOTHING
         RETURNING *`,
        [labId, qId, i + 1]
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
