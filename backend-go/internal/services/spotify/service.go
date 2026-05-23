// Package spotify implements the Spotify OAuth2 authorization-code flow and a
// Web API client, porting services/spotify from the Node backend.
package spotify

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/patrickmn/go-cache"

	"statvio/backend/internal/config"
)

// authScopes are the OAuth scopes requested, matching the Node SpotifyAuth.
var authScopes = []string{
	"user-read-private",
	"user-read-email",
	"playlist-read-private",
	"playlist-read-collaborative",
	"user-top-read",
	"user-read-recently-played",
}

// Tokens is the result of a token exchange or refresh.
type Tokens struct {
	AccessToken  string
	RefreshToken string
	ExpiresIn    int
}

// Service holds Spotify configuration and shared resources (HTTP client and the
// in-memory overview cache).
type Service struct {
	cfg   config.SpotifyConfig
	http  *http.Client
	cache *cache.Cache
}

// NewService constructs a Spotify service. The cache mirrors the Node
// node-cache stdTTL of 300 seconds.
func NewService(cfg config.SpotifyConfig) *Service {
	return &Service{
		cfg:   cfg,
		http:  &http.Client{Timeout: 15 * time.Second},
		cache: cache.New(5*time.Minute, 10*time.Minute),
	}
}

// AuthorisationURL builds the Spotify authorize URL, embedding the given state
// (the caller passes the user's JWT so the callback can identify them).
func (s *Service) AuthorisationURL(state string) string {
	params := url.Values{}
	params.Set("client_id", s.cfg.ClientID)
	params.Set("response_type", "code")
	params.Set("redirect_uri", s.cfg.RedirectURI)
	params.Set("scope", strings.Join(authScopes, " "))
	if state != "" {
		params.Set("state", state)
	}
	return s.cfg.AuthURL + "/authorize?" + params.Encode()
}

// ExchangeCode swaps an authorization code for access/refresh tokens.
func (s *Service) ExchangeCode(ctx context.Context, code string) (Tokens, error) {
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", s.cfg.RedirectURI)
	return s.tokenRequest(ctx, form)
}

// RefreshToken obtains a fresh access token from a refresh token.
func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (Tokens, error) {
	form := url.Values{}
	form.Set("grant_type", "refresh_token")
	form.Set("refresh_token", refreshToken)
	t, err := s.tokenRequest(ctx, form)
	if err != nil {
		return Tokens{}, err
	}
	// Spotify may omit a new refresh token; keep the existing one.
	if t.RefreshToken == "" {
		t.RefreshToken = refreshToken
	}
	return t, nil
}

func (s *Service) tokenRequest(ctx context.Context, form url.Values) (Tokens, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.cfg.AuthURL+"/api/token", strings.NewReader(form.Encode()))
	if err != nil {
		return Tokens{}, err
	}
	basic := base64.StdEncoding.EncodeToString([]byte(s.cfg.ClientID + ":" + s.cfg.ClientSecret))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Authorization", "Basic "+basic)

	resp, err := s.http.Do(req)
	if err != nil {
		return Tokens{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return Tokens{}, fmt.Errorf("spotify token request failed (%d): %s", resp.StatusCode, string(b))
	}

	var payload struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return Tokens{}, err
	}
	return Tokens{
		AccessToken:  payload.AccessToken,
		RefreshToken: payload.RefreshToken,
		ExpiresIn:    payload.ExpiresIn,
	}, nil
}

// NewClient returns a Web API client bound to a user's access token.
func (s *Service) NewClient(accessToken string) *Client {
	return &Client{svc: s, accessToken: accessToken}
}
