// ──────────────────────────────────────────────
// Progress & Analytics API Client
// ──────────────────────────────────────────────

import api from './axios';

// ── Student Progress APIs ─────────────────────
export const getMyOverallProgressApi = async () => {
  const response = await api.get('/progress/me');
  return response.data;
};

export const getMyTopicProgressApi = async (topicId) => {
  const response = await api.get(`/progress/me/topics/${topicId}`);
  return response.data;
};

export const getMyQuizHistoryApi = async () => {
  const response = await api.get('/progress/me/quizzes');
  return response.data;
};

export const trackSubtopicActivityApi = async (subtopicId, data) => {
  const response = await api.post(`/progress/track/${subtopicId}`, data);
  return response.data;
};

// ── Faculty Analytics & Progress APIs ──────────
export const getFacultyStudentsProgressApi = async (params) => {
  const response = await api.get('/faculty/students/progress', { params });
  return response.data;
};

export const getFacultyStudentDetailApi = async (studentId) => {
  const response = await api.get(`/faculty/students/${studentId}/progress`);
  return response.data;
};

export const getFacultyAnalyticsApi = async () => {
  const response = await api.get('/faculty/analytics');
  return response.data;
};

// ── Admin Analytics & Progress APIs ───────────
export const getAdminStudentsProgressApi = async (params) => {
  const response = await api.get('/admin/progress', { params });
  return response.data;
};

export const getAdminStudentDetailApi = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}/progress`);
  return response.data;
};

export const getAdminAnalyticsApi = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};
