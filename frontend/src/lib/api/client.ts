import axios, { type AxiosInstance } from "axios"

// createApiClient builds an axios instance that attaches the JWT access token
// from localStorage to every request. All of Statvio's per-domain API clients
// (auth, spotify, soundcloud, ai, stripe, aws) are built from this factory.
export function createApiClient(
  baseURL: string,
  withCredentials = false,
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    withCredentials,
    headers: { "Content-Type": "application/json" },
  })

  instance.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem("access_token")
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  return instance
}

// toApiError normalises an unknown thrown value (usually an AxiosError) into a
// plain Error carrying the server-provided message when available.
export function toApiError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message
    return new Error(message || fallback)
  }
  return new Error(fallback)
}
