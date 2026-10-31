
import api from "./api";

// GET: /booking-rules
export const getBookingRules = async () => {
    const response = await api.get("/booking-rules");
    return response.data;
};

// GET: /membership-tiers
export const getMembershipTiers = async () => {
    const response = await api.get("/membership-tiers");
    return response.data;
};

// GET: /sport-categories
export const getSportCategories = async () => {
    const response = await api.get("/sport-categories");
    return response.data;
};

// GET: /courts
export const getCourts = async () => {
    const response = await api.get("/courts");
    return response.data;
};

// POST: /booking-rules
export const createBookingRule = async (data) => {
    const response = await api.post("/booking-rules", data);
    return response.data;
};

// PUT: /booking-rules/{id}
export const updateBookingRule = async (id, data) => {
    const response = await api.put(`/booking-rules/${id}`, data);
    return response.data;
};

// DELETE: /booking-rules/{id}
export const deleteBookingRule = async (id) => {
    const response = await api.delete(`/booking-rules/${id}`);
    return response.data;
};
