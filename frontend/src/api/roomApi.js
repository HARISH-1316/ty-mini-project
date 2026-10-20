// ──────────────────────────────────────────────
// Room API
// ──────────────────────────────────────────────

import api from './axios';

export const getMyRoomsApi = async () => {
  const response = await api.get('/rooms/my');
  return response.data;
};

export const getRoomByIdApi = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};

export const createRoomApi = async (data) => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const updateRoomApi = async (roomId, data) => {
  const response = await api.put(`/rooms/${roomId}`, data);
  return response.data;
};

export const deleteRoomApi = async (roomId) => {
  const response = await api.delete(`/rooms/${roomId}`);
  return response.data;
};

export const joinRoomApi = async (data) => {
  const response = await api.post('/rooms/join', data);
  return response.data;
};

export const leaveRoomApi = async (roomId) => {
  const response = await api.post(`/rooms/${roomId}/leave`);
  return response.data;
};

export const getRoomTopicsApi = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}/topics`);
  return response.data;
};

export const addTopicToRoomApi = async (roomId, data) => {
  const response = await api.post(`/rooms/${roomId}/topics`, data);
  return response.data;
};

export const removeTopicFromRoomApi = async (roomId, topicId) => {
  const response = await api.delete(`/rooms/${roomId}/topics/${topicId}`);
  return response.data;
};

export const getRoomStudentsApi = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}/students`);
  return response.data;
};

export const getRoomLabAssessmentsApi = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}/lab-assessments`);
  return response.data;
};
