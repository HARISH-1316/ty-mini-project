// ──────────────────────────────────────────────
// Quiz API Client — Student & Faculty Endpoints
// ──────────────────────────────────────────────

import api from './axios';

// =========================================================
// 1. STUDENT QUIZ APIS
// =========================================================

// Prerequisite Quiz
export const getPrerequisiteQuizApi = async (topicId) => {
  const response = await api.get(`/quizzes/prerequisite/${topicId}`);
  return response.data;
};

export const startPrerequisiteAttemptApi = async (topicId) => {
  const response = await api.post(`/quizzes/prerequisite/${topicId}/attempt`);
  return response.data;
};

// Subtopic Quiz
export const getSubtopicQuizApi = async (subtopicId) => {
  const response = await api.get(`/quizzes/subtopic/${subtopicId}`);
  return response.data;
};

export const startSubtopicAttemptApi = async (subtopicId) => {
  const response = await api.post(`/quizzes/subtopic/${subtopicId}/attempt`);
  return response.data;
};

// Final / Topic Quiz
export const getFinalQuizApi = async (topicId) => {
  const response = await api.get(`/quizzes/final/${topicId}`);
  return response.data;
};

export const startFinalAttemptApi = async (topicId) => {
  const response = await api.post(`/quizzes/final/${topicId}/attempt`);
  return response.data;
};

// Submit Quiz Attempt (All Types)
export const submitQuizAttemptApi = async (attemptId, answers) => {
  const response = await api.post(`/quizzes/attempts/${attemptId}/submit`, { answers });
  return response.data;
};

// Student Quiz History
export const getMyQuizAttemptsApi = async () => {
  const response = await api.get('/quizzes/my-attempts');
  return response.data;
};

// =========================================================
// 2. FACULTY & ADMIN MANAGEMENT APIS
// =========================================================

// ── Prerequisite Quiz Management ─────────────────
export const getPrerequisiteQuizManageApi = async (topicId) => {
  const response = await api.get(`/quizzes/prerequisite/${topicId}/manage`);
  return response.data;
};

export const addPrereqQuestionApi = async (prereqQuizId, data) => {
  const response = await api.post(`/quizzes/prerequisite/${prereqQuizId}/questions`, data);
  return response.data;
};

export const updatePrereqQuestionApi = async (questionId, data) => {
  const response = await api.put(`/quizzes/questions/prerequisite/${questionId}`, data);
  return response.data;
};

export const deletePrereqQuestionApi = async (questionId) => {
  const response = await api.delete(`/quizzes/questions/prerequisite/${questionId}`);
  return response.data;
};

export const updatePrereqQuizConfigApi = async (prereqQuizId, data) => {
  const response = await api.put(`/quizzes/prerequisite/${prereqQuizId}/config`, data);
  return response.data;
};

// ── Subtopic Quiz Management ─────────────────────
export const getSubtopicQuizManageApi = async (subtopicId) => {
  const response = await api.get(`/quizzes/subtopic/${subtopicId}/manage`);
  return response.data;
};

export const addSubtopicQuestionApi = async (contentId, data) => {
  const response = await api.post(`/quizzes/subtopic/${contentId}/questions`, data);
  return response.data;
};

export const updateSubtopicQuestionApi = async (questionId, data) => {
  const response = await api.put(`/quizzes/questions/subtopic/${questionId}`, data);
  return response.data;
};

export const deleteSubtopicQuestionApi = async (questionId) => {
  const response = await api.delete(`/quizzes/questions/subtopic/${questionId}`);
  return response.data;
};

// ── Final Quiz Management ────────────────────────
export const getFinalQuizManageApi = async (topicId) => {
  const response = await api.get(`/quizzes/final/${topicId}/manage`);
  return response.data;
};

export const addFinalQuestionApi = async (finalQuizId, data) => {
  const response = await api.post(`/quizzes/final/${finalQuizId}/questions`, data);
  return response.data;
};

export const updateFinalQuestionApi = async (questionId, data) => {
  const response = await api.put(`/quizzes/questions/final/${questionId}`, data);
  return response.data;
};

export const deleteFinalQuestionApi = async (questionId) => {
  const response = await api.delete(`/quizzes/questions/final/${questionId}`);
  return response.data;
};

export const updateFinalQuizConfigApi = async (finalQuizId, data) => {
  const response = await api.put(`/quizzes/final/${finalQuizId}/config`, data);
  return response.data;
};
