import axios from "axios";

const api = axios.create({
  baseURL: "https://geosetu-api.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ---- Typed helper calls ----------------------------------------------

export const getDashboardStats = (waterLevelM) =>
  api.get("/dashboard/stats", { params: { waterLevel: waterLevelM } }).then((r) => r.data);

export const getVillages = (waterLevelM) =>
  api.get("/villages", { params: { waterLevel: waterLevelM } }).then((r) => r.data);

export const getVillage = (id, waterLevelM) =>
  api.get(`/villages/${id}`, { params: { waterLevel: waterLevelM } }).then((r) => r.data);

export const searchVillages = (q) =>
  api.get("/villages/search", { params: { q } }).then((r) => r.data);

export const getVillageRelocationOptions = (id, waterLevelM) =>
  api.get(`/villages/${id}/relocation`, { params: { waterLevel: waterLevelM } }).then((r) => r.data);

export const getVillageComparison = (id, siteId, waterLevelM) =>
  api
    .get(`/villages/${id}/comparison`, { params: { siteId, waterLevel: waterLevelM } })
    .then((r) => r.data);

export const getSites = () => api.get("/sites").then((r) => r.data);
export const getSite = (id) => api.get(`/sites/${id}`).then((r) => r.data);

export const getDistricts = () => api.get("/districts").then((r) => r.data);
export const getRiver = () => api.get("/river").then((r) => r.data);
export const getFloodZones = (waterLevelM) =>
  api.get("/floodzones", { params: { waterLevel: waterLevelM } }).then((r) => r.data);

export const getServices = (type) => api.get("/services", { params: { type } }).then((r) => r.data);
export const getHistoricalDisasters = () => api.get("/historical-disasters").then((r) => r.data);

export const askCopilot = (payload) => api.post("/copilot/ask", payload).then((r) => r.data);

export const login = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data);
