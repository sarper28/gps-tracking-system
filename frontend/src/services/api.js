import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== AUTH ENDPOINTS ====================
export const registerUser = (data) => apiClient.post("/auth/register", data);
export const loginUser = (data) => apiClient.post("/auth/login", data);
export const getProfile = () => apiClient.get("/auth/profile");
export const updateNotificationConfig = (config) => apiClient.put("/auth/profile", { notifConfig: config });

// ==================== VEHICLE ENDPOINTS ====================
export const getVehicles = () => apiClient.get("/vehicles");
export const getVehicle = (id) => apiClient.get(`/vehicles/${id}`);
export const createVehicle = (data) => apiClient.post("/vehicles", data);
export const updateVehicle = (id, data) => apiClient.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => apiClient.delete(`/vehicles/${id}`);

// ==================== GEOFENCE ENDPOINTS ====================
export const getGeofences = () => apiClient.get("/geofences");
export const getGeofence = (id) => apiClient.get(`/geofences/${id}`);
export const createGeofence = (data) => apiClient.post("/geofences", data);
export const updateGeofence = (id, data) => apiClient.put(`/geofences/${id}`, data);
export const deleteGeofence = (id) => apiClient.delete(`/geofences/${id}`);
export const getProvinces = () => apiClient.get("/geofences/provinces");
export const getVehicleComplianceStatus = (vehicleId) => apiClient.get(`/location/vehicles/${vehicleId}/compliance-status`);

// ==================== LOCATION ENDPOINTS ====================
export const submitLocation = (data) => apiClient.post("/location", data);
export const getLocationHistory = (vehicleId, page = 1, limit = 20) => apiClient.get(`/history/${vehicleId}`, { params: { page, limit } });
export const getViolationHistory = (vehicleId, page = 1, limit = 20) => apiClient.get(`/history/${vehicleId}/violations`, { params: { page, limit } });
export const getViolationStats = (vehicleId) => apiClient.get(`/history/${vehicleId}/stats`);
export const getDashboardStats = () => apiClient.get("/location/stats/dashboard");

// ==================== NOTIFICATION ENDPOINTS ====================
export const getNotificationConfig = () => apiClient.get("/auth/profile");
export const testNotification = (channel) => apiClient.post("/auth/test-notification", { channel });

// ==================== HELPER METHODS ====================
const apiService = {
  // Generic HTTP methods
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),

  // Auth
  registerUser,
  loginUser,
  getProfile,
  updateNotificationConfig,

  // Vehicles
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,

  // Geofences
  getGeofences,
  getGeofence,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  getProvinces,
  getVehicleComplianceStatus,

  // Location & History
  submitLocation,
  getLocationHistory,
  getViolationHistory,
  getViolationStats,
  getDashboardStats,

  // Notifications
  getNotificationConfig,
  testNotification,
};

export default apiService;
