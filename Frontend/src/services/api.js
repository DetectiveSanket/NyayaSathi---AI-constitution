// src/services/api.js
import axios from "axios";

/**
 * Base API URL — resolved in priority order:
 *  1. VITE_API_BASE_URL (set in .env for both dev and prod)
 *  2. localhost fallback for local development
 *
 * For Render/Netlify/Vercel: set VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1/
 */
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api/v1/"
    : "/api/v1/"); // Relative fallback (same-origin proxy)

// ✅ Create reusable axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Needed for cookies (refresh token HttpOnly cookie)
  timeout: 30000, // 30 second timeout for large LLM responses
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
