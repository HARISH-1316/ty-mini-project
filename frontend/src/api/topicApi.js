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
export const getTopicSubtopicsApi = async (topicId) => {
  const response = await api.get(`/topics/${topicId}/subtopics`);
  return response.data;
};

export const createSubtopicApi = async (topicId, data) => {
  const response = await api.post(`/topics/${topicId}/subtopics`, data);
  return response.data;
};

export const getSubtopicByIdApi = async (subtopicId) => {
  const response = await api.get(`/subtopics/${subtopicId}`);
  return response.data;
};

export const updateSubtopicApi = async (subtopicId, data) => {
  const response = await api.put(`/subtopics/${subtopicId}`, data);
  return response.data;
};

export const deleteSubtopicApi = async (subtopicId) => {
  const response = await api.delete(`/subtopics/${subtopicId}`);
  return response.data;
};

export const getSubtopicContentApi = async (subtopicId) => {
  const response = await api.get(`/subtopics/${subtopicId}/content`);
  return response.data;
};

export const createSubtopicContentApi = async (subtopicId, data) => {
  const response = await api.post(`/subtopics/${subtopicId}/content`, data);
  return response.data;
};

export const updateSubtopicContentApi = async (subtopicId, data) => {
  const response = await api.put(`/subtopics/${subtopicId}/content`, data);
  return response.data;
};

export const upsertSubtopicContentApi = async (subtopicId, data) => {
  const response = await api.put(`/subtopics/${subtopicId}/content`, data);
  return response.data;
};

export const publishSubtopicContentApi = async (subtopicId) => {
  const response = await api.patch(`/subtopics/${subtopicId}/content/publish`);
  return response.data;
};

export const unpublishSubtopicContentApi = async (subtopicId) => {
  const response = await api.patch(`/subtopics/${subtopicId}/content/unpublish`);
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

// Prerequisites
export const getTopicPrerequisitesApi = async (topicId) => {
  const response = await api.get(`/topics/${topicId}/prerequisites`);
  return response.data;
};

// Topic Video References
export const getTopicVideosApi = async (topicId) => {
  const response = await api.get(`/topics/${topicId}/videos`);
  return response.data;
};

export const addTopicVideoApi = async (topicId, data) => {
  const response = await api.post(`/topics/${topicId}/videos`, data);
  return response.data;
};

export const updateTopicVideoApi = async (topicId, videoId, data) => {
  const response = await api.put(`/topics/${topicId}/videos/${videoId}`, data);
  return response.data;
};

export const deleteTopicVideoApi = async (topicId, videoId) => {
  const response = await api.delete(`/topics/${topicId}/videos/${videoId}`);
  return response.data;
};

