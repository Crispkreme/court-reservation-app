
import api from "./api";

export const getBookingHolds = async (params = {}) => {
    const response = await api.get("/booking-holds", {
        params,
    });

    return response.data;
};
