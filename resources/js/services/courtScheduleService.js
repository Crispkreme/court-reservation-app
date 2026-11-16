import api from "./api";

const ENDPOINT = "/court-schedules";

export const getCourtSchedules = async (params = {}) => {
    const response = await api.get(ENDPOINT, { params });
    return response.data;
};
