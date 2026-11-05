
import api from './api';

export const getMemberships = (params = {}) => api.get('/memberships', { params });
export const getMembership = (id) => api.get(`/memberships/${id}`);
export const createMembership = (data) => api.post('/memberships', data);
export const updateMembership = (id, data) => api.put(`/memberships/${id}`, data);
export const deleteMembership = (id) => api.delete(`/memberships/${id}`);

export const getMembershipStatistics = () => api.get('/memberships/statistics');
export const getMembershipTypes = () => api.get('/membership-types');

export const renewMembership = (id, data = {}) => api.post(`/memberships/${id}/renew`, data);
export const suspendMembership = (id) => api.post(`/memberships/${id}/suspend`);
export const cancelMembership = (id) => api.post(`/memberships/${id}/cancel`);
export const changeMembershipStatus = (id, action) => api.post(`/memberships/${id}/${action}`);
export const createMembershipType = (data) => api.post("/membership-types", data);
export const updateMembershipType = (id, data) => api.put(`/membership-types/${id}`, data);
export const deleteMembershipType = (id) => api.delete(`/membership-types/${id}`);