import api from './api';

export const getTransactions = (params = {}) => api.get('/transactions', { params });