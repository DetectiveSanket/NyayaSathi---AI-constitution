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

/**
 * Get RAG public session token from localStorage
 */
export function getRagToken() {
  return localStorage.getItem("rag_public_session_token");
}

/**
 * Set RAG public session token
 */
export function setRagToken(token) {
  if (token) {
    localStorage.setItem("rag_public_session_token", token);
  } else {
    localStorage.removeItem("rag_public_session_token");
  }
}

/**
 * Create a RAG API request with automatic token handling
 * Uses RAG token if available, otherwise falls back to regular auth token
 */
export function createRagRequest(config) {
  const ragToken = getRagToken();
  const authToken = api.defaults.headers.common["Authorization"]?.replace("Bearer ", "");

  // Use RAG token if available, otherwise use regular auth token
  const token = ragToken || authToken;

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  };
}

export default api;
