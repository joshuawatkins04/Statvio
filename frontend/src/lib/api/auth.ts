import { createApiClient, toApiError } from "./client"
import type { LoginResponse } from "./types"

// Auth + user-account API. Backed by VITE_AUTH_URL (/api/auth). This is the
// primary client used by the AuthContext for login, signup, profile updates,
// and session verification.
const api = createApiClient(import.meta.env.VITE_AUTH_URL)

export async function loginUser(
  usernameOrEmail: string,
  password: string,
): Promise<LoginResponse> {
  try {
    const { data } = await api.post("/login", { usernameOrEmail, password })
    return data
  } catch (error) {
    throw toApiError(error, "Login failed.")
  }
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
) {
  try {
    const { data } = await api.post("/signup", { username, email, password })
    return data
  } catch (error) {
    throw toApiError(error, "Registration failed.")
  }
}

export async function updateUsername(newUsername: string) {
  try {
    const { data } = await api.put("/update-username", { newUsername })
    return data
  } catch (error) {
    throw toApiError(error, "Update username failed.")
  }
}

export async function updateEmail(newEmail: string) {
  try {
    const { data } = await api.put("/update-email", { newEmail })
    return data
  } catch (error) {
    throw toApiError(error, "Update email failed.")
  }
}

export async function updatePassword(
  newPassword: string,
  confirmNewPassword: string,
) {
  try {
    const { data } = await api.put("/update-password", {
      newPassword,
      confirmNewPassword,
    })
    return data
  } catch (error) {
    throw toApiError(error, "Update password failed.")
  }
}

export async function updateTutorialStatus(tutorialComplete: boolean) {
  try {
    const { data } = await api.put("/update-tutorial-status", {
      tutorialComplete,
    })
    return data
  } catch (error) {
    throw toApiError(error, "Update status failed.")
  }
}

// refreshAccessToken hits /refresh-token and stores the returned token. Kept to
// preserve the original session-refresh flow; the AuthContext degrades
// gracefully (logout) when the endpoint is unavailable.
export async function refreshAccessToken(): Promise<string> {
  try {
    const { data } = await api.post("/refresh-token")
    const token = data.accessToken ?? data.token
    if (token) {
      localStorage.setItem("access_token", token)
    }
    return token
  } catch {
    throw new Error("Failed to refresh access token.")
  }
}

export default api
