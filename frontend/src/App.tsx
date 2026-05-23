import { Route, Routes } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import NotFound from "@/components/NotFound"

import LandingPage from "@/pages/LandingPage"
import Login from "@/pages/auth/Login"
import Signup from "@/pages/auth/Signup"
import Privacy from "@/pages/user/Privacy"
import Contact from "@/pages/user/Contact"
import TOU from "@/pages/TOU"

import Dashboard from "@/pages/user/Dashboard"
import Settings from "@/pages/user/Settings"
import Insights from "@/pages/user/Insights"
import Notifications from "@/pages/user/Notifications"
import Subscribe from "@/pages/user/Subscribe"

import Music from "@/pages/music/Music"
import Spotify from "@/pages/music/Spotify"
import Soundcloud from "@/pages/music/Soundcloud"
import Movies from "@/pages/movies/Movies"
import Gaming from "@/pages/gaming/Gaming"

import SuccessPage from "@/pages/stripe/SuccessPage"
import CancelPage from "@/pages/stripe/CancelPage"

// protect wraps an element in the auth gate, keeping the route table readable.
const protect = (element: React.ReactNode) => (
  <ProtectedRoute>{element}</ProtectedRoute>
)

export function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<TOU />} />

        {/* Authenticated */}
        <Route path="/dashboard" element={protect(<Dashboard />)} />
        <Route path="/settings" element={protect(<Settings />)} />
        <Route path="/dashboard/music" element={protect(<Music />)} />
        <Route path="/dashboard/music/spotify" element={protect(<Spotify />)} />
        <Route
          path="/dashboard/music/soundcloud"
          element={protect(<Soundcloud />)}
        />
        <Route path="/dashboard/movies" element={protect(<Movies />)} />
        <Route path="/dashboard/gaming" element={protect(<Gaming />)} />
        <Route path="/insights" element={protect(<Insights />)} />
        <Route path="/notifications" element={protect(<Notifications />)} />
        <Route path="/subscribe" element={protect(<Subscribe />)} />
        <Route path="/subscribe/success" element={protect(<SuccessPage />)} />
        <Route path="/subscribe/cancel" element={protect(<CancelPage />)} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
