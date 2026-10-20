// ──────────────────────────────────────────────
// Assessment Selected MCQs Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaSelectedMcqModel = {
  bulkSet: async (labId, mcqIds, dbClient = null) => {
    const exec = dbClient ? (text, params) => dbClient.query(text, params) : query;
    await exec('DELETE FROM la_selected_mcqs WHERE lab_id = $1', [labId]);
    if (!mcqIds || mcqIds.length === 0) return [];

    const values = [];
    const params = [labId];
    mcqIds.forEach((id, idx) => {
      params.push(id, idx + 1);
      values.push(`($1, $${params.length - 1}, $${params.length})`);
    });

    const result = await exec(
      `INSERT INTO la_selected_mcqs (lab_id, mcq_id, question_order)
       VALUES ${values.join(', ')}
       RETURNING *`,
      params
    );
    return result.rows;
  },

  findByLabId: async (labId, dbClient = null) => {
    const exec = dbClient ? (text, params) => dbClient.query(text, params) : query;
    const result = await exec(
      `SELECT sm.id, sm.lab_id, sm.mcq_id, sm.question_order,
              q.topic_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
              q.correct_option, q.explanation, q.difficulty, q.marks, q.status, q.is_published,
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
