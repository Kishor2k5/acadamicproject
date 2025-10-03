import axios from "axios";

const API_URL = "/api/orders";

// Admin: list orders with optional filters
export const adminListOrders = (params = {}, token) =>
  axios.get(`${API_URL}/admin`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

// Admin: update order status/tracking
export const adminUpdateOrderStatus = (orderId, body, token) =>
  axios.patch(`${API_URL}/${orderId}/status`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Admin: get label data (for printing + QR payload)
export const adminGetLabelData = (orderId, token) =>
  axios.get(`${API_URL}/${orderId}/label`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Admin: sales report aggregation
export const adminSalesReport = (params = {}, token) =>
  axios.get(`${API_URL}/admin/reports/sales`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

// Admin: analytics (timeseries + category breakdown)
export const adminAnalytics = (params = {}, token) =>
  axios.get(`${API_URL}/admin/analytics`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
