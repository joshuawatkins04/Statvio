const axios = require("axios");
const querystring = require("querystring");
require("dotenv").config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
const authUrl = process.env.SPOTIFY_AUTH_URL;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

class SpotifyAuth {
  static getAuthorisationUrl(
    scopes = ["user-read-email", "playlist-read-private"]
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
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
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
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    };

    try {
      console.log("[SpotifyAuth] Frefreshing access token...");
      const response = await axios.post(tokenUrl, querystring.stringify(body), {
        headers,
      });
      console.log("[SpotifyAuth] Refresh token response:", response.data);

      const {
        access_token,
        expires_in,
        refresh_token: newRefreshToken,
      } = response.data;
      return {
        accessToken: access_token,
        expiresIn: expires_in,
        expiresIn: newRefreshToken || refreshToken,
      };
    } catch (error) {
      SpotifyAuth._handleError(error, "refreshAccessToken");
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
