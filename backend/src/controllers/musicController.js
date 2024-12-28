const { SpotifyAuth, SpotifyClient } = require("../services/spotify");

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

const getSpotifyPlaylists = async (req, res, next) => {
  try {
    let { accessToken, refreshToken, expiresIn, obtainedAt } = req.session.spotify || {};
    const now = Date.now();

    if (now - obtainedAt > expiresIn * 1000) {
      const refreshed = await SpotifyAuth.refreshAccessToken(refreshToken);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      expiresIn = refreshed.expiresIn;
      obtainedAt = Date.now();
      req.session.spotify = { accessToken, refreshToken, expiresIn, obtainedAt };
    }

    const client = new SpotifyClient(accessToken);
    const playlists = await client.getUserPlaylists();
    res.json({ playlists });
  } catch (error) {
    console.error("[musicController - getSpotifyTopSongs] ERROR: failed to retrieve playlists.");
    res.status(500).send("Could not fetch playlists");
    next(error);
  }
};

const getSpotifyTopSongs = async (req, res, next) => {
  try {
    let { accessToken, refreshToken, expiresIn, obtainedAt } = req.session.spotify || {};
    const now = Date.now();

    if (now - obtainedAt > expiresIn * 1000) {
      const refreshed = await SpotifyAuth.refreshAccessToken(refreshToken);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      expiresIn = refreshed.expiresIn;
      obtainedAt = Date.now();
      req.session.spotify = { accessToken, refreshToken, expiresIn, obtainedAt };
    }

    const client = new SpotifyClient(accessToken);
    const topSongs = await client.getUserTopSongs();
    res.json({ topSongs });
  } catch (error) {
    console.error("[musicController - getSpotifyTopSongs] ERROR: failed to retrieve top songs.");
    next(error);
  }
};

const getSpotifyTopArtists = async (req, res, next) => {
  try {
    let { accessToken, refreshToken, expiresIn, obtainedAt } = req.session.spotify || {};
    const now = Date.now();

    if (now - obtainedAt > expiresIn * 1000) {
      const refreshed = await SpotifyAuth.refreshAccessToken(refreshToken);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      expiresIn = refreshed.expiresIn;
      obtainedAt = Date.now();
      req.session.spotify = { accessToken, refreshToken, expiresIn, obtainedAt };
    }

    const client = new SpotifyClient(accessToken);
    const topArtists = await client.getUserTopArtists();
    res.json({ topArtists });
  } catch (error) {
    console.error("[musicController - getSpotifyTopArtists] ERROR: failed to retrieve top artists.");
    next(error);
  }
};

const getSpotifyListeningHistory = async (req, res, next) => {
  try {
    let { accessToken, refreshToken, expiresIn, obtainedAt } = req.session.spotify || {};
    const now = Date.now();

    if (now - obtainedAt > expiresIn * 1000) {
      const refreshed = await SpotifyAuth.refreshAccessToken(refreshToken);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      expiresIn = refreshed.expiresIn;
      obtainedAt = Date.now();
      req.session.spotify = { accessToken, refreshToken, expiresIn, obtainedAt };
    }

    const client = new SpotifyClient(accessToken);
    const listeningHistory = await client.getUserListeningHistory();
    res.json({ listeningHistory });
  } catch (error) {
    console.error(
      "[musicController - getSpotifyListeningHistory] ERROR: failed to retrieve listening history."
    );
    next(error);
  }
};

const getSpotifyOverview = async (req, res, next) => {
  try {
    let { accessToken, refreshToken, expiresIn, obtainedAt } = req.session.spotify || {};
    const now = Date.now();
    if (now - obtainedAt > expiresIn * 1000) {
      const refreshed = await SpotifyAuth.refreshAccessToken(refreshToken);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      expiresIn = refreshed.expiresIn;
      obtainedAt = Date.now();
      req.session.spotify = { accessToken, refreshToken, expiresIn, obtainedAt };
    }

    const client = new SpotifyClient(accessToken);
    const [topSongs, topArtists, listeningHistory, playlists] = await Promise.all([
      client.getUserTopSongs(),
      client.getUserTopArtists(),
      client.getUserListeningHistory(),
      client.getUserPlaylists(),
    ]);
    console.log("Done fetching all Spotify data");

    res.json({
      topSongs,
      topArtists,
      listeningHistory,
      playlists,
    });
  } catch (error) {
    console.error(
      "[musicController - getSpotifyListeningHistory] ERROR: failed to retrieve listening history."
    );
    next(error);
  }
};

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
