
import api from "./api";

const ENDPOINT = "/bookings";
const COURT_ENDPOINT = "/courts";

const getBookingEndpoint = (id) => {
    if (
        id === null ||
        id === undefined ||
        String(id).trim() === ""
    ) {
        throw new Error("A valid booking ID is required.");
    }

    return `${ENDPOINT}/${encodeURIComponent(String(id))}`;
};

const getCourtEndpoint = (id) => {
    if (
        id === null ||
        id === undefined ||
        String(id).trim() === ""
    ) {
        throw new Error("A valid court ID is required.");
    }

    return `${COURT_ENDPOINT}/${encodeURIComponent(String(id))}`;
};

export const getBookings = async (params = {}) => {
    const response = await api.get(ENDPOINT, { params });

    return response.data;
};

export const getBooking = async (id) => {
    const response = await api.get(getBookingEndpoint(id));

    return response.data;
};

export const createBooking = async (data) => {
    const response = await api.post(ENDPOINT, data);

    return response.data;
};

export const updateBooking = async (id, data) => {
    const response = await api.put(
        getBookingEndpoint(id),
        data
    );

    return response.data;
};

export const updateBookingStatus = async (id, status) => {
    const response = await api.patch(
        `${getBookingEndpoint(id)}/status`,
        { status }
    );

    return response.data;
};

export const cancelBooking = async (id) => {
    const response = await api.patch(
        `${getBookingEndpoint(id)}/cancel`
    );

    return response.data;
};

export const deleteBooking = async (id) => {
    const response = await api.delete(
        getBookingEndpoint(id)
    );

    return response.data;
};

export const getCourtAvailability = async (
    courtId,
    params = {}
) => {
    const response = await api.get(
        `${getCourtEndpoint(courtId)}/availability`,
        { params }
    );

    return response.data;
};
