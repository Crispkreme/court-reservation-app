
import api from "./api";

export const getReport = (params = {}) => api.get("/reports", { params });
export const getReportExportUrl = (type, params = {}) => {
    const query = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return `/api/v1/reports/${type}${query ? `?${query}` : ""}`;
};
