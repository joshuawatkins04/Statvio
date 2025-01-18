const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 });
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
    return this._retryRequest(async () => {
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
    });
  }

  async getUserPlaylists() {
    console.log("[SpotifyClient - getUserPlaylists] Requesting playlists from Spotify API...");
    return this._retryRequest(async () => {
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
    });
  }

  async getUserTopSongs(timeRange = "short_term") {
    console.log("[SpotifyClient - getUserTopSongs] Requesting top songs from Spotify API...");
    return this._retryRequest(async () => {
      try {
        const response = await this.api.get("/me/top/tracks", {
          params: {
            time_range: timeRange,
            limit: 50,
          },
        });
        const topSongs = response.data.items;
        return topSongs.map((item) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.album?.images?.[0]?.url || null,
        }));
      } catch (error) {
        this._handleError(error);
      }
    });
  }

  async getUserTopArtists(timeRange = "short_term") {
    console.log("[SpotifyClient - getUserTopArtists] Requesting top artists from Spotify API...");
    return this._retryRequest(async () => {
      try {
        const response = await this.api.get("/me/top/artists", {
          params: {
            time_range: timeRange,
            limit: 50,
          },
        });
        const topArtists = response.data.items;
        return topArtists.map((item) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.images?.[0]?.url || null,
        }));
      } catch (error) {
        this._handleError(error);
      }
    });
  }

  async getUserListeningHistory() {
    console.log("[SpotifyClient - getUserListeningHistory] Requesting listening history from Spotify API...");
    return this._retryRequest(async () => {
      try {
        const response = await this.api.get("/me/player/recently-played", {
          params: { limit: 50 },
        });
        const listeningHistory = response.data.items;
        return listeningHistory.map((item) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists?.[0]?.name || null,
          played_at: item.played_at,
          imageUrl: item.track.album?.images?.[0]?.url || null,
        }));
      } catch (error) {
        this._handleError(error);
      }
    });
  }

  async getUserOverview() {
    const cacheKey = `spotify_overview_${this.accessToken}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log("[SpotifyClient - getUserOverview] Returning cached data...");
      return cachedData;
    }

    console.log("[SpotifyClient - getUserOverview] Fetching aggregated Spotify data...");
    try {
      const data = await Promise.all([
        this.getUserProfile(),
        this.getUserPlaylists(),
        this.getUserTopSongs(),
        this.getUserTopArtists(),
        this.getUserListeningHistory(),
      ]);

      const overview = {
        profile: data[0],
        playlists: data[1],
        topSongs: data[2],
        topArtists: data[3],
        listeningHistory: data[4],
      };

      cache.set(cacheKey, overview);
      return overview;
    } catch (error) {
      this._handleError(error);
    }
  }

  async _retryRequest(func, retries = 3, delay = 2000) {
    let attempt = 0;

    while (attempt < retries) {
      try {
        return await func();
      } catch (error) {
        if (error.response?.status === 429) {
          console.warn(
            `[Retrying Spotify API - Attempt ${attempt + 1}] Rate limit hit. Retrying after ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
        } else {
          throw error;
        }
      }
    }
    throw new Error("Max retries reached for Spotify API call.");
  }

  _handleError(error) {
    if (error.response) {
      console.error(`Spotify API error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error in request setup:", error.message);
    }
    throw error;
  }
}

module.exports = SpotifyClient;
