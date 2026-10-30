
import api from "./api";

export const getSportCategories = async (params = {}) => {
    const response = await api.get("/sport-categories", { params });
    return response.data.data;
};

export const createSportCategory = async (data) => {
    const response = await api.post("/sport-categories", data);
    return response.data;
};

export const updateSportCategory = async (id, data) => {
    const response = await api.put(`/sport-categories/${id}`, data);
    return response.data;
};

export const deleteSportCategory = async (id) => {
    const response = await api.delete(`/sport-categories/${id}`);
    return response.data;
};
