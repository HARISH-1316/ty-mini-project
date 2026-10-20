// ──────────────────────────────────────────────
// Room Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  createRoom,
  getMyRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  getRoomTopics,
  addTopicToRoom,
  removeTopicFromRoom,
  getRoomStudents,
  getRoomLabAssessments,
} from '../controllers/room.controller.js';
import { isAuthenticated, isFaculty, isStudent, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createRoomValidation,
  updateRoomValidation,
  joinRoomValidation,
  addTopicToRoomValidation,
} from '../validations/room.validation.js';

const router = Router();

// GET /api/rooms/my — Get user's rooms (Faculty or Student)
router.get('/my', isAuthenticated, getMyRooms);

// POST /api/rooms/join — Join a room by room code (Student only)
router.post('/join', isAuthenticated, isStudent, validate(joinRoomValidation), joinRoom);

// POST /api/rooms — Create a room (Faculty only)
router.post('/', isAuthenticated, isFacultyOrAdmin, validate(createRoomValidation), createRoom);

// GET /api/rooms/:roomId — Get room details
router.get('/:roomId', isAuthenticated, getRoomById);

// PUT /api/rooms/:roomId — Update a room (Faculty owner only)
router.put('/:roomId', isAuthenticated, isFacultyOrAdmin, validate(updateRoomValidation), updateRoom);

// DELETE /api/rooms/:roomId — Delete a room (Faculty owner only)
router.delete('/:roomId', isAuthenticated, isFacultyOrAdmin, deleteRoom);

// POST /api/rooms/:roomId/leave — Leave a room (Student only)
router.post('/:roomId/leave', isAuthenticated, isStudent, leaveRoom);

// GET /api/rooms/:roomId/topics — Get room topics
router.get('/:roomId/topics', isAuthenticated, getRoomTopics);

// POST /api/rooms/:roomId/topics — Add topic to room (Faculty owner only)
router.post('/:roomId/topics', isAuthenticated, isFacultyOrAdmin, validate(addTopicToRoomValidation), addTopicToRoom);

// DELETE /api/rooms/:roomId/topics/:topicId — Remove topic from room (Faculty owner only)
router.delete('/:roomId/topics/:topicId', isAuthenticated, isFacultyOrAdmin, removeTopicFromRoom);

// GET /api/rooms/:roomId/students — Get enrolled students (Faculty owner or Admin)
router.get('/:roomId/students', isAuthenticated, isFacultyOrAdmin, getRoomStudents);

// GET /api/rooms/:roomId/lab-assessments — Get room lab assessments (Faculty or enrolled Student)
router.get('/:roomId/lab-assessments', isAuthenticated, getRoomLabAssessments);

export default router;
