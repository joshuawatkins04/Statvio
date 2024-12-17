import React, { createContext, useState, useEffect, useCallback } from "react";
import api, {
  loginUser,
  registerUser,
  refreshAccessToken,
} from "../hooks/UserAuthentication/userAuth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const verifyAuth = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setIsAuthenticated(false);
      setAuthLoading(false);
      return;
    }
    try {
      const response = await api.get("/auth/dashboard");
      if (response.data) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Authentication failed:", error.message);
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem("access_token", data.token);
    await verifyAuth();
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
    }
  };

  const register = async (username, email, password) => {
    await registerUser(username, email, password);
  };

  const refreshAuth = async () => {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        setIsAuthenticated(true);
        await verifyAuth();
      }
    } catch (error) {
      console.error("Failed to refresh token:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        login,
        logout,
        register,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
