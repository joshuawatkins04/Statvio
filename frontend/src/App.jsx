import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/user/Login";
import SignupPage from "./pages/user/Signup";
import DashboardPage from "./pages/user/Dashboard";
import SettingsPage from "./pages/user/Settings";
import InsightsPage from "./pages/user/Insights";
import NotificationsPage from "./pages/user/Notifications";
import NotFoundPage from "./components/NotFound";
import Navbar from "./components/navbar/Navbar";

import MusicPage from "./pages/music/Music";
import SpotifyPage from "./pages/music/Spotify";
import SoundcloudPage from "./pages/music/Soundcloud";
import MoviesPage from "./pages/movies/Movies";
import GamingPage from "./pages/gaming/Gaming";

import SuccessPage from "./pages/paypal/SuccessPage";
import CancelPage from "./pages/paypal/CancelPage";

function app() {
  const { isAuthenticated, authLoading } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (authLoading) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/music"
          element={
            <ProtectedRoute>
              <MusicPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/music/spotify"
          element={
            <ProtectedRoute>
              <SpotifyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/music/soundcloud"
          element={
            <ProtectedRoute>
              <SoundcloudPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/movies"
          element={
            <ProtectedRoute>
              <MoviesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gaming"
          element={
            <ProtectedRoute>
              <GamingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <InsightsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complete-order"
          element={
            <ProtectedRoute>
              <SuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cancel-order"
          element={
            <ProtectedRoute>
              <CancelPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default app;
