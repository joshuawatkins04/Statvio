const express = require("express");
const musicController = require("../controllers/musicController");
const router = express.Router();

router.get("/auth/spotify", musicController.redirectSpotifyAuth);
router.get("/callback", musicController.spotifyCallback);
router.get("/playlists", musicController.getSpotifyPlaylists);
router.get("/status", musicController.getSpotifyStatus);

module.exports = router;