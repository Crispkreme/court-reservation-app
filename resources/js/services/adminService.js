import api from "./api";

export const getAdminDashboard = (params = {}) => api.get('/admin-dashboard', { params });
export const getAdminDashboardSettings = () => api.get('/admin-dashboard/settings');
export const updateAdminDashboardSettings = (data) => api.post('/admin-dashboard/settings', data);