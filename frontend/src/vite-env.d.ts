/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_URL: string
  readonly VITE_AI_BASE_URL: string
  readonly VITE_SPOTIFY_BASE_URL: string
  readonly VITE_SPOTIFY_AUTH_URL: string
  readonly VITE_SOUNDCLOUD_BASE_URL: string
  readonly VITE_SOUNDCLOUD_AUTH_URL: string
  readonly VITE_STRIPE_BASE_URL: string
  readonly VITE_AWS_UPLOAD_URL: string
  readonly VITE_SPOTIFY_DASHBOARD: string
  readonly VITE_SOUNDCLOUD_DASHBOARD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
