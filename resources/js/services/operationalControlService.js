import api from "./api";

export const getOperationalControls = (params = {}) => api.get("/operational-controls", { params });
export const getOperationalControlSummary = () => api.get("/operational-controls/summary");
export const createOperationalControl = (data) => api.post("/operational-controls", data);
export const cancelOperationalControl = (id) => api.delete(`/operational-controls/${id}`);