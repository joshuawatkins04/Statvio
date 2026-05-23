import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

// Redirects already-authenticated users away from public auth pages (login,
// signup) to the dashboard.
export function useAuthRedirect() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])
}

export default useAuthRedirect
