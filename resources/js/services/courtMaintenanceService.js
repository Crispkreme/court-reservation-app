import api from "./api";

const ENDPOINT = "/court-maintenance-periods";

export const getMaintenancePeriods = async (params = {}) => {
    const response = await api.get(ENDPOINT, { params });
    return response.data;
};

export const getMaintenancePeriod = async (id) => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
};

export const createMaintenancePeriod = async (data) => {
    const response = await api.post(ENDPOINT, data);
    return response.data;
};

export const updateMaintenancePeriod = async (id, data) => {
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    return response.data;
};

export const deleteMaintenancePeriod = async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
};

export const getCourtMaintenancePeriods = async (courtId) => {
    const response = await api.get(`/courts/${courtId}/maintenance-periods`);
    return response.data;
};
