import api from "./api";

export const getBookings = async (params = {}) => {
    const response = await api.get("/bookings", { params });

    return response.data.data;
};

export const createBooking = async (payload) => {
    const response = await api.post("/bookings", payload);

    return response.data;
};