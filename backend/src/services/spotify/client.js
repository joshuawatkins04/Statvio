const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 });
const logger = require("../../config/logger");
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
        logger.debug("[SpotifyClient - getUserProfile] Fetching user profile...");
        const response = await this.api.get("/me");
        const profile = response.data;
        logger.debug("[SpotifyClient - getUserProfile] Successfully fetched user profile.");
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
    logger.debug("[SpotifyClient - getUserPlaylists] Fetching playlists...");
    return this._retryRequest(async () => {
      try {
        const response = await this.api.get("/me/playlists", {
          params: { limit: 50 },
        });
        const playlists = response.data.items;
        logger.debug("[SpotifyClient - getUserPlaylists] Successfully fetched playlists.");
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
    logger.debug("[SpotifyClient - getUserTopSongs] Fetching top songs...");
    return this._retryRequest(async () => {
      try {
        const response = await this.api.get("/me/top/tracks", {
          params: {
            time_range: timeRange,
            limit: 50,
          },
        });
        const topSongs = response.data.items;
        logger.debug("[SpotifyClient - getUserTopSongs] Successfully fetched top songs.");
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
    logger.debug("[SpotifyClient - getUserTopArtists] Fetching top artists...");
    return this._retryRequest(async () => {
      try {
        const response = await this.api.get("/me/top/artists", {
          params: {
            time_range: timeRange,
            limit: 50,
          },
        });
        const topArtists = response.data.items;
        logger.debug("[SpotifyClient - getUserTopArtists] Successfully fetched top artists.");
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
    logger.debug("[SpotifyClient - getUserListeningHistory] Fetching listening history...");
    return this._retryRequest(async () => {
      try {
        const response = await this.api.get("/me/player/recently-played", {
          params: { limit: 50 },
        });
        const listeningHistory = response.data.items;
        logger.debug("[SpotifyClient - getUserListeningHistory] Successfully fetched listening history.");
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
      logger.debug("[SpotifyClient - getUserOverview] Returning cached data.");
      return cachedData;
    }

    logger.debug("[SpotifyClient - getUserOverview] Fetching aggregated Spotify data...");
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
      logger.debug("[SpotifyClient - getUserOverview] Aggregated data fetched and cached.");
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
          logger.warn(`[SpotifyClient - Retry] Rate limit hit. Retrying (${attempt + 1}/${retries})...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
        } else {
          throw error;
        }
      }
    }
    logger.error("[SpotifyClient - Retry] Max retries reached for Spotify API call.");
    throw new Error("Max retries reached for Spotify API call.");
  }

  _handleError(error) {
    if (error.response) {
      logger.error("Spotify API Error", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      logger.error("No response received from Spotify API", { request: error.request });
    } else {
      logger.error("Error in request setup", { message: error.message });
    }
    throw new Error("Failed to process Spotify API request.");
  }
}

module.exports = SpotifyClient;
