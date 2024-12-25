import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ProfilePage from "./pages/Profile";
import DashboardPage from "./pages/Dashboard";
import InsightsPage from "./pages/Insights";
import NotificationsPage from "./pages/Notifications";
import NotFoundPage from "./pages/NotFound";

import SpotifyPage from "./pages/Spotify";
import MoviesPage from "./pages/Movies";
import GamingPage from "./pages/Gaming";

import SuccessPage from "./pages/SuccessPage";

function App() {
  const { isAuthenticated, authLoading } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (authLoading) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/spotify"
          element={
            <ProtectedRoute>
              <SpotifyPage />
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
