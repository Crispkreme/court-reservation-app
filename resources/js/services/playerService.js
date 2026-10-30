import api from "./api";

export const createParticipant = async (payload) => {
    const response = await api.post("/players", payload);
    return response.data;
};

export const updateParticipant = async (id, payload) => {
    const response = await api.put(`/players/${id}`, payload);
    return response.data;
};

export const getParticipants = async (params = {}) => {
    const response = await api.get("/bookings/participants", { params });
    return response.data;
};

export const deleteParticipant = async (id) => {
    const response = await api.delete(`/players/${id}`);
    return response.data;
};