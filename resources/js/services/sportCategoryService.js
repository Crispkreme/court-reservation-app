import api from "./api";

const ENDPOINT = "/sport-categories";

export const getSportCategories = async (params = {}) => {
    const response = await api.get(ENDPOINT, { params });
    return response.data;
};

export const getSportCategory = async (id) => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
};

export const createSportCategory = async (data) => {
    const response = await api.post(ENDPOINT, data);
    return response.data;
};

export const updateSportCategory = async (id, data) => {
    const response = await api.patch(`${ENDPOINT}/${id}`, data);
    return response.data;
};

export const deleteSportCategory = async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
};
