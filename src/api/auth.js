import axios from "axios";

const API_URL = "/api/auth";

export const login = (email, password) =>
  axios.post(`${API_URL}/login`, { email, password });

export const register = (username, email, password) =>
  axios.post(`${API_URL}/register`, { username, email, password });
