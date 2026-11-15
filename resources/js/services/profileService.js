import api from './api';

// Change the logged-in user's password
export const changePassword = async (data) => {
    const response = await api.patch('/profile/password', data);
    return response.data;
};