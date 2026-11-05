import api from "./api";

// Player
export const getPlayers = (params = {}) =>api.get("/players", { params });
export const getPlayer = (id) =>api.get(`/players/${id}`);
export const createPlayer = (data) =>api.post("/players", data);
export const updatePlayer = (id, data) =>api.put(`/players/${id}`, data);
export const deletePlayer = (id) =>api.delete(`/players/${id}`);

// Booking Participant
export const getParticipants = (params = {}) =>api.get("/bookings/participants", { params });
export const createParticipant = (data) =>api.post("/players", data);
export const updateParticipant = (id, data) =>api.put(`/players/${id}`, data);
export const deleteParticipant = (id) =>api.delete(`/players/${id}`);