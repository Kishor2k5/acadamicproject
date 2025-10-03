import axios from "axios";

const API_URL = "/api/products";

export const adminCreateProduct = (formData, token) =>
  axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const adminUpdateProduct = (id, formData, token) =>
  axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const adminDeleteProduct = (id, token) =>
  axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
