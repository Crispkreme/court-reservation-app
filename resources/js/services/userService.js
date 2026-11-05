import api from './api';

export const getUsers = (params = {}) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const getCurrentUser = () => api.get('/user');
export const getMemberUsers = () => api.get('/users/members');
export const getMemberDashboard = () => api.get('/member-dashboard');