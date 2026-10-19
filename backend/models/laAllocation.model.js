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
   * IMPORTANT: difficulty and marks are intentionally excluded from this
   * student-facing query. Students must not see per-question difficulty
   * labels or individual marks before or during an assessment.
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
         -- difficulty and marks intentionally omitted: must not be visible to students
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
  bulkCreate: async (client, studentId, labId, questions, isManual = false) => {
    const inserted = [];
    for (const q of questions) {
      const result = await client.query(
        `INSERT INTO la_student_allocations
           (lab_id, student_id, lab_question_id, question_order, is_manual)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (lab_id, student_id, lab_question_id) DO NOTHING
         RETURNING *`,
        [labId, studentId, q.lab_question_id, q.question_order, !!isManual]
      );
      if (result.rows[0]) inserted.push(result.rows[0]);
    }
    return inserted;
  },

  /**
   * Find student allocations by lab (for faculty overview / hybrid mode check).
   */
  findAllocationsByLab: async (labId) => {
    const result = await query(
      `SELECT a.*, s.roll_number, u.name AS student_name, lcq.title AS question_title
       FROM la_student_allocations a
       JOIN student s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       JOIN lab_coding_questions lcq ON a.lab_question_id = lcq.lab_question_id
       WHERE a.lab_id = $1
       ORDER BY s.roll_number, a.question_order`,
      [labId]
    );
    return result.rows;
  },

  /**
   * Find manual allocations for a student in a lab.
   */
  findManualForStudent: async (studentId, labId) => {
    const result = await query(
      `SELECT * FROM la_student_allocations
       WHERE lab_id = $1 AND student_id = $2 AND is_manual = TRUE
       ORDER BY question_order`,
      [labId, studentId]
    );
    return result.rows;
  },

  /**
   * Get eligible questions from the pool for a given lab (across all selected topics).
   * ONLY published, non-archived questions are returned.
   */
  getEligiblePool: async (labId) => {
    const result = await query(
      `SELECT DISTINCT lcq.lab_question_id, lcq.marks, lcq.difficulty, lcq.title
       FROM la_assessment_topics lat
       JOIN lab_coding_questions lcq ON lcq.topic_id = lat.topic_id
       WHERE lat.lab_id = $1
         AND lcq.is_archived = FALSE
         AND lcq.is_published = TRUE
         AND lcq.status = 'published'
       ORDER BY lcq.lab_question_id`,
      [labId]
    );
    return result.rows;
  },
};

export default LaAllocationModel;
