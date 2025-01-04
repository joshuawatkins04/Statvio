const express = require("express");
const musicController = require("../controllers/musicController");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

// Public routes
router.get("/callback", musicController.spotifyCallback);

// Protected routes
router.get("/auth/spotify", authenticateToken, musicController.redirectSpotifyAuth);
router.get("/overview", authenticateToken, musicController.getSpotifyOverview);
router.get("/top-songs", authenticateToken, musicController.getSpotifyTopSongs);
router.get("/top-artists", authenticateToken, musicController.getSpotifyTopArtists);
router.get("/listening-history", authenticateToken, musicController.getSpotifyListeningHistory);
router.get("/playlists", authenticateToken, musicController.getSpotifyPlaylists);
router.get("/status", authenticateToken, musicController.getSpotifyStatus);

router.post("/unlink", authenticateToken, musicController.unlinkSpotifyAccount);

module.exports = router;