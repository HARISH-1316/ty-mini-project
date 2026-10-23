// ──────────────────────────────────────────────
// LA Proctoring Violation Model — Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const LaProctoringViolationModel = {
  create: async ({ lab_id, student_id, attempt_id, violation_type, details }) => {
    // Ensure table exists gracefully
    await query(`
      CREATE TABLE IF NOT EXISTS la_proctoring_violations (
        violation_id SERIAL PRIMARY KEY,
        lab_id INT NOT NULL,
        student_id INT NOT NULL,
        attempt_id INT,
        violation_type VARCHAR(50) NOT NULL,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});

    const result = await query(
      `INSERT INTO la_proctoring_violations
         (lab_id, student_id, attempt_id, violation_type, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lab_id, student_id, attempt_id || null, violation_type, details || '']
    );
    return result.rows[0] || null;
  },

  findByLabId: async (labId) => {
    // Ensure table exists gracefully
    await query(`
      CREATE TABLE IF NOT EXISTS la_proctoring_violations (
        violation_id SERIAL PRIMARY KEY,
        lab_id INT NOT NULL,
        student_id INT NOT NULL,
        attempt_id INT,
        violation_type VARCHAR(50) NOT NULL,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});

    const result = await query(
      `SELECT
         v.*,
         s.roll_number,
         u.name AS student_name,
         u.email AS student_email
       FROM la_proctoring_violations v
       JOIN student s ON v.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE v.lab_id = $1
       ORDER BY v.created_at DESC`,
      [labId]
    );
    return result.rows || [];
  },

  countByLabAndStudent: async (labId, studentId) => {
    try {
      const result = await query(
        `SELECT COUNT(*) AS count
         FROM la_proctoring_violations
         WHERE lab_id = $1 AND student_id = $2`,
        [labId, studentId]
      );
      return parseInt(result.rows[0]?.count || 0, 10);
    } catch {
      return 0;
    }
  },

  findRecentByFacultyId: async (facultyId, isAdmin = false) => {
    await query(`
      CREATE TABLE IF NOT EXISTS la_proctoring_violations (
        violation_id SERIAL PRIMARY KEY,
        lab_id INT NOT NULL,
        student_id INT NOT NULL,
        attempt_id INT,
        violation_type VARCHAR(50) NOT NULL,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});

    let sql = `
      SELECT
        v.*,
        s.roll_number,
        u.name AS student_name,
        u.email AS student_email,
        la.title AS lab_title,
        r.title AS room_title
      FROM la_proctoring_violations v
      JOIN student s ON v.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      JOIN lab_assessment la ON v.lab_id = la.lab_id
      LEFT JOIN rooms r ON la.room_id = r.room_id
    `;
    const params = [];

    if (!isAdmin && facultyId) {
      sql += ` WHERE la.faculty_id = $1 `;
      params.push(facultyId);
    }

    sql += ` ORDER BY v.created_at DESC LIMIT 30`;

    try {
      const result = await query(sql, params);
      return result.rows || [];
    } catch {
      return [];
    }
  },
};

export default LaProctoringViolationModel;
