import api from './api';

// Courts
export const getCourts = (params = {}) => api.get('/courts', { params });
export const getCourt = (id) => api.get(`/courts/${id}`);
export const createCourt = (data) => api.post('/courts', data);
export const updateCourt = (id, data) => api.put(`/courts/${id}`, data);
export const deleteCourt = (id) => api.delete(`/courts/${id}`);

// Sport Categories
export const getSportCategories = () => api.get('/sport-categories');
export const createSportCategory = (data) => api.post('/sport-categories', data);
export const updateSportCategory = (id, data) => api.put(`/sport-categories/${id}`, data);
export const deleteSportCategory = (id) => api.delete(`/sport-categories/${id}`);

// Court Pricing
export const getCourtPricing = (courtId) => api.get(`/courts/${courtId}/pricings`);
export const createCourtPricing = (courtId, data) => api.post(`/courts/${courtId}/pricings`, data);
export const updateCourtPricing = (id, data) => api.put(`/court-pricings/${id}`, data);
export const deleteCourtPricing = (id) => api.delete(`/court-pricings/${id}`);

// Court Maintenance
export const getCourtMaintenance = (courtId) => api.get(`/courts/${courtId}/maintenance`);
export const createCourtMaintenance = (courtId, data) => api.post(`/courts/${courtId}/maintenance`, data);
export const updateCourtMaintenance = (id, data) => api.put(`/maintenance-periods/${id}`, data);
export const deleteCourtMaintenance = (id) => api.delete(`/maintenance-periods/${id}`);

// Court Schedules
export const getCourtSchedules = (params = {}) => api.get('/court-schedules', { params });
export const createCourtSchedule = (data) => api.post('/court-schedules', data);
export const updateCourtSchedule = (id, data) => api.put(`/court-schedules/${id}`, data);
export const deleteCourtSchedule = (id) => api.delete(`/court-schedules/${id}`);

// Court Schedule Overrides
export const getCourtScheduleOverrides = (params = {}) => api.get("/court-schedule-overrides", { params });
export const createCourtScheduleOverride = (data) => api.post("/court-schedule-overrides", data);
export const updateCourtScheduleOverride = (id, data) => api.put(`/court-schedule-overrides/${id}`, data);
export const deleteCourtScheduleOverride = (id) => api.delete(`/court-schedule-overrides/${id}`);

export const getCourtNameById = (courts, courtId) => {
    const court = courts.find(
        (item) => Number(item.id) === Number(courtId)
    );

    return court?.name ?? `Court #${courtId}`;
};
