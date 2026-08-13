// ──────────────────────────────────────────────
// Room Controller
// ──────────────────────────────────────────────

import RoomService from '../services/room.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

export const createRoom = asyncHandler(async (req, res) => {
  const room = await RoomService.createRoom(req.user.user_id, req.body);
  return successResponse(res, 201, 'Room created successfully.', { room });
});

export const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await RoomService.getUserRooms(req.user.user_id, req.user.role);
  return successResponse(res, 200, 'Rooms retrieved successfully.', { rooms });
});

export const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await RoomService.getRoomById(roomId);
  return successResponse(res, 200, 'Room details retrieved.', { room });
});

export const updateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await RoomService.updateRoom(roomId, req.user.user_id, req.body);
  return successResponse(res, 200, 'Room updated successfully.', { room });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  await RoomService.deleteRoom(roomId, req.user.user_id);
  return successResponse(res, 200, 'Room deleted successfully.');
});

export const joinRoom = asyncHandler(async (req, res) => {
  const { room_code } = req.body;
  const result = await RoomService.joinRoom(req.user.user_id, room_code);
  return successResponse(res, 200, 'Joined room successfully.', result);
});

export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  await RoomService.leaveRoom(req.user.user_id, roomId);
  return successResponse(res, 200, 'Left room successfully.');
});

export const getRoomTopics = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const topics = await RoomService.getRoomTopics(roomId);
  return successResponse(res, 200, 'Room topics retrieved.', { topics });
});

export const addTopicToRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const roomTopic = await RoomService.addTopicToRoom(roomId, req.user.user_id, req.body);
  return successResponse(res, 201, 'Topic added to room.', { roomTopic });
});

export const removeTopicFromRoom = asyncHandler(async (req, res) => {
  const { roomId, topicId } = req.params;
  await RoomService.removeTopicFromRoom(roomId, topicId, req.user.user_id);
  return successResponse(res, 200, 'Topic removed from room.');
});
