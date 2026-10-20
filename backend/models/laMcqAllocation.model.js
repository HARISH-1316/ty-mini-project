// ──────────────────────────────────────────────
// Lab Assessment Student MCQ Allocation Model
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaMcqAllocationModel = {
  bulkCreate: async (dbClient, studentId, labId, items, isManual = false) => {
    if (!items || items.length === 0) return [];
    const values = [];
    const params = [labId, studentId, isManual];
    let pIdx = 4;

    for (const item of items) {
      values.push(`($1, $2, $${pIdx}, $${pIdx + 1}, $3)`);
      params.push(item.mcq_id, item.question_order);
      pIdx += 2;
    }

    const result = await dbClient.query(
      `INSERT INTO la_student_mcq_allocations
         (lab_id, student_id, mcq_id, question_order, is_manual)
       VALUES ${values.join(', ')}
       ON CONFLICT (lab_id, student_id, mcq_id) DO NOTHING
       RETURNING *`,
      params
    );
    return result.rows;
  },

  /**
   * For student attempt: strictly omits correct_option, explanation, and individual marks.
   */
  findByStudentAndLab: async (studentId, labId, dbClient = null) => {
    const exec = dbClient ? (text, params) => dbClient.query(text, params) : query;
    const result = await exec(
      `SELECT a.allocation_id, a.lab_id, a.student_id, a.mcq_id, a.question_order,
              q.topic_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
              t.title AS topic_title,
              s.selected_option, s.submitted_at AS answered_at
       FROM la_student_mcq_allocations a
       JOIN lab_mcq_questions q ON a.mcq_id = q.mcq_id
       JOIN topics t ON q.topic_id = t.topic_id
       LEFT JOIN la_attempts att ON att.lab_id = a.lab_id AND att.student_id = a.student_id
       LEFT JOIN la_mcq_submissions s ON s.attempt_id = att.attempt_id AND s.mcq_id = a.mcq_id
       WHERE a.lab_id = $1 AND a.student_id = $2
       ORDER BY a.question_order ASC`,
      [labId, studentId]
    );
    return result.rows;
  },

  /**
   * For faculty/results: includes correct_option, explanation, and marks.
   */
  findByStudentAndLabDetailed: async (studentId, labId, dbClient = null) => {
    const exec = dbClient ? (text, params) => dbClient.query(text, params) : query;
    const result = await exec(
      `SELECT a.allocation_id, a.lab_id, a.student_id, a.mcq_id, a.question_order,
              q.topic_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
              q.correct_option, q.explanation, q.difficulty, q.marks,
              t.title AS topic_title,
              s.selected_option, s.is_correct, s.marks_obtained, s.submitted_at AS answered_at
       FROM la_student_mcq_allocations a
       JOIN lab_mcq_questions q ON a.mcq_id = q.mcq_id
       JOIN topics t ON q.topic_id = t.topic_id
       LEFT JOIN la_attempts att ON att.lab_id = a.lab_id AND att.student_id = a.student_id
       LEFT JOIN la_mcq_submissions s ON s.attempt_id = att.attempt_id AND s.mcq_id = a.mcq_id
       WHERE a.lab_id = $1 AND a.student_id = $2
       ORDER BY a.question_order ASC`,
      [labId, studentId]
    );
    return result.rows;
  },

  getEligiblePool: async (labId, dbClient = null) => {
    const exec = dbClient ? (text, params) => dbClient.query(text, params) : query;
    const result = await exec(
      `SELECT DISTINCT q.mcq_id, q.topic_id, q.question_text, q.option_a, q.option_b,
                       q.option_c, q.option_d, q.correct_option, q.explanation,
                       q.difficulty, q.marks, t.title AS topic_title
       FROM lab_mcq_questions q
       JOIN la_assessment_topics lat ON q.topic_id = lat.topic_id
       JOIN topics t ON q.topic_id = t.topic_id
       WHERE lat.lab_id = $1
         AND q.status = 'published'
         AND q.is_published = TRUE
       ORDER BY q.mcq_id ASC`,
      [labId]
    );
    return result.rows;
  },

  findAllocationsByLab: async (labId) => {
    const result = await query(
      `SELECT a.allocation_id, a.lab_id, a.student_id, a.mcq_id, a.question_order, a.is_manual,
              u.name AS student_name, st.roll_number,
              q.question_text, q.difficulty, q.marks
       FROM la_student_mcq_allocations a
       JOIN student st ON a.student_id = st.student_id
       JOIN users u ON st.user_id = u.user_id
       JOIN lab_mcq_questions q ON a.mcq_id = q.mcq_id
       WHERE a.lab_id = $1
       ORDER BY a.student_id ASC, a.question_order ASC`,
      [labId]
    );
    return result.rows;
  },
};

export default LaMcqAllocationModel;
