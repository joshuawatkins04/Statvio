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
    console.log("Requesting playlists from Spotify API...");
    try {
      const response = await this.api.get("/me/playlists", {
        params: { limit: 50 },
      });
      const playlists = response.data.items;
      return playlists.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        trackCount: playlist.tracks.total,
        imageUrl: playlist.images?.[0]?.url || null,
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
