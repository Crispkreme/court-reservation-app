
import api from "./api";

export const getAuditLogs = (params = {}) => api.get("/audit-logs", { params });
export const getAuditLogSummary = (params = {}) => api.get("/audit-logs/summary", { params });