
import api from "./api";

// Load cancellation policies
export const getCancellationPolicies = async () => {
    const response = await api.get("/cancellation-policies");
    return response.data;
};

// Create cancellation policy
export const createCancellationPolicy = async (data) => {
    const response = await api.post("/cancellation-policies", data);
    return response.data;
};

// Update cancellation policy
export const updateCancellationPolicy = async (id, data) => {
    const response = await api.put(`/cancellation-policies/${id}`, data);
    return response.data;
};

// Delete cancellation policy
export const deleteCancellationPolicy = async (id) => {
    const response = await api.delete(`/cancellation-policies/${id}`);
    return response.data;
};
