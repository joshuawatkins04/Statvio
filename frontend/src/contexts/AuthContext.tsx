/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import api, {
  loginUser,
  registerUser,
  refreshAccessToken,
} from "@/lib/api/auth"
import type { ApiInfo, User } from "@/lib/api/types"

interface AuthContextValue {
  isAuthenticated: boolean
  authLoading: boolean
  user: User | null
  login: (usernameOrEmail: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  updateApiInfo: () => Promise<ApiInfo>
}

export const AuthContext = createContext<AuthContextValue>(
  {} as AuthContextValue,
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  const updateApiInfo = useCallback(async (): Promise<ApiInfo> => {
    const response = await api.get("/api-info")
    return response.data
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/user")
      setUser(response.data)
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const refreshAuth = useCallback(async () => {
    try {
      const token = await refreshAccessToken()
      if (token) {
        localStorage.setItem("access_token", token)
        return token
      }
      return null
    } catch {
      return null
    }
  }, [])

  const verifyAuth = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      setIsAuthenticated(false)
      setUser(null)
      setAuthLoading(false)
      return
    }
    try {
      const decoded = jwtDecode(accessToken)
      const now = Date.now() / 1000
      if (decoded.exp && decoded.exp < now) {
        const newToken = await refreshAuth()
        if (!newToken) {
          throw new Error("Failed to refresh token.")
        }
      }
      const response = await api.get("/verify")
      if (response.data.isValid) {
        setIsAuthenticated(true)
        await fetchUser()
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch {
      localStorage.removeItem("access_token")
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }, [fetchUser, refreshAuth])

  useEffect(() => {
    verifyAuth()
  }, [verifyAuth])

  // Keep auth state in sync across tabs: clearing a token in one tab logs out
  // the others; changing one re-verifies.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== "access_token" && event.key !== "user_id") {
        return
      }
      if (!event.newValue) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user_id")
        setIsAuthenticated(false)
        setUser(null)
        navigate("/login")
      } else {
        verifyAuth()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [verifyAuth, navigate])

  const login = useCallback(
    async (usernameOrEmail: string, password: string) => {
      const data = await loginUser(usernameOrEmail, password)
      localStorage.setItem("access_token", data.token)
      localStorage.setItem("user_id", data.userId)
      setIsAuthenticated(true)
      await fetchUser()
    },
    [fetchUser],
  )

  const logout = useCallback(async () => {
    try {
      const userId = localStorage.getItem("user_id")
      if (userId) {
        await api.post("/logout", { userId })
      }
    } catch {
      // Ignore network errors on logout; clear local session regardless.
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("user_id")
      setIsAuthenticated(false)
      setUser(null)
      navigate("/login")
    }
  }, [navigate])

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await registerUser(username, email, password)
      navigate("/login")
    },
    [navigate],
  )

  // Proactively refresh the access token shortly before it expires.
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    const token = localStorage.getItem("access_token")
    if (!token) {
      return
    }
    const decoded = jwtDecode(token)
    if (!decoded.exp) {
      return
    }
    const timeout = decoded.exp * 1000 - Date.now() - 60 * 1000
    if (timeout > 0) {
      const timer = setTimeout(() => refreshAuth(), timeout)
      return () => clearTimeout(timer)
    }
    refreshAuth()
  }, [isAuthenticated, refreshAuth])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        user,
        login,
        logout,
        register,
        updateApiInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
