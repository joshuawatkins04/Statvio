import { Route, Routes } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { NotFound } from "@/components/NotFound"
import { LandingPage } from "@/pages/LandingPage"
import { Login } from "@/pages/auth/Login"
import { Signup } from "@/pages/auth/Signup"

export function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
