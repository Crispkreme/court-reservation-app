import api from "./api";

const ENDPOINT = "/court-schedule-overrides";

export const getScheduleOverrides = async (params = {}) => {
    const response = await api.get(ENDPOINT, { params });
    return response.data;
};

export const getScheduleOverride = async (id) => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
};

export const createScheduleOverride = async (data) => {
    const response = await api.post(ENDPOINT, data);
    return response.data;
};

export const updateScheduleOverride = async (id, data) => {
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    return response.data;
};

export const deleteScheduleOverride = async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
};
