const express = require("express");
const soundcloudController = require("../controllers/soundcloud");
const spotifyController = require("../controllers/spotify");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

/* Spotify routes */
// https://developer.spotify.com/documentation/web-api

// Public routes
router.get("/spotify/callback", spotifyController.spotifyCallback);

// Protected routes
router.get("/spotify/auth", authenticateToken, spotifyController.redirectSpotifyAuth);
router.get("/spotify/overview", authenticateToken, spotifyController.getSpotifyOverview);
router.get("/spotify/top-songs", authenticateToken, spotifyController.getSpotifyTopSongs);
router.get("/spotify/top-artists", authenticateToken, spotifyController.getSpotifyTopArtists);
router.get("/spotify/listening-history", authenticateToken, spotifyController.getSpotifyListeningHistory);
router.get("/spotify/playlists", authenticateToken, spotifyController.getSpotifyPlaylists);
router.get("/spotify/status", authenticateToken, spotifyController.getSpotifyStatus);
router.get("/spotify/analyse-playlist", authenticateToken, spotifyController.getSpotifySpecificPlaylist);

router.post("/spotify/unlink", authenticateToken, spotifyController.unlinkSpotifyAccount);

/* Soundcloud routes */
// https://developers.soundcloud.com/docs/api/guide#authentication

/*
router.get("/soundcloud/callback", soundcloudController.); // https://secure.soundcloud.com/oauth/token

router.get("/soundcloud/auth", authenticateToken, soundcloudController.); // https://secure.soundcloud.com/authorize
router.get("/soundcloud/profile", authenticateToken, soundcloudController.); // /me
router.get("/soundcloud/playlists", authenticateToken, soundcloudController.) // /me/playlists
router.get("/soundcloud/recent-activity", authenticateToken, soundcloudController.); // /me/activities/all/own
router.post("/soundcloud/unlink", authenticateToken, soundcloudController.); // https://secure.soundcloud.com/sign-out 
*/

module.exports = router;
