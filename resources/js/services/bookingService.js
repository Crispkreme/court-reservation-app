import api from "./api";

export const getBookings = async (params = {}) => {
    const response = await api.get("/bookings", { params });
    return response.data.data;
};
export const createBooking = async (payload) => {
    const response = await api.post("/bookings", payload);
    return response.data;
};
export const getBooking = (id) => api.get(/bookings/`${id}`);
export const getPlayers = (params = {}) => api.get("/players", { params });
export const addBookingPlayer = (bookingId, data) => api.post(/bookings/`${bookingId}`/players, data);
export const removeBookingPlayer = (bookingId, participantId) => api.delete(/bookings/`${bookingId}`/players/`${participantId}`);
export const createBookingPlayerInvitation = (bookingId, data) => api.post(/bookings/`${bookingId}`/player-invitations, data);