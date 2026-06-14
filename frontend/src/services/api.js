import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const getUserById = (id) => API.get(`/auth/user/${id}`);

// Projects
export const getProjects = (params) => API.get('/projects', { params });
export const getMyProjects = () => API.get('/projects/my');
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Bids
export const placeBid = (data) => API.post('/bids', data);
export const getProjectBids = (projectId) => API.get(`/bids/project/${projectId}`);
export const getMyBids = () => API.get('/bids/my');
export const acceptBid = (bidId) => API.put(`/bids/${bidId}/accept`);

// Milestones
export const createMilestone = (data) => API.post('/milestones', data);
export const getProjectMilestones = (projectId) => API.get(`/milestones/project/${projectId}`);
export const completeMilestone = (id) => API.put(`/milestones/${id}/complete`);
export const uploadPaymentScanner = (id, data) => API.put(`/milestones/${id}/upload-scanner`, data);
export const approveMilestone = (id) => API.put(`/milestones/${id}/approve`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllRead = () => API.put('/notifications/read-all');

// Messages (project chat)
export const getProjectMessages = (projectId) => API.get(`/messages/project/${projectId}`);
export const sendMessage = (data) => API.post('/messages', data);
