import api from './api';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);

    if (response.data.token) {
        localStorage.setItem(
            'auth_token',
            response.data.token
        );

        localStorage.setItem(
            'auth_user',
            JSON.stringify(response.data.user)
        );
    }

    return response.data.user;
};

export const register = async (data) => {
    const response = await api.post('/auth/register', data);

    if (response.data.token) {
        localStorage.setItem(
            'auth_token',
            response.data.token
        );

        localStorage.setItem(
            'auth_user',
            JSON.stringify(response.data.user)
        );
    }

    return response.data.user;
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/user');

    if (response.data.user) {
        localStorage.setItem(
            'auth_user',
            JSON.stringify(response.data.user)
        );
    }

    return response.data.user;
};

export const getStoredUser = () => {
    const user = localStorage.getItem('auth_user');

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error('Unable to parse stored user:', error);
        localStorage.removeItem('auth_user');
        return null;
    }
};

export const getUserRole = () => {
    const user = getStoredUser();

    return user?.role || null;
};

export const isAdmin = () => {
    return getUserRole() === 'admin';
};

export const isMember = () => {
    return getUserRole() === 'member';
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('auth_token');
};