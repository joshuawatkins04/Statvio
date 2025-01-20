const { SpotifyAuth, SpotifyClient } = require("../services/spotify");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const FRONTEND_SPOTIFY_URL = process.env.FRONTEND_SPOTIFY_URL;

/* Utility functions */

const refreshSpotifySession = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.spotify.linked) {
    logger.warn(
      "[spotifyController - refreshSpotifySession] No valid Spotify session found in the database.",
      { userId }
    );
    throw new Error("Spotify session not found. User may not be authenticated.");
  }

  let { accessToken, refreshToken, tokenExpiresAt } = user.spotify;
  const now = Date.now();

  if (!accessToken || !refreshToken) {
    logger.warn("[spotifyController - refreshSpotifySession] Missing access or refresh token in user data.", {
      userId,
    });
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
      logger.debug(
        "[spotifyController - refreshSpotifySession] Spotify token refreshed and updated in database.",
        { userId }
      );
    } catch (error) {
      logger.error("[spotifyController - refreshSpotifySession] Failed to refresh access token.", {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to refresh Spotify access token.");
    }
  } else {
    logger.debug("[spotifyController - refreshSpotifySession] Spotify session is still valid.", { userId });
  }

  return new SpotifyClient(accessToken);
};

const handleSpotifyRequest = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logger.warn("[spotifyController - handleSpotifyRequest] User ID missing in request.");
        return res.status(401).send("User not authenticated.");
      }
      logger.debug("[spotifyController - handleSpotifyRequest] User ID found.", { userId });
      const client = await refreshSpotifySession(userId);
      const result = await action(client, req);
      res.json(result);
    } catch (error) {
      logger.error(`[spotifyController - handleSpotifyRequest] Error during Spotify request.`, {
        error: error.message,
        stack: error.stack,
      });
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
    logger.warn("[spotifyController - SpotifyAuth] User is not authenticated.");
    return res.status(401).send("User must be logged in to connect Spotify.");
  }

  const jwtToken = req.query.token || req.headers.authorization?.split(" ")[1];
  const authorizeUrl = SpotifyAuth.getAuthorisationUrl();
  const callbackUrl = `${authorizeUrl}&state=${jwtToken}`;

  logger.debug("[spotifyController - SpotifyAuth] Redirecting to Spotify authorization URL.", {
    callbackUrl,
  });
  res.redirect(callbackUrl);
};

const spotifyCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;

    if (!code) {
      logger.warn("[spotifyController - spotifyCallback] Missing authorization code in query.");
      return res.status(400).send("Authorisation code not found.");
    }
    if (!state) {
      logger.warn("[spotifyController - spotifyCallback] Missing JWT token in state parameter.");
      return res.status(401).send("Missing JWT token in state parameter.");
    }

    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const userId = decoded?.id;
    if (!userId) {
      logger.warn("[spotifyController - spotifyCallback] User ID not found in decoded token.");
      return res.status(401).send("User not authenticated.");
    }

    const { accessToken, refreshToken, expiresIn } = await SpotifyAuth.getAccessTokenFromCode(code);

    const user = await User.findById(userId);
    if (!user) {
      logger.warn("[spotifyController - spotifyCallback] User not found in database.", { userId });
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

    logger.debug("[spotifyController - spotifyCallback] Spotify details saved to database.", { userId });

    res.redirect(FRONTEND_SPOTIFY_URL);
  } catch (error) {
    logger.error("[spotifyController - spotifyCallback] Error during Spotify callback.", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).send("Authentication error");
  }
};

const getSpotifyPlaylists = handleSpotifyRequest(async (client) => {
  const playlists = await client.getUserPlaylists();
  return { playlists };
});

const getSpotifyTopSongs = handleSpotifyRequest(async (client, req) => {
  const { time_range: timeRange = "short_term" } = req.query;
  const topSongs = await client.getUserTopSongs(timeRange);
  return { topSongs };
});

const getSpotifyTopArtists = handleSpotifyRequest(async (client, req) => {
  const { time_range: timeRange = "short_term" } = req.query;
  const topArtists = await client.getUserTopArtists(timeRange);
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
      logger.warn("[spotifyController - getSpotifyStatus] User not authenticated.");
      return res.status(401).json({ message: "User not authenticated." });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn("[spotifyController - getSpotifyStatus] User not found in database.", { userId });
      return res.status(404).json({ message: "User not found." });
    }

    const isLinked = user.spotify?.linked || false;

    if (isLinked && !user.apisLinked.includes("Spotify")) {
      user.apisLinked.push("Spotify");
      user.apiCount = user.apisLinked.length;
      await user.save();
    }

    logger.info("[spotifyController - getSpotifyStatus] Spotify linked status fetched.", {
      userId,
      isLinked,
    });
    res.json({ linked: isLinked });
  } catch (error) {
    logger.error("[spotifyController - getSpotifyStatus] Failed to fetch Spotify status.", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Failed to fetch Spotify status." });
  }
};

const unlinkSpotifyAccount = async (req, res) => {
  logger.debug("[spotifyController - unlinkSpotifyAccount] Initiating Spotify unlink process.");

  try {
    const userId = req.user?.id;
    if (!userId) {
      logger.warn("[spotifyController - unlinkSpotifyAccount] User not authenticated.");
      return res.status(401).json({ message: "User not authenticated." });
    }

    await SpotifyAuth.unlinkUser(userId);
    logger.info("[spotifyController - unlinkSpotifyAccount] Spotify account unlinked successfully.", {
      userId,
    });

    return res.status(200).json({ message: "Spotify account unlinked successfully." });
  } catch (error) {
    logger.error("[spotifyController - unlinkSpotifyAccount] Failed to unlink Spotify account.", {
      error: error.message,
      stack: error.stack,
    });
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
