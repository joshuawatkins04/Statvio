const { SpotifyAuth, SpotifyClient } = require("../services/spotify");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const FRONTEND_SPOTIFY_URL = process.env.FRONTEND_SPOTIFY_URL;

/* Utility functions */

const refreshSpotifySession = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.spotify.linked) {
    console.log("[Spotify] No valid Spotify session found in the database.");
    throw new Error("Spotify session not found. User may not be authenticated.");
  }

  let { accessToken, refreshToken, tokenExpiresAt } = user.spotify;
  const now = Date.now();

  if (!accessToken || !refreshToken) {
    console.warn("[Spotify] Missing access or refresh token in user data.");
    throw new Error("Spotify tokens missing. Please re-link Spotify.");
  }

  if (now > new Date(tokenExpiresAt)) {
    try {
      const refreshed = await SpotifyAuth.refreshAccessToken(refreshToken);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken || refreshToken;
      tokenExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

      user.spotify.accessToken = accessToken;
      user.spotify.refreshToken = refreshToken;
      user.spotify.tokenExpiresAt = tokenExpiresAt;
      await user.save();
      console.log("[Spotify] Spotify token refreshed and updated in database.");
    } catch (error) {
      console.error("[Spotify] Failed to refresh access token:", error.message);
      throw new Error("Failed to refresh Spotify access token.");
    }
  } else {
    console.log("Spotify session is still valid.");
  }

  return new SpotifyClient(accessToken);
};

const handleSpotifyRequest = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.warn("[handleSpotifyRequest] User ID missing in request.");
        return res.status(401).send("User not authenticated.");
      }
      console.log("[handleSpotifyRequest] User ID:", userId);
      const client = await refreshSpotifySession(userId);
      const result = await action(client, req);
      res.json(result);
    } catch (error) {
      console.error(`[Spotify API] ERROR: ${error.message}`);
      if (
        error.message.includes("Spotify session not found") ||
        error.message.includes("Refresh token not available")
      ) {
        return res.status(401).send("Authentication required. Please link your Spotify account.");
      }

      res.status(500).send("An unexpected error occurred.");
    }
  };
};

/* Controller functions */

const redirectSpotifyAuth = (req, res) => {
  if (!req.user || !req.user.id) {
    console.warn("[SpotifyAuth] User is not authenticated.");
    return res.status(401).send("User must be logged in to connect Spotify.");
  }

  const jwtToken = req.query.token || req.headers.authorization?.split(" ")[1];
  const authorizeUrl = SpotifyAuth.getAuthorisationUrl();
  const callbackUrl = `${authorizeUrl}&state=${jwtToken}`;

  console.log("[SpotifyAuth] Redirecting to:", callbackUrl);
  res.redirect(callbackUrl);
};

const spotifyCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;

    if (!code) {
      return res.status(400).send("Authorisation code not found.");
    }
    if (!state) {
      return res.status(401).send("Missing JWT token in state parameter.");
    }

    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const userId = decoded?.id;
    if (!userId) {
      return res.status(401).send("User not authenticated.");
    }

    const { accessToken, refreshToken, expiresIn } = await SpotifyAuth.getAccessTokenFromCode(code);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    user.spotify = {
      linked: true,
      accessToken,
      refreshToken,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      lastSyncedAt: Date.now(),
    };
    await user.save();

    console.log("[musicController - spotifyCallback] Spotify details saved to database.");

    res.redirect(FRONTEND_SPOTIFY_URL);
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication error");
  }
};

const getSpotifyPlaylists = handleSpotifyRequest(async (client) => {
  const playlists = await client.getUserPlaylists();
  return { playlists };
});

const getSpotifyTopSongs = handleSpotifyRequest(async (client) => {
  const topSongs = await client.getUserTopSongs();
  return { topSongs };
});

const getSpotifyTopArtists = handleSpotifyRequest(async (client) => {
  const topArtists = await client.getUserTopArtists();
  return { topArtists };
});

const getSpotifyListeningHistory = handleSpotifyRequest(async (client) => {
  const listeningHistory = await client.getUserListeningHistory();
  return { listeningHistory };
});

const getSpotifyOverview = handleSpotifyRequest(async (client) => {
  const overview = await client.getUserOverview();
  return overview;
});

const getSpotifyStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isLinked = user.spotify?.linked || false;

    console.log("[musicController - getSpotifyStatus] Spotify Linked Status:", isLinked);
    res.json({ linked: isLinked });
  } catch (error) {
    console.error("[musicController - getSpotifyStatus] Error:", error.message);
    res.status(500).json({ message: "Failed to fetch Spotify status." });
  }
};

const unlinkSpotifyAccount = async (req, res) => {
  console.log("[musicController - unlinkSpotifyAccount] Initiating Spotify unlink...");

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    await SpotifyAuth.unlinkUser(userId);
    console.log("[musicController - unlinkSpotifyAccount] Spotify account unlinked successfully.");

    return res.status(200).json({ message: "Spotify account unlinked successfully." });
  } catch (error) {
    console.error("[musicController - unlinkSpotifyAccount] Failed to unlink Spotify:", error.message);
    res.status(500).json({ message: "Failed to unlink Spotify account." });
  }
};

module.exports = {
  redirectSpotifyAuth,
  spotifyCallback,
  getSpotifyOverview,
  getSpotifyTopSongs,
  getSpotifyTopArtists,
  getSpotifyListeningHistory,
  getSpotifyPlaylists,
  getSpotifyStatus,
  unlinkSpotifyAccount,
};
