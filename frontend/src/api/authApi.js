// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────

import api from './axios';

export const signupApi = async (data) => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const signupStudentApi = async (data) => {
  const response = await api.post('/auth/signup/student', data);
  return response.data;
};

export const signupFacultyApi = async (data) => {
  const response = await api.post('/auth/signup/faculty', data);
  return response.data;
};

export const loginApi = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const forgotPasswordApi = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

export const verifyResetTokenApi = async (data) => {
  const response = await api.post('/auth/verify-reset-token', data);
  return response.data;
};

export const resetPasswordApi = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};
