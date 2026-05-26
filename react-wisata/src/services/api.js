import axios from "axios";
import { getAuth } from "../store/authStore";

// baseURL dibaca dari file .env (VITE_API_BASE_URL).
// Saat hosting, cukup ubah nilai itu di .env, jangan hardcode di sini.

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Important for CORS with credentials: true
});

api.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export default api;
