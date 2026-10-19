
import api from './api';

// Memberships
export const getMemberships = (params = {}) => api.get('/memberships', { params });
export const getMembership = (id) => api.get(`/memberships/${id}`);
export const createMembership = (data) => api.post('/memberships', data);
export const updateMembership = (id, data) => api.put(`/memberships/${id}`, data);
export const deleteMembership = (id) => api.delete(`/memberships/${id}`);

// Membership Statistics
export const getMembershipStatistics = () => api.get('/memberships/statistics');

// Membership Types
export const getMembershipTypes = () => api.get('/membership-types');

// Membership Actions
export const renewMembership = (id, data = {}) => api.post(`/memberships/${id}/renew`, data);
export const suspendMembership = (id) => api.post(`/memberships/${id}/suspend`);
export const cancelMembership = (id) => api.post(`/memberships/${id}/cancel`);