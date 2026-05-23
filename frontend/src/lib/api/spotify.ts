import { createApiClient, toApiError } from "./client"

// Spotify integration client. Backed by VITE_SPOTIFY_BASE_URL.
const spotifyApi = createApiClient(import.meta.env.VITE_SPOTIFY_BASE_URL, true)

export async function unlinkSpotify() {
  try {
    const { data } = await spotifyApi.post("/unlink")
    return data
  } catch (error) {
    throw toApiError(error, "Failed to unlink Spotify account.")
  }
}

export async function getSpotifyStatus() {
  try {
    const { data } = await spotifyApi.get("/status")
    return data
  } catch (error) {
    throw toApiError(error, "Failed to check Spotify status")
  }
}

export async function getSpotifyPlaylists() {
  try {
    const { data } = await spotifyApi.get("/playlists")
    return data
  } catch (error) {
    throw toApiError(error, "Failed to fetch Spotify playlists")
  }
}

export async function getSpotifyOverview() {
  try {
    const { data } = await spotifyApi.get("/overview")
    return data
  } catch (error) {
    throw toApiError(error, "Failed to fetch Spotify overview stats")
  }
}

export async function getSpotifyTopSongs(timeRange: string) {
  try {
    const { data } = await spotifyApi.get("/top-songs", {
      params: { time_range: timeRange },
    })
    return data
  } catch (error) {
    throw toApiError(error, "Failed to fetch Spotify top songs")
  }
}

export async function getSpotifyTopArtists(timeRange: string) {
  try {
    const { data } = await spotifyApi.get("/top-artists", {
      params: { time_range: timeRange },
    })
    return data
  } catch (error) {
    throw toApiError(error, "Failed to fetch Spotify top artists")
  }
}

export async function getSpotifyListeningHistory() {
  try {
    const { data } = await spotifyApi.get("/listening-history")
    return data
  } catch (error) {
    throw toApiError(error, "Failed to fetch Spotify listening history")
  }
}

export async function getRecommendedSongs(playlistId: string) {
  try {
    const { data } = await spotifyApi.get("/recommend-playlist-songs", {
      params: { playlist_id: playlistId },
    })
    return data
  } catch (error) {
    throw toApiError(error, "Failed to fetch AI playlist recommendations")
  }
}

export async function getPlaylistStats(playlistId: string) {
  try {
    const { data } = await spotifyApi.get("/analyse-playlist-stats", {
      params: { playlist_id: playlistId },
    })
    return data
  } catch (error) {
    throw toApiError(error, "Failed to fetch AI playlist stats")
  }
}

// connectToSpotify kicks off the OAuth flow by handing the JWT to the backend
// auth URL via a full-page redirect.
export function connectToSpotify() {
  const token = localStorage.getItem("access_token")
  window.location.href = `${import.meta.env.VITE_SPOTIFY_AUTH_URL}?token=${token}`
}

export default spotifyApi
