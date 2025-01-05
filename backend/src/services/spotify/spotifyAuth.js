const axios = require("axios");
const querystring = require("querystring");
const User = require("../../models/userModel");
require("dotenv").config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
const authUrl = process.env.SPOTIFY_AUTH_URL;

class SpotifyAuth {
  static getAuthorisationUrl(
    scopes = [
      "user-read-private",
      "user-read-email",
      "playlist-read-private",
      "playlist-read-collaborative",
      "user-top-read",
      "user-read-recently-played",
    ]
  ) {
    const params = {
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
    };

    const url = `${authUrl}/authorize?${querystring.stringify(params)}`;
    console.log("[SpotifyAuth] Authorization URL generated:", url);
    return url;
  }

  static async getAccessTokenFromCode(code) {
    const tokenUrl = `${authUrl}/api/token`;
    const body = {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    };

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    };

    try {
      console.log("[SpotifyAuth] Exchanging code for access token...");
      const response = await axios.post(tokenUrl, querystring.stringify(body), {
        headers,
      });
      console.log("[SpotifyAuth] Access token response:", response.data);

      const { access_token, refresh_token, expires_in } = response.data;
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      };
    } catch (error) {
      SpotifyAuth._handleError(error, "getAccessTokenFromCode");
    }
  }

  static async refreshAccessToken(refreshToken) {
    const tokenUrl = `${authUrl}/api/token`;
    const body = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    };

    try {
      console.log("[SpotifyAuth] Frefreshing access token...");
      const response = await axios.post(tokenUrl, querystring.stringify(body), {
        headers,
      });
      console.log("[SpotifyAuth] Refresh token response:", response.data);

      const { access_token, expires_in, refresh_token: newRefreshToken } = response.data;
      return {
        accessToken: access_token,
        expiresIn: expires_in,
        refreshToken: newRefreshToken || refreshToken,
      };
    } catch (error) {
      SpotifyAuth._handleError(error, "refreshAccessToken");
    }
  }

  static async unlinkUser(userId) {
    console.log("[SpotifyAuth - unlinkSpotify] Unlinking Spotify API...");
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.spotify.accessToken = null;
      user.spotify.refreshToken = null;
      user.spotify.linked = false;
      await user.save();

      console.log("[SpotifyAuth - unlinkSpotify] Spotify account unlinked successfully.");
      return { success: true, message: "Spotify account unlinked successfully." };
    } catch (error) {
      SpotifyAuth._handleError(error, "unlinkUser");
    }
  }

  static _handleError(error, methodName) {
    console.error(`[SpotifyAuth] Error in ${methodName}:`);
    if (error.response) {
      console.error(`Status Code: ${error.response.status}`);
      console.error("Response Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
}

module.exports = SpotifyAuth;
