import axios from "axios";
import { getAuth } from "../store/authStore";

// =====================================================
// Base URL API
// =====================================================
// Nilai diambil dari .env (variable VITE_API_BASE_URL).
//
// Local development:
//   VITE_API_BASE_URL=http://localhost:5000/api/v1
//
// Production (saat hosting):
//   VITE_API_BASE_URL=https://wisatamagetan.xyz/api/v1
//
// Tinggal ubah nilainya di .env / .env.production lalu
// rebuild (`npm run build`). JANGAN hardcode di sini.
// =====================================================

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
