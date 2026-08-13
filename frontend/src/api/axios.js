// ──────────────────────────────────────────────
// Centralized Axios Client
// ──────────────────────────────────────────────

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send session cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
