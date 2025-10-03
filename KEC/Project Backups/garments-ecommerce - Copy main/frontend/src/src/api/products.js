import axios from "axios";

const API_URL = "/api/products";

export const getProducts = () => axios.get(API_URL);

// Add more functions for admin CRUD as needed
