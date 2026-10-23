// ──────────────────────────────────────────────
// Assessment Selected MCQs Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaSelectedMcqModel = {
  bulkSet: async (labId, mcqs, dbClient = null, defaultMarks = 2) => {
    const exec = dbClient ? (text, params) => dbClient.query(text, params) : query;
    await exec('DELETE FROM la_selected_mcqs WHERE lab_id = $1', [labId]);
    if (!mcqs || mcqs.length === 0) return [];

    const values = [];
    const params = [labId];
    let pIdx = 2;

    mcqs.forEach((item, idx) => {
      const mcqId = typeof item === 'object' && item !== null ? (item.mcq_id || item.id) : item;
      const mMarks = typeof item === 'object' && item !== null && item.marks !== undefined
        ? Math.max(1, parseInt(item.marks, 10) || 2)
        : Math.max(1, parseInt(defaultMarks, 10) || 2);

      values.push(`($1, $${pIdx}, $${pIdx + 1}, $${pIdx + 2})`);
      params.push(mcqId, idx + 1, mMarks);
      pIdx += 3;
    });

    const result = await exec(
      `INSERT INTO la_selected_mcqs (lab_id, mcq_id, question_order, marks)
       VALUES ${values.join(', ')}
       ON CONFLICT (lab_id, mcq_id) DO UPDATE
       SET marks = EXCLUDED.marks, question_order = EXCLUDED.question_order
       RETURNING *`,
      params
    );
    return result.rows;
  },

  findByLabId: async (labId, dbClient = null) => {
    const exec = dbClient ? (text, params) => dbClient.query(text, params) : query;
    const result = await exec(
      `SELECT sm.id, sm.lab_id, sm.mcq_id, sm.question_order,
              COALESCE(sm.marks, q.marks, 2) AS marks,
              q.topic_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
              q.correct_option, q.explanation, q.difficulty, q.status, q.is_published,
              t.title AS topic_title
       FROM la_selected_mcqs sm
       JOIN lab_mcq_questions q ON sm.mcq_id = q.mcq_id
       JOIN topics t ON q.topic_id = t.topic_id
       WHERE sm.lab_id = $1
       ORDER BY sm.question_order ASC`,
      [labId]
    );
    return result.rows;
  },

  deleteByLabId: async (labId) => {
    await query('DELETE FROM la_selected_mcqs WHERE lab_id = $1', [labId]);
  },
};

export default LaSelectedMcqModel;
