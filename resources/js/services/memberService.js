import api from "./api";

export const getMembers = (params = {}) => api.get("/users", { params });