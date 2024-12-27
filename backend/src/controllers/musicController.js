const { SpotifyAuth, SpotifyClient } = require("../services/spotify");

const redirectSpotifyAuth = (req, res) => {
  const authoriseUrl = SpotifyAuth.getAuthorisationUrl();
  res.redirect(authoriseUrl);
}

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
}

const getSpotifyPlaylists = async (req, res) => {
  try {
    let { accessToken, refreshToken, expiresIn, obtainedAt } = req.session.spotify || {};
    const now = Date.now();

    if (now - obtainedAt > (expiresIn * 1000)) {
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
    console.error(error);
    res.status(500).send("Could not fetch playlists");
  }
}

const getSpotifyStatus = (req, res) => {
  const isLinked = !!(req.session.spotify && req.session.spotify.accessToken);
  res.json({ linked: isLinked });
}

module.exports = {
  redirectSpotifyAuth,
  spotifyCallback,
  getSpotifyPlaylists,
  getSpotifyStatus,
};