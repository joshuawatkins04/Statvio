import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Spinner } from "@/components/Spinner"

// ProtectedRoute gates authenticated-only pages. While the session is being
// verified it shows a spinner; once resolved it either renders the children or
// redirects to /login.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default ProtectedRoute
