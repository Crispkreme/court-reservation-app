
import api from "./api";

export const getPayments = (params = {}) => api.get("/payments", { params });
export const createPayment = (bookingId, paymentMethod) => api.post("/payments", {booking_id: bookingId,payment_method: paymentMethod});
export const createPaypalOrder = (paymentId) => api.post("/payments/paypal/create-order", {payment_id: paymentId});
export const capturePaypalOrder = (paymentId, orderId) => api.post("/payments/paypal/capture-order", {payment_id: paymentId,order_id: orderId});
export const confirmManualPayment = (paymentId, notes) => api.post(`/payments/${paymentId}/manual-confirm`, {notes});
export const refundPayment = (paymentId, amount, reason) => api.post(`/payments/${paymentId}/refund`, {amount,reason});
export const reconcilePayment = (paymentId) => api.post("/payments/reconcile", {payment_id: paymentId});
