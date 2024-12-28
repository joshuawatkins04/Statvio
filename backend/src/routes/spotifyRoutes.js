const express = require("express");
const musicController = require("../controllers/musicController");
const router = express.Router();

router.get("/auth/spotify", musicController.redirectSpotifyAuth);
router.get("/callback", musicController.spotifyCallback);
router.get("/overview", musicController.getSpotifyOverview);
router.get("/top-songs", musicController.getSpotifyTopSongs);
router.get("/top-artists", musicController.getSpotifyTopArtists);
router.get("/listening-history", musicController.getSpotifyListeningHistory);
router.get("/playlists", musicController.getSpotifyPlaylists);
router.get("/status", musicController.getSpotifyStatus);

module.exports = router;