import api from "./api";

// Public Player Invitation
export const getPlayerInvitations = (token) => api.get(`/player-invitations/${token}`);
export const respondToPlayerInvitation = (token, status) => api.post(`/player-invitations/${token}/respond`, {status});