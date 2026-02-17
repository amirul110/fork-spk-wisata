import axios from "axios";
import api from "./api";

// Separate API instance for public endpoints (no auth token required)
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Important for CORS with credentials: true
});

export async function loginRequest(email, password) {
  const res = await publicApi.post("/auth/login", {
    email,
    password,
  });
  return res.data;
}

export async function updateProfile(username, email, password) {
  const data = {};
  if (username) data.username = username;
  if (email) data.email = email;
  if (password) data.password = password;
  
  const res = await api.put("/auth/profile", data);
  return res.data;
}
