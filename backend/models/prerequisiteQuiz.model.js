// ──────────────────────────────────────────────
// Prerequisite Quiz Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const PrerequisiteQuizModel = {
  create: async ({ prereq_id, title, total_marks, passing_criteria, time_limit }) => {
    const result = await query(
      `INSERT INTO prerequisite_quiz (prereq_id, title, total_marks, passing_criteria, time_limit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [prereq_id, title || null, total_marks || 0, passing_criteria || 0, time_limit || 15]
    );
    return result.rows[0];
  },

  findById: async (prereqQuizId) => {
    const result = await query(
      'SELECT * FROM prerequisite_quiz WHERE prereq_quiz_id = $1',
      [prereqQuizId]
    );
    return result.rows[0] || null;
  },

  findByPrereqId: async (prereqId) => {
    const result = await query(
      'SELECT * FROM prerequisite_quiz WHERE prereq_id = $1 ORDER BY created_at DESC',
      [prereqId]
    );
    return result.rows;
  },

  update: async (prereqQuizId, { title, total_marks, passing_criteria, time_limit }) => {
    const result = await query(
      `UPDATE prerequisite_quiz
       SET title = COALESCE($1, title),
           total_marks = COALESCE($2, total_marks),
           passing_criteria = COALESCE($3, passing_criteria),
           time_limit = COALESCE($4, time_limit)
       WHERE prereq_quiz_id = $5
       RETURNING *`,
      [title, total_marks, passing_criteria, time_limit, prereqQuizId]
    );
    return result.rows[0] || null;
  },

  deleteById: async (prereqQuizId) => {
    const result = await query(
      'DELETE FROM prerequisite_quiz WHERE prereq_quiz_id = $1 RETURNING prereq_quiz_id',
      [prereqQuizId]
    );
    return result.rows[0] || null;
  },
};

export default PrerequisiteQuizModel;
