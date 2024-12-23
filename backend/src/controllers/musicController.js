const { SpotifyAuth, SpotifyClient } = require("../services/spotify");

module.exports = {
  redirectSpotifyAuth(req, res) {
    const authoriseUrl = SpotifyAuth.getAuthorisationUrl();
    res.redirect(authoriseUrl);
  },

  async spotifyCallback(req, res) {
    try {
      const code = req.query.code;
      if (!code) {
        return res.status(400).send("Authorisation code not found.");
      }

      const { accessToken, refreshToken, expiresIn } = await SpotifyAuth.getAccessTokenFromCode(code);

      req.session.spotify = { accessToken, refreshToken, expiresIn, obtainedAt: Date.now() };
      const frontendUrl = "http://localhost:5173/dashboard/spotify";
      res.redirect(frontendUrl);
    } catch (error) {
      console.error(error);
      res.status(500).send("Authentication error");
    }
  },

  async getSpotifyPlaylists(req, res) {
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
  },

  getSpotifyStatus(req, res) {
    const isLinked = !!(req.session.spotify && req.session.spotify.accessToken);
    res.json({ linked: isLinked });
  }
};