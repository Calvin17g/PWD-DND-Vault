import axios from "axios";

// Base API instance — all requests go to the Express backend
const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Attach JWT token to every request if one exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

// Character endpoints
export const charactersAPI = {
  getAll: () => api.get("/characters"),
  getOne: (id) => api.get(`/characters/${id}`),
  create: (data) => api.post("/characters", data),
  update: (id, data) => api.put(`/characters/${id}`, data),
  updateStats: (id, data) => api.patch(`/characters/${id}/stats`, data), // advanced feature
  delete: (id) => api.delete(`/characters/${id}`),
};

export default api;
