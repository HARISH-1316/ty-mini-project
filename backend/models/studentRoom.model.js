// ──────────────────────────────────────────────
// StudentRoom Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const StudentRoomModel = {
  /**
   * Join a student to a room.
   */
  create: async ({ student_id, room_id }) => {
    const result = await query(
      `INSERT INTO student_rooms (student_id, room_id)
       VALUES ($1, $2)
       RETURNING *`,
      [student_id, room_id]
    );
    return result.rows[0];
  },

  /**
   * Find all rooms a student has joined.
   */
  findByStudentId: async (studentId) => {
    const result = await query(
      'SELECT * FROM student_rooms WHERE student_id = $1 ORDER BY joined_at DESC',
      [studentId]
    );
    return result.rows;
  },

  /**
   * Find all students in a room.
   */
  findByRoomId: async (roomId) => {
    const result = await query(
      `SELECT sr.*, s.roll_number, s.course, s.year, u.name, u.email
       FROM student_rooms sr
       JOIN student s ON sr.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE sr.room_id = $1
       ORDER BY sr.joined_at`,
      [roomId]
    );
    return result.rows;
  },

  /**
   * Check if a student is already in a room.
   */
  findByStudentAndRoom: async (studentId, roomId) => {
    const result = await query(
      'SELECT * FROM student_rooms WHERE student_id = $1 AND room_id = $2',
      [studentId, roomId]
    );
    return result.rows[0] || null;
  },

  /**
   * Remove a student from a room.
   */
  deleteByStudentAndRoom: async (studentId, roomId) => {
    const result = await query(
      'DELETE FROM student_rooms WHERE student_id = $1 AND room_id = $2 RETURNING *',
      [studentId, roomId]
    );
    return result.rows[0] || null;
  },
};

export default StudentRoomModel;
