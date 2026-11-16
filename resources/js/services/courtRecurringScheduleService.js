import api from "./api";

const ENDPOINT = "/court-recurring-schedules";

export const getRecurringSchedules = async (params = {}) => {
    const response = await api.get(ENDPOINT, { params });
    return response.data;
};

export const getRecurringSchedule = async (id) => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
};

export const createRecurringSchedule = async (data) => {
    const response = await api.post(ENDPOINT, data);
    return response.data;
};

export const updateRecurringSchedule = async (id, data) => {
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    return response.data;
};

export const deleteRecurringSchedule = async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
};
