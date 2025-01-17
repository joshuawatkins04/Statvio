import axios from "axios";

const spotifyApi = axios.create({
  baseURL: __SPOTIFY_BASE_URL__,
  withCredentials: true,
});

spotifyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[spotifyApi] No token found in localStorage.");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

spotifyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Spotify API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const unlinkSpotify = async () => {
  try {
    const response = await spotifyApi.post("/unlink");
    console.log("[Frontend - unlinkSpotify] Successfully unlinked Spotify account:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "[Frontend - unlinkSpotify] Failed to unlink Spotify:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to unlink Spotify account.");
  }
};

export const getSpotifyStatus = async () => {
  try {
    const response = await spotifyApi.get("/status");
    console.log("[getSpotifyStatus] Response: ", response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to check Spotify status");
  }
};

export const getSpotifyPlaylists = async () => {
  try {
    const response = await spotifyApi.get("/playlists");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch Spotify playlists");
  }
};

export const getSpotifyOverview = async () => {
  try {
    const response = await spotifyApi.get("/overview");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch Spotify overview stats");
  }
};

export const getSpotifyTopSongs = async (timeRange) => {
  console.log("Sending timeRange:", timeRange);
  try {
    const response = await spotifyApi.get("/top-songs", {
      params: { time_range: timeRange }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch Spotify top songs");
  }
};

export const getSpotifyTopArtists = async () => {
  try {
    const response = await spotifyApi.get("/top-artists");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch Spotify top artists");
  }
};

export const getSpotifyListeningHistory = async () => {
  try {
    const response = await spotifyApi.get("/listening-history");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch Spotify listening history");
  }
};

export const newTopSongs = async (time_range) => {
  try {
    const response = await getSpotifyTopSongs(time_range);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch Spotify new top songs with timestamp ",
      timestamp
    );
  }
};

export const connectToSpotify = async () => {
  try {
    const token = localStorage.getItem("access_token");
    window.location.href = `${__SPOTIFY_AUTH_URL__}?token=${token}`;
  } catch (error) {
    console.error("Error initiating Spotify auth:", error);
  }
};
