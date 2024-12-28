const axios = require("axios");
require("dotenv").config();

const apiUrl = process.env.SPOTIFY_API_URL;

class SpotifyClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  async getUserProfile() {
    try {
      const response = await this.api.get("/me");
      const profile = response.data;
      return {
        id: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        imageUrl: profile.images?.[0]?.url || null,
      };
    } catch (error) {
      this._handleError(error);
    }
  }

  async getUserPlaylists() {
    console.log("[SpotifyClient - getUserPlaylists] Requesting playlists from Spotify API...");
    try {
      const response = await this.api.get("/me/playlists", {
        params: { limit: 50 },
      });
      const playlists = response.data.items;
      return playlists.map((item) => ({
        id: item.id,
        name: item.name,
        trackCount: item.tracks.total,
        imageUrl: item.images?.[0]?.url || null,
      }));
    } catch (error) {
      this._handleError(error);
    }
  }

  async getUserTopSongs() {
    console.log("[SpotifyClient - getUserTopSongs] Requesting top songs from Spotify API...");
    try {
      const response = await this.api.get("/me/top/tracks");
      const topSongs = response.data.items;
      return topSongs.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.album?.images?.[0]?.url || null,
      }));
    } catch (error) {
      this._handleError(error);
    }
  }

  async getUserTopArtists() {
    console.log("[SpotifyClient - getUserTopArtists] Requesting top artists from Spotify API...");
    try {
      const response = await this.api.get("/me/top/artists");
      const topArtists = response.data.items;
      return topArtists.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0]?.url || null,
      }))
    } catch (error) {
      this._handleError(error);
    }
  }

  async getUserListeningHistory() {
    console.log("[SpotifyClient - getUserListeningHistory] Requesting listening history from Spotify API...");
    try {
      const response = await this.api.get("/me/player/recently-played");
      const listeningHistory = response.data.items;
      return listeningHistory.map((item) => ({
        id: item.id,
        name: item.track.name,
        artist: item.track.artists?.[0]?.name || null,
        played_at: item.played_at,
        imageUrl: item.track.album?.images?.[0]?.url || null,
      }));
    } catch (error) {
      this._handleError(error);
    }
  }

  _handleError(error) {
    if (error.response) {
      console.error(
        `Spotify API error (${error.response.status}):`,
        error.response.data
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error in request setup:", error.message);
    }
    throw error;
  }
}

module.exports = SpotifyClient;
