const fetch = require("node-fetch");
require("dotenv").config();

const authUrl = process.env.SPOTIFY_AUTH_URL;

class SpotifyClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async getUserProfile() {
    const url = `${authUrl}/me`;
    const profile = await this._makeRequest(url);
    return {
      id: profile.id,
      displayName: profile.display_name,
      email: profile.email,
      imageUrl:
        profile.images && profile.images[0] ? profile.image[0].url : null,
    };
  }

  async getUserPlaylists() {
    const url = `${authUrl}/me/playlists?limit=50`;
    const data = await this._makeRequest(url);
    console.log("Playlist data:", data.items);
    return data.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      trackCount: playlist.tracks.total,
      imageUrl: playlist.images && playlist.images.length > 0 ? playlist.images[0].url : null
    }));
  }

  async _makeRequest(url, method = "GET", body = null) {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Spotify API error (${res.status}): ${errorBody}`);
    }

    return res.json();
  }
}

module.exports = SpotifyClient;
