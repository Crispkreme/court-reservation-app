
import api from "./api";

export const getBookingHolds = async (params = {}) => {
    const response = await api.get("/booking-holds", {
        params,
    });

    return response.data;
};

export const createBookingHold = async (data) => {
    const response = await api.post("/booking-holds", {
        ...data,
        sport_category_id: Number(data.sport_category_id),
        court_id: Number(data.court_id),
        duration_minutes: Number(data.duration_minutes),
        players_count: Number(data.players_count),
        hold_duration_minutes: Number(data.hold_duration_minutes),
    });

    return response.data;
};

export const convertBookingHold = async (id, paymentReference) => {
    const response = await api.post(
        `/booking-holds/${id}/convert`,
        {
            payment_reference: paymentReference,
        }
    );

    return response.data;
};

export const failBookingHold = async (
    id,
    failureReason,
    paymentReference
) => {
    const response = await api.post(
        `/booking-holds/${id}/fail`,
        {
            failure_reason: failureReason,
            payment_reference: paymentReference,
        }
    );

    return response.data;
};

export const releaseExpiredBookingHolds = async () => {
    const response = await api.post(
        "/booking-holds/release-expired"
    );

    return response.data;
};