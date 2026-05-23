const axios = require("axios");
const querystring = require("querystring");
const User = require("../../models/user");
const logger = require("../../config/logger");
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
    logger.debug("[SpotifyAuth] Authorization URL generated.", { url });
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
      logger.debug("[SpotifyAuth] Exchanging code for access token...");
      const response = await axios.post(tokenUrl, querystring.stringify(body), {
        headers,
      });

      const { access_token, refresh_token, expires_in } = response.data;
      logger.info("[SpotifyAuth] Access token received successfully.", { access_token });
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
      logger.debug("[SpotifyAuth] Refreshing access token...");
      const response = await axios.post(tokenUrl, querystring.stringify(body), {
        headers,
      });

      const { access_token, expires_in, refresh_token: newRefreshToken } = response.data;
      logger.info("[SpotifyAuth] Access token refreshed successfully.", { access_token });
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
    logger.debug("[SpotifyAuth] Unlinking Spotify account...", { userId });
    try {
      const user = await User.findById(userId);
      if (!user) {
        logger.warn("[SpotifyAuth] User not found.", { userId });
        throw new Error("User not found");
      }

      if (user.apisLinked.includes("Spotify")) {
        user.apisLinked = user.apisLinked.filter((api) => api !== "Spotify");
        user.apiCount = user.apisLinked.length;
      }
      user.spotify.accessToken = null;
      user.spotify.refreshToken = null;
      user.spotify.linked = false;
      await user.save();

      logger.info("[SpotifyAuth] Spotify account unlinked successfully.", { userId });
      return { success: true, message: "Spotify account unlinked successfully." };
    } catch (error) {
      SpotifyAuth._handleError(error, "unlinkUser");
    }
  }

  static _handleError(error, methodName) {
    logger.error(`[SpotifyAuth] Error in ${methodName}.`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });
    throw new Error(`SpotifyAuth error in ${methodName}: ${error.message}`);
  }
}

module.exports = SpotifyAuth;
