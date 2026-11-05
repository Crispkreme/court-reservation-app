import api from "./api";

export const getReservationNotifications = (params = {}) => api.get("/reservation-notifications", { params });
export const getReservationNotificationSummary = () => api.get("/reservation-notifications/summary");
export const markNotificationAsRead = (id) => api.post(`/reservation-notifications/${id}/read`);
export const markNotificationAsUnread = (id) => api.post(`/reservation-notifications/${id}/unread`);
export const markAllNotificationsAsRead = () => api.post("/reservation-notifications/mark-all-read");
export const deleteReservationNotification = (id) => api.delete(`/reservation-notifications/${id}`);
export const createReservationNotification = (data) => api.post("/reservation-notifications", data);