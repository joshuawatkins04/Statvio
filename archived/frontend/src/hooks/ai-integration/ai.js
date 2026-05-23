import axios from "axios";

const aiApi = axios.create({
  baseURL: __AI_BASE_URL__,
  withCredentials: true,
});

aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[aiApi] No token found in localStorage.");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("AI API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
