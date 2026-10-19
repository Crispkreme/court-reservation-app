import api from './api';

// Users
export const getUsers = (params = {}) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);

// Member Users
export const getMemberUsers = () => api.get('/users/members');
