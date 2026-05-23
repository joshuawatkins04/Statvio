// Package music owns the Spotify integration business logic: resolving a usable
// API client for a user (refreshing expired tokens), the data-fetch flows, the
// AI-backed recommendation and analysis flows, and the link/status/unlink
// account workflows. It composes the low-level Spotify and OpenAI clients with
// the user repository so handlers stay free of this orchestration.
package music

import (
	"context"
	"errors"
	"slices"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	"statvio/backend/internal/apierror"
	"statvio/backend/internal/repository"
	"statvio/backend/internal/services/openai"
	"statvio/backend/internal/services/spotify"
)

// Service orchestrates Spotify data and account operations for a user.
type Service struct {
	users   *repository.UserRepository
	spotify *spotify.Service
	ai      *openai.Client
}

// New builds the music service from its dependencies.
func New(users *repository.UserRepository, sp *spotify.Service, ai *openai.Client) *Service {
	return &Service{users: users, spotify: sp, ai: ai}
}

// errRelink is returned when the user has no usable Spotify link, surfaced to
// the client as a 401 prompting them to (re-)link their account.
func errRelink() *apierror.Error {
	return apierror.Unauthorized("Authentication required. Please link your Spotify account.")
}

// clientForUser loads the user's Spotify tokens, refreshing and persisting them
// if expired, and returns an API client. Ports the Node refreshSpotifySession.
func (s *Service) clientForUser(ctx context.Context, userID string) (*spotify.Client, error) {
	user, err := s.users.FindByID(ctx, userID)
	if errors.Is(err, repository.ErrNotFound) || (err == nil && !user.Spotify.Linked) {
		return nil, errRelink()
	}
	if err != nil {
		return nil, err
	}

	accessToken := user.Spotify.AccessToken
	refreshToken := user.Spotify.RefreshToken
	if accessToken == "" || refreshToken == "" {
		return nil, errors.New("spotify tokens missing for user " + userID)
	}

	expired := user.Spotify.TokenExpiresAt != nil && time.Now().After(*user.Spotify.TokenExpiresAt)
	if expired {
		toks, err := s.spotify.RefreshToken(ctx, refreshToken)
		if err != nil {
			return nil, err
		}
		accessToken = toks.AccessToken
		expiresAt := time.Now().Add(time.Duration(toks.ExpiresIn) * time.Second)
		_ = s.users.UpdateByID(ctx, userID, bson.M{
			"spotify.accessToken":    toks.AccessToken,
			"spotify.refreshToken":   toks.RefreshToken,
			"spotify.tokenExpiresAt": expiresAt,
		})
	}

	return s.spotify.NewClient(accessToken), nil
}

// ── Data flows ──

// Playlists returns the user's playlists.
func (s *Service) Playlists(ctx context.Context, userID string) ([]spotify.Playlist, error) {
	client, err := s.clientForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	return client.GetPlaylists(ctx)
}

// TopSongs returns the user's top songs for the given time range.
func (s *Service) TopSongs(ctx context.Context, userID, timeRange string) ([]spotify.TopSong, error) {
	client, err := s.clientForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	return client.GetTopSongs(ctx, timeRange)
}

// TopArtists returns the user's top artists for the given time range.
func (s *Service) TopArtists(ctx context.Context, userID, timeRange string) ([]spotify.TopArtist, error) {
	client, err := s.clientForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	return client.GetTopArtists(ctx, timeRange)
}

// ListeningHistory returns the user's recently played tracks.
func (s *Service) ListeningHistory(ctx context.Context, userID string) ([]spotify.HistoryItem, error) {
	client, err := s.clientForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	return client.GetListeningHistory(ctx)
}

// Overview returns the aggregated profile/playlists/top/history payload.
func (s *Service) Overview(ctx context.Context, userID string) (spotify.Overview, error) {
	client, err := s.clientForUser(ctx, userID)
	if err != nil {
		return spotify.Overview{}, err
	}
	return client.GetOverview(ctx)
}

// Recommend fetches a playlist's tracks and returns AI song recommendations.
func (s *Service) Recommend(ctx context.Context, userID, playlistID string) (string, error) {
	client, err := s.clientForUser(ctx, userID)
	if err != nil {
		return "", err
	}
	tracks, err := client.GetSpecificPlaylist(ctx, playlistID)
	if err != nil {
		return "", err
	}
	return s.ai.Recommend(ctx, tracks)
}

// PlaylistStats fetches a playlist's tracks and returns an AI statistics
// summary.
func (s *Service) PlaylistStats(ctx context.Context, userID, playlistID string) (string, error) {
	client, err := s.clientForUser(ctx, userID)
	if err != nil {
		return "", err
	}
	tracks, err := client.GetSpecificPlaylist(ctx, playlistID)
	if err != nil {
		return "", err
	}
	return s.ai.Analyse(ctx, tracks)
}

// ── Account flows ──

// AuthorisationURL builds the Spotify authorize URL, embedding the given state
// (the caller passes the user's JWT so the callback can identify them).
func (s *Service) AuthorisationURL(state string) string {
	return s.spotify.AuthorisationURL(state)
}

// LinkSpotify exchanges an OAuth authorization code for tokens and persists the
// Spotify link on the user. Returns repository.ErrNotFound if the user is gone.
func (s *Service) LinkSpotify(ctx context.Context, userID, code string) error {
	toks, err := s.spotify.ExchangeCode(ctx, code)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	expiresAt := now.Add(time.Duration(toks.ExpiresIn) * time.Second)
	return s.users.UpdateByID(ctx, userID, bson.M{
		"spotify": bson.M{
			"linked":         true,
			"accessToken":    toks.AccessToken,
			"refreshToken":   toks.RefreshToken,
			"tokenExpiresAt": expiresAt,
			"lastSyncedAt":   now,
		},
	})
}

// Status reports whether the user's Spotify account is linked, recording it in
// the user's linked-APIs list the first time it is seen as linked.
func (s *Service) Status(ctx context.Context, userID string) (bool, error) {
	user, err := s.users.FindByID(ctx, userID)
	if errors.Is(err, repository.ErrNotFound) {
		return false, apierror.NotFound("User not found.")
	}
	if err != nil {
		return false, err
	}

	linked := user.Spotify.Linked
	if linked && !slices.Contains(user.APIsLinked, "Spotify") {
		updated := append(user.APIsLinked, "Spotify")
		_ = s.users.UpdateByID(ctx, userID, bson.M{"apisLinked": updated, "apiCount": len(updated)})
	}
	return linked, nil
}

// Unlink clears the user's Spotify tokens and removes Spotify from their linked
// APIs list.
func (s *Service) Unlink(ctx context.Context, userID string) error {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return err
	}

	remaining := make([]string, 0, len(user.APIsLinked))
	for _, a := range user.APIsLinked {
		if a != "Spotify" {
			remaining = append(remaining, a)
		}
	}
	return s.users.UpdateByID(ctx, userID, bson.M{
		"spotify.accessToken":  nil,
		"spotify.refreshToken": nil,
		"spotify.linked":       false,
		"apisLinked":           remaining,
		"apiCount":             len(remaining),
	})
}
