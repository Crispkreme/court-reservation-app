import api from "./api";

export const getMatchmakingRequests = () => api.get("/matchmaking");
export const getMatchmakingBookings = () => api.get("/bookings");
export const getSportCategories = () => api.get("/sport-categories");
export const createMatchmakingRequest = (data) => api.post("/matchmaking", data);
export const getCompatiblePlayers = (requestId) => api.get(`/matchmaking/${requestId}/compatible-players`);
export const sendMatchmakingInvitations = (requestId, data) => api.post(`/matchmaking/${requestId}/invite`, data);
export const closeMatchmakingRequest = (requestId) => api.post(`/matchmaking/${requestId}/close`)