import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Vote APIs
export const voteAPI = {
  submitVote: (data) => api.post('/votes', data),
  getResults: () => api.get('/votes/results'),
  getMyVote: () => api.get('/votes/my-vote')
};

// Poll APIs
export const pollAPI = {
  getSettings: () => api.get('/poll/settings'),
  getStatus: () => api.get('/poll/status'),
  getStatistics: () => api.get('/poll/statistics')
};

// Admin APIs
export const adminAPI = {
  getAllVotes: (params) => api.get('/admin/votes', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  updatePollStatus: (data) => api.patch('/admin/poll-status', data),
  updatePollSettings: (data) => api.put('/admin/poll-settings', data),
  exportVotes: () => api.get('/admin/export/votes', { responseType: 'blob' }),
  getAllMembers: (params) => api.get('/admin/members', { params }),
  sendNotifications: (data) => api.post('/admin/notifications', data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  resetVotes: () => api.delete('/admin/votes/reset'),
  resetPassword: (data) => api.post('/admin/reset-password', data),
  generateTempPassword: (data) => api.post('/admin/generate-temp-password', data)
};

// Password Reset APIs
export const passwordResetAPI = {
  requestReset: (data) => api.post('/password-reset/request', data),
  resetPassword: (data) => api.post('/password-reset/reset', data)
};

export default api;
