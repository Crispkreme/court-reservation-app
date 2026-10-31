import api from "./api";

// Get available statuses
export const getBookingStatuses = async () => {
    const response = await api.get("/booking-statuses");
    return response.data;
};

// Get bookings with optional filters
export const getBookingStatusBookings = async (params = {}) => {
    const response = await api.get("/booking-statuses/bookings", {
        params,
    });

    return response.data;
};

// Get booking lifecycle history
export const getBookingStatusHistory = async (bookingId) => {
    const response = await api.get(
        `/booking-statuses/bookings/${bookingId}/history`
    );

    return response.data;
};

// Update booking status
export const updateBookingStatus = async (bookingId, data) => {
    const response = await api.patch(
        `/booking-statuses/bookings/${bookingId}/status`,
        data
    );

    return response.data;
};