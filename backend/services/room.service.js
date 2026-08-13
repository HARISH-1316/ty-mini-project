// ──────────────────────────────────────────────
// Room Service — Business Logic
// ──────────────────────────────────────────────

import crypto from 'crypto';
import RoomModel from '../models/room.model.js';
import FacultyModel from '../models/faculty.model.js';
import StudentModel from '../models/student.model.js';
import StudentRoomModel from '../models/studentRoom.model.js';
import RoomTopicModel from '../models/roomTopic.model.js';

/**
 * Generate a random 6-character uppercase room code.
 */
const generateRoomCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const RoomService = {
  /**
   * Create a new room (Faculty only).
   */
  createRoom: async (userId, { room_name, description }) => {
    const faculty = await FacultyModel.findByUserId(userId);
    if (!faculty) {
      const error = new Error('Faculty profile not found.');
      error.statusCode = 404;
      throw error;
    }

    let room_code = generateRoomCode();
    // Ensure room_code is unique
    let existing = await RoomModel.findByCode(room_code);
    while (existing) {
      room_code = generateRoomCode();
      existing = await RoomModel.findByCode(room_code);
    }

    const room = await RoomModel.create({
      faculty_id: faculty.faculty_id,
      room_name,
      room_code,
      description,
    });

    return room;
  },

  /**
   * Get rooms relevant to the authenticated user.
   */
  getUserRooms: async (userId, role) => {
    if (role === 'faculty') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty) return [];
      return RoomModel.findByFacultyId(faculty.faculty_id);
    } else if (role === 'student') {
      const student = await StudentModel.findByUserId(userId);
      if (!student) return [];
      return RoomModel.findByStudentId(student.student_id);
    } else if (role === 'admin') {
      return RoomModel.findAll();
    }
    return [];
  },

  /**
   * Get room details by ID.
   */
  getRoomById: async (roomId) => {
    const room = await RoomModel.findById(roomId);
    if (!room) {
      const error = new Error('Room not found.');
      error.statusCode = 404;
      throw error;
    }
    return room;
  },

  /**
   * Update room details (Faculty owner only).
   */
  updateRoom: async (roomId, userId, { room_name, description }) => {
    const room = await RoomModel.findById(roomId);
    if (!room) {
      const error = new Error('Room not found.');
      error.statusCode = 404;
      throw error;
    }

    const faculty = await FacultyModel.findByUserId(userId);
    if (!faculty || room.faculty_id !== faculty.faculty_id) {
      const error = new Error('Access denied. You do not own this room.');
      error.statusCode = 403;
      throw error;
    }

    return RoomModel.update(roomId, { room_name, description });
  },

  /**
   * Delete a room (Faculty owner only).
   */
  deleteRoom: async (roomId, userId) => {
    const room = await RoomModel.findById(roomId);
    if (!room) {
      const error = new Error('Room not found.');
      error.statusCode = 404;
      throw error;
    }

    const faculty = await FacultyModel.findByUserId(userId);
    if (!faculty || room.faculty_id !== faculty.faculty_id) {
      const error = new Error('Access denied. You do not own this room.');
      error.statusCode = 403;
      throw error;
    }

    return RoomModel.deleteById(roomId);
  },

  /**
   * Join a room using room code (Student only).
   */
  joinRoom: async (userId, roomCode) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const room = await RoomModel.findByCode(roomCode.toUpperCase());
    if (!room) {
      const error = new Error('Invalid room code. Room not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check duplicate membership
    const existingMembership = await StudentRoomModel.findByStudentAndRoom(
      student.student_id,
      room.room_id
    );
    if (existingMembership) {
      const error = new Error('You have already joined this room.');
      error.statusCode = 409;
      throw error;
    }

    const membership = await StudentRoomModel.create({
      student_id: student.student_id,
      room_id: room.room_id,
    });

    return {
      membership,
      room,
    };
  },

  /**
   * Leave a room (Student only).
   */
  leaveRoom: async (userId, roomId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const existingMembership = await StudentRoomModel.findByStudentAndRoom(
      student.student_id,
      roomId
    );
    if (!existingMembership) {
      const error = new Error('You are not a member of this room.');
      error.statusCode = 404;
      throw error;
    }

    return StudentRoomModel.deleteByStudentAndRoom(student.student_id, roomId);
  },

  /**
   * Get topics associated with a room.
   */
  getRoomTopics: async (roomId) => {
    await RoomService.getRoomById(roomId);
    return RoomTopicModel.findByRoomId(roomId);
  },

  /**
   * Add a topic to a room (Faculty owner only).
   */
  addTopicToRoom: async (roomId, userId, { topic_id, order_index }) => {
    const room = await RoomService.getRoomById(roomId);
    const faculty = await FacultyModel.findByUserId(userId);
    if (!faculty || room.faculty_id !== faculty.faculty_id) {
      const error = new Error('Access denied. You do not own this room.');
      error.statusCode = 403;
      throw error;
    }

    return RoomTopicModel.create({
      room_id: roomId,
      topic_id,
      order_index,
    });
  },

  /**
   * Remove a topic from a room (Faculty owner only).
   */
  removeTopicFromRoom: async (roomId, topicId, userId) => {
    const room = await RoomService.getRoomById(roomId);
    const faculty = await FacultyModel.findByUserId(userId);
    if (!faculty || room.faculty_id !== faculty.faculty_id) {
      const error = new Error('Access denied. You do not own this room.');
      error.statusCode = 403;
      throw error;
    }

    return RoomTopicModel.deleteByRoomAndTopic(roomId, topicId);
  },
};

export default RoomService;
