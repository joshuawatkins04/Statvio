const fetch = require("node-fetch");
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

    return `${authUrl}/authorize?${querystring.stringify(params)}`;
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
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    };

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers,
      body: querystring.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Token exchange error: ${res.status}`);
    }

    const json = await res.json();
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresIn: json.expires_in,
    };
  }

  static async refreshAccessToken(refreshToken) {
    const tokenUrl = `${authUrl}/api/token`;
    const body = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    };

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers,
      body: querystring.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Refresh token error: ${res.status}`);
    }

    const json = await res.json();
    return {
      accessToken: json.access_token,
      expiresIn: json.expires_in,
      refreshToken: json.refresh_token ? json.refresh_token : refreshToken
    };
  }
}

module.exports = SpotifyAuth;
