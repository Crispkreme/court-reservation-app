
import api from "./api";

const ENDPOINT = "/courts";

const getCourtEndpoint = (id) => {
    if (
        id === null ||
        id === undefined ||
        String(id).trim() === ""
    ) {
        throw new Error("A valid court ID is required.");
    }

    return `${ENDPOINT}/${encodeURIComponent(String(id))}`;
};

export const getCourts = async () => {
    const response = await api.get(ENDPOINT);

    return response.data;
};

export const getCourt = async (id) => {
    const response = await api.get(getCourtEndpoint(id));

    return response.data;
};

export const createCourt = async (data) => {
    const response = await api.post(ENDPOINT, data);

    return response.data;
};

export const updateCourt = async (id, data) => {
    const response = await api.put(
        getCourtEndpoint(id),
        data
    );

    return response.data;
};

export const deleteCourt = async (id) => {
    const response = await api.delete(
        getCourtEndpoint(id)
    );

    return response.data;
};
