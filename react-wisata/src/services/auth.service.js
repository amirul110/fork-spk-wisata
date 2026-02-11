import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export async function loginRequest(email, password) {
  const res = await api.post("/auth/login", {
    email,
    password,
  });
  return res.data;
}
