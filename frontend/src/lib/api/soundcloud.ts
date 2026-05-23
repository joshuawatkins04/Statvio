import { createApiClient } from "./client"

// Soundcloud integration client. Backed by VITE_SOUNDCLOUD_BASE_URL. The
// integration is not yet implemented server-side; these are intentional stubs
// preserved from the legacy app.
const soundcloudApi = createApiClient(
  import.meta.env.VITE_SOUNDCLOUD_BASE_URL,
  true,
)

export async function unlinkSoundcloud() {}

export async function connectToSoundcloud() {}

export async function getSoundcloudOverview() {}

export async function getSoundcloudStatus() {}

export default soundcloudApi
