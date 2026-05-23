package server

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/middleware"
	"statvio/backend/internal/repository"
	"statvio/backend/internal/response"
)

// ── Data endpoints ──

func (s *Server) spotifyPlaylists(c *gin.Context) {
	playlists, err := s.Music.Playlists(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"playlists": playlists})
}

func (s *Server) spotifyTopSongs(c *gin.Context) {
	songs, err := s.Music.TopSongs(c.Request.Context(), middleware.UserID(c), c.Query("time_range"))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"topSongs": songs})
}

func (s *Server) spotifyTopArtists(c *gin.Context) {
	artists, err := s.Music.TopArtists(c.Request.Context(), middleware.UserID(c), c.Query("time_range"))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"topArtists": artists})
}

func (s *Server) spotifyListeningHistory(c *gin.Context) {
	history, err := s.Music.ListeningHistory(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"listeningHistory": history})
}

func (s *Server) spotifyOverview(c *gin.Context) {
	overview, err := s.Music.Overview(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, overview)
}

func (s *Server) spotifyRecommend(c *gin.Context) {
	resp, err := s.Music.Recommend(c.Request.Context(), middleware.UserID(c), c.Query("playlist_id"))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"response": resp})
}

func (s *Server) spotifyPlaylistStats(c *gin.Context) {
	resp, err := s.Music.PlaylistStats(c.Request.Context(), middleware.UserID(c), c.Query("playlist_id"))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"response": resp})
}

// ── OAuth + account endpoints ──

// redirectSpotifyAuth handles GET /api/music/spotify/auth.
func (s *Server) redirectSpotifyAuth(c *gin.Context) {
	if middleware.UserID(c) == "" {
		response.Text(c, http.StatusUnauthorized, "User must be logged in to connect Spotify.")
		return
	}
	// The raw JWT is embedded as OAuth state so the callback can identify the user.
	jwtToken := c.Query("token")
	if jwtToken == "" {
		jwtToken = bearerFromHeader(c.GetHeader("Authorization"))
	}
	response.Redirect(c, s.Music.AuthorisationURL(jwtToken))
}

// spotifyCallback handles GET /api/music/spotify/callback (public). Its
// responses are browser-facing (text and a redirect), so it does not use the
// JSON error path.
func (s *Server) spotifyCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		response.Text(c, http.StatusBadRequest, "Authorisation code not found.")
		return
	}
	state := c.Query("state")
	if state == "" {
		response.Text(c, http.StatusUnauthorized, "Missing JWT token in state parameter.")
		return
	}

	userID, err := s.Tokens.Verify(state)
	if err != nil {
		response.Text(c, http.StatusUnauthorized, "User not authenticated.")
		return
	}

	err = s.Music.LinkSpotify(c.Request.Context(), userID, code)
	if errors.Is(err, repository.ErrNotFound) {
		response.Text(c, http.StatusNotFound, "User not found.")
		return
	}
	if err != nil {
		s.Log.Error("spotify callback failed", "error", err)
		response.Text(c, http.StatusInternalServerError, "Authentication error")
		return
	}

	response.Redirect(c, s.Cfg.FrontendSpotifyURL)
}

// getSpotifyStatus handles GET /api/music/spotify/status.
func (s *Server) getSpotifyStatus(c *gin.Context) {
	linked, err := s.Music.Status(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"linked": linked})
}

// unlinkSpotifyAccount handles POST /api/music/spotify/unlink.
func (s *Server) unlinkSpotifyAccount(c *gin.Context) {
	if err := s.Music.Unlink(c.Request.Context(), middleware.UserID(c)); err != nil {
		response.Error(c, err)
		return
	}
	response.Message(c, http.StatusOK, "Spotify account unlinked successfully.")
}

func bearerFromHeader(header string) string {
	const prefix = "Bearer "
	if len(header) > len(prefix) && header[:len(prefix)] == prefix {
		return header[len(prefix):]
	}
	return ""
}
