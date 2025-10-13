// src/services/api.js
import axios from "axios";

// ✅ Define dev & prod URLs (auto-switch)
const DEV_API_URL = "http://localhost:5000/api/v1/";
const PROD_API_URL = "https://your-production-domain.com/api/v1/";

// Choose correct base URL
const BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? DEV_API_URL : PROD_API_URL);

// ✅ Create reusable axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // needed if you use cookies for refresh tokens
});

// ✅ Dynamically attach/remove Authorization header
export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
