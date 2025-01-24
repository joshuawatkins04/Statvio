import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api, { loginUser, registerUser, refreshAccessToken } from "../hooks/user-management/userAuth";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const updateApiInfo = useCallback(async () => {
    try {
      console.log("Fetching API count...");
      const response = await api.get("/api-info");
      console.log("Fetched API info:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch API info:", error.message);
      throw error;
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      console.log("Fetching user data...");
      const response = await api.get("/user");
      console.log("Fetch user response:", response);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching user:", error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const verifyAuth = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.log("No access token found, user is not authenticated.");
      setIsAuthenticated(false);
      setUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(accessToken);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        console.log("Access token has expired, attempting to refresh...");
        const newToken = await refreshAuth();
        if (!newToken) {
          throw new Error("Failed to refresh token.");
        }
      }
      const response = await api.get("/verify");
      if (response.data.isValid) {
        setIsAuthenticated(true);
        await fetchUser();
      } else {
        console.log("Token verification failed on backend.");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication failed:", error.message);
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, [fetchUser]);

  const refreshAuth = useCallback(async () => {
    try {
      const data = await refreshAccessToken();
      if (data && data.token) {
        localStorage.setItem("access_token", data.token);
        return data.token;
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error.message);
      return null;
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      switch (event.key) {
        case "access_token":
          if (!event.newValue) {
            console.warn("[AuthContext] Token removed, logging out...");
            localStorage.removeItem("user_id");
            setIsAuthenticated(false);
            setUser(null);
            navigate("/login");
          } else {
            console.log("[AuthContext] Token changed, verifying...");
            verifyAuth();
          }
          break;
        case "user_id":
          if (!event.newValue) {
            console.warn("[AuthContext] UserId removed, logging out...");
            localStorage.removeItem("access_token");
            setIsAuthenticated(false);
            setUser(null);
            navigate("/login");
          } else {
            console.log("[AuthContext] UserId changed, verifying...");
            verifyAuth();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [verifyAuth, navigate]);

  const login = async (usernameOrEmail, password) => {
    try {
      console.log("Starting login process...");
      const data = await loginUser(usernameOrEmail, password);
      console.log("Login response data:", data);
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("user_id", data.userId);
      setIsAuthenticated(true);
      await fetchUser();
    } catch (error) {
      console.error("Login error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Starting logout process...");
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.warn("No user ID found in localStorage.");
        return;
      }
      await api.post("/logout", { userId });
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      setIsAuthenticated(false);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const register = async (username, email, password) => {
    try {
      await registerUser(username, email, password);
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("access_token");
      if (token) {
        const decoded = jwtDecode(token);
        const expiresAt = decoded.exp * 1000;
        const now = Date.now();
        const timeout = expiresAt - now - 60 * 1000;

        if (timeout > 0) {
          const timer = setTimeout(() => {
            refreshAuth();
          }, timeout);
          return () => clearTimeout(timer);
        } else {
          refreshAuth();
        }
      }
    }
  }, [isAuthenticated, refreshAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        login,
        logout,
        register,
        user,
        updateApiInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
