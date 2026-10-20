// ──────────────────────────────────────────────
// User API (Admin & Approvals)
// ──────────────────────────────────────────────

import api from './axios';

export const getAllUsersApi = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getApprovalsApi = async (params = {}) => {
  const response = await api.get('/users/approvals', { params });
  return response.data;
};

export const approveUserApi = async (userId) => {
  const response = await api.patch(`/users/${userId}/approve`);
  return response.data;
};

export const rejectUserApi = async (userId, data = {}) => {
  const response = await api.patch(`/users/${userId}/reject`, data);
  return response.data;
};

export const getUserByIdApi = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserRoleApi = async (userId, data) => {
  const response = await api.patch(`/users/${userId}/role`, data);
  return response.data;
};
