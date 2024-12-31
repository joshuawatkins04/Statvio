const { SpotifyAuth, SpotifyClient } = require("../services/spotify");

/* Utility functions */
const refreshSpotifySession = async (session) => {
  if (!session.spotify) {
    throw new Error("Spotify session not found. User may not be authenticated.");
  }
  
  let { accessToken, refreshToken, expiresIn, obtainedAt } = session.spotify || {};
  const now = Date.now();

  if (now - obtainedAt > expiresIn * 1000) {
    if (!refreshToken) {
      throw new Error("Spotify session not found. User may not be authenticated.");
    }
    
    const refreshed = await SpotifyAuth.refreshAccessToken(refreshToken);
    accessToken = refreshed.accessToken;
    refreshToken = refreshed.refreshToken;
    expiresIn = refreshed.expiresIn;
    obtainedAt = Date.now();
    session.spotify = { accessToken, refreshToken, expiresIn, obtainedAt };
  }

  return new SpotifyClient(accessToken);
};

const handleSpotifyRequest = (action) => {
  return async (req, res, next) => {
    try {
      const client = await refreshSpotifySession(req.session);
      const result = await action(client, req);
      res.json(result);
    } catch (error) {
      console.error(`[Spotify API] ERROR: ${error.message}`);
      if (error.message.includes("Spotify session not found") || error.message.includes("Refresh token not available")) {
        return res.status(401).send("Authentication required. Please link your Spotify account.");
      }

      res.status(500).send("An unexpected error occurred.");
      // next(error);
    }
  };
};


/* Controller functions */

const redirectSpotifyAuth = (req, res) => {
  const authoriseUrl = SpotifyAuth.getAuthorisationUrl();
  res.redirect(authoriseUrl);
};

const spotifyCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send("Authorisation code not found.");
    }

    const { accessToken, refreshToken, expiresIn } = await SpotifyAuth.getAccessTokenFromCode(code);

    req.session.spotify = { accessToken, refreshToken, expiresIn, obtainedAt: Date.now() };
    const frontendUrl = "http://localhost:5173/dashboard/music/spotify";
    res.redirect(frontendUrl);
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
  const [topSongs, topArtists, listeningHistory, playlists] = await Promise.all([
    client.getUserTopSongs(),
    client.getUserTopArtists(),
    client.getUserListeningHistory(),
    client.getUserPlaylists(),
  ]);
  console.log("Done fetching all Spotify data");
  
  return {
    topSongs,
    topArtists,
    listeningHistory,
    playlists,
  };
});

const getSpotifyStatus = (req, res) => {
  const isLinked = !!(req.session.spotify && req.session.spotify.accessToken);
  res.json({ linked: isLinked });
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
};
