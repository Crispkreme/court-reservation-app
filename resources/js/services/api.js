import axios from 'axios';
let url;

if(import.meta.env.VITE_APP_ENV === 'local') {
    url = 'http://localhost:8000'
} else {
    url = 'https://court-reservation-app.vercel.app'
}

const API_URL = `${url}/api/v1`;
const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
