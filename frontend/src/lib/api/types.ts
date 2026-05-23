// Shared API types for Statvio. Kept intentionally permissive — the backend is
// the source of truth and several documents carry optional, integration-driven
// fields.

export interface User {
  id?: string
  _id?: string
  username: string
  email: string
  profileImageUrl?: string
  tutorialComplete?: boolean
  apiCount?: number
  apisLinked?: string[]
  [key: string]: unknown
}

export interface LoginResponse {
  message?: string
  token: string
  userId: string
}

export interface ApiInfo {
  apiCount: number
  apisLinked: string[]
}
