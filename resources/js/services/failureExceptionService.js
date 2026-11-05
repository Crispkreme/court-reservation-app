import api from "./api";

// Failure Exceptions
export const getFailureExceptions = (params = {}) => api.get("/failure-exceptions", { params });
export const getFailureExceptionSummary = (params = {}) => api.get("/failure-exceptions/summary", { params });
export const getFailureException = (id) => api.get(`/failure-exceptions/${id}`);

// Failure Exception Actions
export const retryFailureException = (id) => api.post(`/failure-exceptions/${id}/retry`);
export const resolveFailureException = (id, data) => api.post(`/failure-exceptions/${id}/resolve`, data);
export const ignoreFailureException = (id, data) => api.post(`/failure-exceptions/${id}/ignore`, data);
export const reopenFailureException = (id) => api.post(`/failure-exceptions/${id}/reopen`);