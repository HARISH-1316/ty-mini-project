// ──────────────────────────────────────────────
// Topic & Content API
// ──────────────────────────────────────────────

import api from './axios';

// Topics
export const getAllTopicsApi = async () => {
  const response = await api.get('/topics');
  return response.data;
};

export const getTopicByIdApi = async (topicId) => {
  const response = await api.get(`/topics/${topicId}`);
  return response.data;
};

export const createTopicApi = async (data) => {
  const response = await api.post('/topics', data);
  return response.data;
};

export const updateTopicApi = async (topicId, data) => {
  const response = await api.put(`/topics/${topicId}`, data);
  return response.data;
};

export const deleteTopicApi = async (topicId) => {
  const response = await api.delete(`/topics/${topicId}`);
  return response.data;
};

// Subtopics & Content
export const createSubtopicApi = async (topicId, data) => {
  const response = await api.post(`/topics/${topicId}/subtopics`, data);
  return response.data;
};

export const getSubtopicByIdApi = async (subtopicId) => {
  const response = await api.get(`/topics/subtopics/${subtopicId}`);
  return response.data;
};

export const updateSubtopicApi = async (subtopicId, data) => {
  const response = await api.put(`/topics/subtopics/${subtopicId}`, data);
  return response.data;
};

export const deleteSubtopicApi = async (subtopicId) => {
  const response = await api.delete(`/topics/subtopics/${subtopicId}`);
  return response.data;
};

export const upsertSubtopicContentApi = async (subtopicId, data) => {
  const response = await api.put(`/topics/subtopics/${subtopicId}/content`, data);
  return response.data;
};

// Topic Feedback (Student only, 1-5 rating)
export const createTopicFeedbackApi = async (topicId, data) => {
  const response = await api.post(`/topics/${topicId}/feedback`, data);
  return response.data;
};

export const getTopicFeedbackApi = async (topicId) => {
  const response = await api.get(`/topics/${topicId}/feedback`);
  return response.data;
};

export const updateTopicFeedbackApi = async (topicId, data) => {
  const response = await api.put(`/topics/${topicId}/feedback`, data);
  return response.data;
};

export const deleteTopicFeedbackApi = async (topicId) => {
  const response = await api.delete(`/topics/${topicId}/feedback`);
  return response.data;
};

// Student Progress
export const updateProgressApi = async (topicId, data) => {
  const response = await api.post(`/topics/${topicId}/progress`, data);
  return response.data;
};

export const getMyProgressApi = async () => {
  const response = await api.get('/topics/progress/my');
  return response.data;
};
