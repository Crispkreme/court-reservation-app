import api from "./api";

export const getCustomerDashboard = (params = {}) => api.get("/customer-dashboard", { params });