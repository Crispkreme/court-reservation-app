import api from "./api";

export const getBookings = async (params = {}) => {
    const response = await api.get("/bookings", { params });

    return response.data.data;
};