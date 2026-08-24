// ──────────────────────────────────────────────
// Coding Submission Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const CodingSubmissionModel = {
  create: async ({ student_id, assessment_type, assessment_ref_id, question_id, source_code, language, status, score, total_marks, questions_solved, total_questions, percentage }) => {
    const result = await query(
      `INSERT INTO coding_submissions (
        student_id, assessment_type, assessment_ref_id, question_id,
        source_code, language, status, score, total_marks,
        questions_solved, total_questions, percentage, submitted_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        student_id,
        assessment_type || 'topic',
        assessment_ref_id,
        question_id || null,
        source_code || '',
        language || 'cpp',
        status || 'Completed',
        score || 0,
        total_marks || 0,
        questions_solved || 0,
        total_questions || 0,
        percentage || 0,
      ]
    );
    return result.rows[0];
  },

  findByStudentId: async (studentId) => {
    const result = await query(
      `SELECT * FROM coding_submissions
       WHERE student_id = $1
       ORDER BY submitted_at DESC`,
      [studentId]
    );
    return result.rows;
  },

  findByStudentAndAssessment: async (studentId, assessmentType, assessmentRefId) => {
    const result = await query(
      `SELECT * FROM coding_submissions
       WHERE student_id = $1 AND assessment_type = $2 AND assessment_ref_id = $3
       ORDER BY submitted_at DESC`,
      [studentId, assessmentType, assessmentRefId]
    );
    return result.rows;
  },

  findBestSubmission: async (studentId, assessmentType, assessmentRefId) => {
    const result = await query(
      `SELECT * FROM coding_submissions
       WHERE student_id = $1 AND assessment_type = $2 AND assessment_ref_id = $3
       ORDER BY score DESC, submitted_at DESC
       LIMIT 1`,
      [studentId, assessmentType, assessmentRefId]
    );
    return result.rows[0] || null;
  },
};

export default CodingSubmissionModel;
