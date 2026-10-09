// ──────────────────────────────────────────────
// LA Student Allocations Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Persists the random question set assigned to
// each student for a specific lab assessment.
// Once saved, it is never regenerated.
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaAllocationModel = {
  /**
   * Check if an allocation already exists for this student+lab.
   */
  existsForStudentAndLab: async (studentId, labId) => {
    const result = await query(
      `SELECT 1 FROM la_student_allocations
       WHERE lab_id = $1 AND student_id = $2
       LIMIT 1`,
      [labId, studentId]
    );
    return result.rows.length > 0;
  },

  /**
   * Retrieve the persisted allocation for a student+lab.
   * Returns question rows ordered by question_order.
   * Hidden test case data is NOT included here (fetched separately).
   */
  findByStudentAndLab: async (studentId, labId) => {
    const result = await query(
      `SELECT
         a.allocation_id,
         a.question_order,
         a.allocated_at,
         lcq.lab_question_id,
         lcq.title,
         lcq.problem_statement,
         lcq.constraints,
         lcq.input_format,
         lcq.output_format,
         lcq.sample_input,
         lcq.sample_output,
         lcq.explanation,
         lcq.difficulty,
         lcq.marks,
         t.topic_id,
         t.title AS topic_title
       FROM la_student_allocations a
       JOIN lab_coding_questions lcq ON a.lab_question_id = lcq.lab_question_id
       LEFT JOIN topics t ON lcq.topic_id = t.topic_id
       WHERE a.lab_id = $1 AND a.student_id = $2
       ORDER BY a.question_order`,
      [labId, studentId]
    );
    return result.rows;
  },

  /**
   * Bulk-insert an allocation set for a student.
   * Uses INSERT ... ON CONFLICT DO NOTHING to handle concurrent requests safely.
   * questions: Array<{ lab_question_id, question_order }>
   */
  bulkCreate: async (client, studentId, labId, questions) => {
    const inserted = [];
    for (const q of questions) {
      const result = await client.query(
        `INSERT INTO la_student_allocations
           (lab_id, student_id, lab_question_id, question_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (lab_id, student_id, lab_question_id) DO NOTHING
         RETURNING *`,
        [labId, studentId, q.lab_question_id, q.question_order]
      );
      if (result.rows[0]) inserted.push(result.rows[0]);
    }
    return inserted;
  },

  /**
   * Get eligible questions from the pool for a given lab (across all selected topics).
   * Used to randomly sample from during allocation.
   */
  getEligiblePool: async (labId) => {
    const result = await query(
      `SELECT DISTINCT lcq.lab_question_id, lcq.marks
       FROM la_assessment_topics lat
       JOIN lab_coding_questions lcq ON lcq.topic_id = lat.topic_id
       WHERE lat.lab_id = $1
       ORDER BY lcq.lab_question_id`,
      [labId]
    );
    return result.rows;
  },
};

export default LaAllocationModel;
