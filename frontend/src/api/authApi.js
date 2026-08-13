// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────

import api from './axios';

export const signupApi = async (data) => {
  const response = await api.post('/auth/signup', data);
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
