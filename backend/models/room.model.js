// ──────────────────────────────────────────────
// Room Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const RoomModel = {
  /**
   * Create a new room.
   */
  create: async ({ faculty_id, room_name, room_code, description }) => {
    const result = await query(
      `INSERT INTO rooms (faculty_id, room_name, room_code, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [faculty_id, room_name, room_code, description]
    );
    return result.rows[0];
  },

  /**
   * Find a room by room_id.
   */
  findById: async (roomId) => {
    const result = await query(
      `SELECT r.*, f.user_id AS faculty_user_id, u.name AS faculty_name
       FROM rooms r
       JOIN faculty f ON r.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE r.room_id = $1`,
      [roomId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a room by room_code.
   */
  findByCode: async (roomCode) => {
    const result = await query(
      'SELECT * FROM rooms WHERE room_code = $1',
      [roomCode]
    );
    return result.rows[0] || null;
  },

  /**
   * Find all rooms belonging to a faculty member.
   */
  findByFacultyId: async (facultyId) => {
    const result = await query(
      'SELECT * FROM rooms WHERE faculty_id = $1 ORDER BY created_at DESC',
      [facultyId]
    );
    return result.rows;
  },

  /**
   * Find all rooms a student has joined.
   */
  findByStudentId: async (studentId) => {
    const result = await query(
      `SELECT r.*, sr.joined_at, u.name AS faculty_name
       FROM rooms r
       JOIN student_rooms sr ON r.room_id = sr.room_id
       JOIN faculty f ON r.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE sr.student_id = $1
       ORDER BY sr.joined_at DESC`,
      [studentId]
    );
    return result.rows;
  },

  /**
   * Get all rooms.
   */
  findAll: async () => {
    const result = await query(
      `SELECT r.*, u.name AS faculty_name
       FROM rooms r
       JOIN faculty f ON r.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       ORDER BY r.created_at DESC`
    );
    return result.rows;
  },

  /**
   * Update a room.
   */
  update: async (roomId, { room_name, description }) => {
    const result = await query(
      `UPDATE rooms
       SET room_name = COALESCE($1, room_name),
           description = COALESCE($2, description)
       WHERE room_id = $3
       RETURNING *`,
      [room_name, description, roomId]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a room by room_id.
   */
  deleteById: async (roomId) => {
    const result = await query(
      'DELETE FROM rooms WHERE room_id = $1 RETURNING room_id',
      [roomId]
    );
    return result.rows[0] || null;
  },
};

export default RoomModel;
