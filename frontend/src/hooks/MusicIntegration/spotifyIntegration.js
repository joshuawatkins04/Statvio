import axios from "axios";

const spotifyApi = axios.create({
  baseURL: "http://localhost:5000/api/music/spotify",
  withCredentials: true,
});

spotifyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Spotify API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getSpotifyStatus = async () => {
  try {
    const response = await spotifyApi.get("/status");
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
}

export const getSpotifyTopSongs = async () => {
  try {
    const response = await spotifyApi.get("/top-songs");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch Spotify top songs");
  }
}

export const getSpotifyTopArtists = async () => {
  try {
    const response = await spotifyApi.get("/top-artists");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch Spotify top artists");
  }
}

export const getSpotifyListeningHistory = async () => {
  try {
    const response = await spotifyApi.get("/listening-history");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch Spotify listening history");
  }
}

export const connectToSpotify = () => {
  window.location.href = "http://localhost:5000/api/music/spotify/auth/spotify";
};
