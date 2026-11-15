import api from "./api";

const endpoint = "/court-utilization";

export const getCourtUtilization = async (params = {}) => {
    const response = await api.get(endpoint, { params });
    return response.data;
};
