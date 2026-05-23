package server

import "github.com/gin-gonic/gin"

// registerMusicRoutes mounts the /api/music routes, mirroring routes/music.js.
func (s *Server) registerMusicRoutes(api *gin.RouterGroup) {
	music := api.Group("/music")
	protected := s.authRequired()

	// ── Spotify ──
	// https://developer.spotify.com/documentation/web-api

	// Public callback.
	music.GET("/spotify/callback", s.spotifyCallback)

	// Protected routes.
	music.GET("/spotify/auth", protected, s.redirectSpotifyAuth)
	music.GET("/spotify/overview", protected, s.spotifyOverview)
	music.GET("/spotify/top-songs", protected, s.spotifyTopSongs)
	music.GET("/spotify/top-artists", protected, s.spotifyTopArtists)
	music.GET("/spotify/listening-history", protected, s.spotifyListeningHistory)
	music.GET("/spotify/playlists", protected, s.spotifyPlaylists)
	music.GET("/spotify/status", protected, s.getSpotifyStatus)
	music.GET("/spotify/recommend-playlist-songs", protected, s.spotifyRecommend)
	music.GET("/spotify/analyse-playlist-stats", protected, s.spotifyPlaylistStats)

	music.POST("/spotify/unlink", protected, s.unlinkSpotifyAccount)

	// ── SoundCloud ── (ported as-is: stubbed/unimplemented in the original)
	// https://developers.soundcloud.com/docs/api/guide#authentication
	//
	// music.GET("/soundcloud/callback", protected, s.soundcloudCallback)
	// music.GET("/soundcloud/auth", protected, s.soundcloudAuth)
	// music.GET("/soundcloud/profile", protected, s.soundcloudProfile)
	// music.GET("/soundcloud/playlists", protected, s.soundcloudPlaylists)
	// music.GET("/soundcloud/recent-activity", protected, s.soundcloudRecentActivity)
	// music.POST("/soundcloud/unlink", protected, s.soundcloudUnlink)
}
