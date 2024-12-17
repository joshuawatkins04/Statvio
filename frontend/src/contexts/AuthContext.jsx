import React, { createContext, useState, useEffect, useCallback } from "react";

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
      const response = await AuthProvider.get("/auth/dashboard");
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

  // Need login, logout, register,

  return (
    <AuthContext.Provider value={{ isAuthenticated, authLoading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
