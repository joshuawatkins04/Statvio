import axios from "axios";

const api = axios.create({
  baseURL: __AUTH_URL__,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async (usernameOrEmail, password) => {
  try {
    const response = await api.post("/login", { usernameOrEmail, password });
    return response.data;
  } catch (error) {
    handleApiError(error, "Login failed.");
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post("/signup", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Login failed.");
  }
};

export async function refreshAccessToken() {
  try {
    const response = await api.post("/refresh-token");
    localStorage.setItem("access_token", response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    throw new Error("Failed to refresh access token.");
  }
}

function handleApiError(error, defaultMessage) {
  if (error.response && error.response.data) {
    throw new Error(error.response.data.message || defaultMessage);
  } else {
    throw new Error("Network error or server is unreachable");
  }
}

export default api;
