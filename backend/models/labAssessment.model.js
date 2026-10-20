// ──────────────────────────────────────────────
// Lab Assessment Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LabAssessmentModel = {
  create: async ({
    faculty_id,
    room_id,
    title,
    description,
    start_time,
    end_time,
    duration,
    total_marks,
    num_coding_questions = 3,
    num_mcq_questions = 0,
    marks_per_question = 10,
    marks_per_mcq = 2,
    allocation_mode = 'random',
    status = 'draft',
  }) => {
    const totalQCount = (parseInt(num_coding_questions, 10) || 0) + (parseInt(num_mcq_questions, 10) || 0);
    const calculatedTotalMarks =
      total_marks ||
      ((parseInt(num_coding_questions, 10) || 0) * (parseInt(marks_per_question, 10) || 10) +
        (parseInt(num_mcq_questions, 10) || 0) * (parseInt(marks_per_mcq, 10) || 2));
    const allowedStatuses = ['draft', 'published', 'active'];
    const validStatus = allowedStatuses.includes(status) ? status : 'draft';

    const result = await query(
      `INSERT INTO lab_assessment
         (faculty_id, room_id, title, description, start_time, end_time,
          duration, total_marks, num_coding_questions, num_mcq_questions, num_questions,
          marks_per_question, marks_per_mcq, allocation_mode, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        faculty_id,
        room_id,
        title,
        description || null,
        start_time || null,
        end_time || null,
        duration || null,
        calculatedTotalMarks,
        parseInt(num_coding_questions, 10) || 0,
        parseInt(num_mcq_questions, 10) || 0,
        totalQCount,
        marks_per_question || 10,
        marks_per_mcq || 2,
        allocation_mode || 'random',
        validStatus,
      ]
    );
    return result.rows[0];
  },

  findById: async (labId) => {
    const result = await query(
      `SELECT la.*, r.room_name, r.room_code, u.name AS faculty_name, f.department
       FROM lab_assessment la
       LEFT JOIN rooms r ON la.room_id = r.room_id
       LEFT JOIN faculty f ON la.faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       WHERE la.lab_id = $1`,
      [labId]
    );
    return result.rows[0] || null;
  },

  findByFacultyId: async (facultyId, roomId = null) => {
    let sql = `
      SELECT la.*, r.room_name, r.room_code
      FROM lab_assessment la
      LEFT JOIN rooms r ON la.room_id = r.room_id
      WHERE la.faculty_id = $1
    `;
    const params = [facultyId];
    if (roomId) {
      sql += ' AND la.room_id = $2';
      params.push(roomId);
    }
    sql += ' ORDER BY la.lab_id DESC';
    const result = await query(sql, params);
    return result.rows;
  },

  findByRoomId: async (roomId) => {
    const result = await query(
      `SELECT la.*, r.room_name, r.room_code, u.name AS faculty_name
       FROM lab_assessment la
       LEFT JOIN rooms r ON la.room_id = r.room_id
       LEFT JOIN faculty f ON la.faculty_id = f.faculty_id
       LEFT JOIN users u ON f.user_id = u.user_id
       WHERE la.room_id = $1
       ORDER BY la.lab_id DESC`,
      [roomId]
    );
    return result.rows;
  },

  findAll: async (roomId = null) => {
    let sql = `
      SELECT la.*, r.room_name, r.room_code, u.name AS faculty_name
      FROM lab_assessment la
      LEFT JOIN rooms r ON la.room_id = r.room_id
      LEFT JOIN faculty f ON la.faculty_id = f.faculty_id
      LEFT JOIN users u ON f.user_id = u.user_id
    `;
    const params = [];
    if (roomId) {
      sql += ' WHERE la.room_id = $1';
      params.push(roomId);
    }
    sql += ' ORDER BY la.lab_id DESC';
    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Find published/active labs that a student is strictly eligible to see.
   * STRICT REQUIREMENT: Only returns LAs belonging to rooms the student has joined.
   */
  findEligibleForStudent: async (studentId, roomId = null) => {
    let sql = `
      SELECT DISTINCT la.*, r.room_name, r.room_code, u.name AS faculty_name
      FROM lab_assessment la
      JOIN rooms r ON la.room_id = r.room_id
      JOIN student_rooms sr ON sr.room_id = la.room_id
      LEFT JOIN faculty f ON la.faculty_id = f.faculty_id
      LEFT JOIN users u ON f.user_id = u.user_id
      WHERE sr.student_id = $1
        AND la.status IN ('published', 'active', 'completed')
        AND (la.end_time IS NULL OR la.end_time >= CURRENT_TIMESTAMP - INTERVAL '30 days')
    `;
    const params = [studentId];

    if (roomId) {
      sql += ' AND la.room_id = $2';
      params.push(roomId);
    }

    sql += ' ORDER BY la.start_time DESC NULLS LAST, la.lab_id DESC';
    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Check if a student is a member of the room containing this lab.
   */
  isStudentEnrolledInLabRoom: async (studentId, labId) => {
    const result = await query(
      `SELECT 1 FROM lab_assessment la
       JOIN student_rooms sr ON sr.room_id = la.room_id
       WHERE la.lab_id = $1 AND sr.student_id = $2`,
      [labId, studentId]
    );
    return result.rows.length > 0;
  },

  update: async (labId, {
    title,
    description,
    start_time,
    end_time,
    duration,
    total_marks,
    num_coding_questions,
    num_mcq_questions,
    marks_per_question,
    marks_per_mcq,
    allocation_mode,
  }) => {
    // If num_coding_questions or num_mcq_questions is passed, recalculate num_questions
    const current = await LabAssessmentModel.findById(labId);
    if (!current) return null;

    const nCoding = num_coding_questions !== undefined ? parseInt(num_coding_questions, 10) : current.num_coding_questions;
    const nMcq = num_mcq_questions !== undefined ? parseInt(num_mcq_questions, 10) : current.num_mcq_questions;
    const nTotal = nCoding + nMcq;

    const result = await query(
      `UPDATE lab_assessment
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           duration = COALESCE($5, duration),
           total_marks = COALESCE($6, total_marks),
           num_coding_questions = COALESCE($7, num_coding_questions),
           num_mcq_questions = COALESCE($8, num_mcq_questions),
           num_questions = COALESCE($9, num_questions),
           marks_per_question = COALESCE($10, marks_per_question),
           marks_per_mcq = COALESCE($11, marks_per_mcq),
           allocation_mode = COALESCE($12, allocation_mode)
       WHERE lab_id = $13
         AND status = 'draft'
       RETURNING *`,
      [
        title,
        description,
        start_time,
        end_time,
        duration,
        total_marks,
        nCoding,
        nMcq,
        nTotal,
        marks_per_question,
        marks_per_mcq,
        allocation_mode,
        labId,
      ]
    );
    return result.rows[0] || null;
  },

  updateStatus: async (labId, status) => {
    const result = await query(
      `UPDATE lab_assessment SET status = $2 WHERE lab_id = $1 RETURNING *`,
      [labId, status]
    );
    return result.rows[0] || null;
  },

  deleteById: async (labId) => {
    const result = await query(
      'DELETE FROM lab_assessment WHERE lab_id = $1 RETURNING lab_id',
      [labId]
    );
    return result.rows[0] || null;
  },

  syncStatuses: async () => {
    await query(
      `UPDATE lab_assessment
       SET status = 'active'
       WHERE status = 'published'
         AND start_time <= CURRENT_TIMESTAMP
         AND end_time > CURRENT_TIMESTAMP`
    );
    await query(
      `UPDATE lab_assessment
       SET status = 'completed'
       WHERE status IN ('published', 'active')
         AND end_time <= CURRENT_TIMESTAMP`
    );
  },
};

export default LabAssessmentModel;
