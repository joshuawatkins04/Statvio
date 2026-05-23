package spotify

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/patrickmn/go-cache"
	"golang.org/x/sync/errgroup"

	"statvio/backend/internal/models"
)

const (
	maxRetries = 3
	retryDelay = 2 * time.Second
)

// Client is a Spotify Web API client bound to a single user's access token.
type Client struct {
	svc         *Service
	accessToken string
}

// ── Output types (JSON shapes returned to the frontend, matching the Node client) ──

type Profile struct {
	ID          string  `json:"id"`
	DisplayName string  `json:"display_name"`
	Email       string  `json:"email"`
	ImageURL    *string `json:"image_url"`
}

type Playlist struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	TrackCount int     `json:"track_count"`
	ImageURL   *string `json:"image_url"`
}

type TopSong struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	ImageURL *string `json:"image_url"`
	TrackURL string  `json:"track_url"`
}

type TopArtist struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	ImageURL  *string `json:"image_url"`
	ArtistURL string  `json:"artist_url"`
}

type HistoryItem struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Artist    *string `json:"artist"`
	PlayedAt  string  `json:"played_at"`
	ImageURL  *string `json:"image_url"`
	TrackURL  string  `json:"track_url"`
	ArtistURL string  `json:"artist_url"`
}

// Overview is the aggregated payload returned by GET /spotify/overview.
type Overview struct {
	Profile          Profile       `json:"profile"`
	Playlists        []Playlist    `json:"playlists"`
	TopSongs         []TopSong     `json:"topSongs"`
	TopArtists       []TopArtist   `json:"topArtists"`
	ListeningHistory []HistoryItem `json:"listeningHistory"`
}

// ── Spotify raw API response shapes (for decoding only) ──

type spotifyImage struct {
	URL string `json:"url"`
}
type externalURLs struct {
	Spotify string `json:"spotify"`
}
type spotifyArtist struct {
	Name         string       `json:"name"`
	ExternalURLs externalURLs `json:"external_urls"`
}

// ── Public methods ──

func (c *Client) GetProfile(ctx context.Context) (Profile, error) {
	var raw struct {
		ID          string         `json:"id"`
		DisplayName string         `json:"display_name"`
		Email       string         `json:"email"`
		Images      []spotifyImage `json:"images"`
	}
	if err := c.doGet(ctx, "/me", nil, &raw); err != nil {
		return Profile{}, err
	}
	return Profile{
		ID:          raw.ID,
		DisplayName: raw.DisplayName,
		Email:       raw.Email,
		ImageURL:    firstImage(raw.Images),
	}, nil
}

func (c *Client) GetPlaylists(ctx context.Context) ([]Playlist, error) {
	var raw struct {
		Items []struct {
			ID     string `json:"id"`
			Name   string `json:"name"`
			Tracks struct {
				Total int `json:"total"`
			} `json:"tracks"`
			Images []spotifyImage `json:"images"`
		} `json:"items"`
	}
	q := url.Values{"limit": {"50"}}
	if err := c.doGet(ctx, "/me/playlists", q, &raw); err != nil {
		return nil, err
	}
	out := make([]Playlist, 0, len(raw.Items))
	for _, it := range raw.Items {
		out = append(out, Playlist{
			ID:         it.ID,
			Name:       it.Name,
			TrackCount: it.Tracks.Total,
			ImageURL:   firstImage(it.Images),
		})
	}
	return out, nil
}

func (c *Client) GetSpecificPlaylist(ctx context.Context, playlistID string) ([]models.PlaylistTrack, error) {
	var raw struct {
		Items []struct {
			Track struct {
				Name         string          `json:"name"`
				DurationMS   int             `json:"duration_ms"`
				ExternalURLs externalURLs    `json:"external_urls"`
				Artists      []spotifyArtist `json:"artists"`
			} `json:"track"`
		} `json:"items"`
	}
	q := url.Values{
		"fields": {"items(track(name,duration_ms,external_urls(spotify),artists(name))"},
		"limit":  {"50"},
	}
	if err := c.doGet(ctx, "/playlists/"+playlistID+"/tracks", q, &raw); err != nil {
		return nil, err
	}
	out := make([]models.PlaylistTrack, 0, len(raw.Items))
	for _, it := range raw.Items {
		names := make([]string, 0, len(it.Track.Artists))
		for _, a := range it.Track.Artists {
			names = append(names, a.Name)
		}
		out = append(out, models.PlaylistTrack{
			Name:     it.Track.Name,
			Artists:  strings.Join(names, ", "),
			Duration: it.Track.DurationMS,
			TrackURL: it.Track.ExternalURLs.Spotify,
		})
	}
	return out, nil
}

func (c *Client) GetTopSongs(ctx context.Context, timeRange string) ([]TopSong, error) {
	if timeRange == "" {
		timeRange = "short_term"
	}
	var raw struct {
		Items []struct {
			ID    string `json:"id"`
			Name  string `json:"name"`
			Album struct {
				Images []spotifyImage `json:"images"`
			} `json:"album"`
			ExternalURLs externalURLs `json:"external_urls"`
		} `json:"items"`
	}
	q := url.Values{"time_range": {timeRange}, "limit": {"50"}}
	if err := c.doGet(ctx, "/me/top/tracks", q, &raw); err != nil {
		return nil, err
	}
	out := make([]TopSong, 0, len(raw.Items))
	for _, it := range raw.Items {
		out = append(out, TopSong{
			ID:       it.ID,
			Name:     it.Name,
			ImageURL: firstImage(it.Album.Images),
			TrackURL: it.ExternalURLs.Spotify,
		})
	}
	return out, nil
}

func (c *Client) GetTopArtists(ctx context.Context, timeRange string) ([]TopArtist, error) {
	if timeRange == "" {
		timeRange = "short_term"
	}
	var raw struct {
		Items []struct {
			ID           string         `json:"id"`
			Name         string         `json:"name"`
			Images       []spotifyImage `json:"images"`
			ExternalURLs externalURLs   `json:"external_urls"`
		} `json:"items"`
	}
	q := url.Values{"time_range": {timeRange}, "limit": {"50"}}
	if err := c.doGet(ctx, "/me/top/artists", q, &raw); err != nil {
		return nil, err
	}
	out := make([]TopArtist, 0, len(raw.Items))
	for _, it := range raw.Items {
		out = append(out, TopArtist{
			ID:        it.ID,
			Name:      it.Name,
			ImageURL:  firstImage(it.Images),
			ArtistURL: it.ExternalURLs.Spotify,
		})
	}
	return out, nil
}

func (c *Client) GetListeningHistory(ctx context.Context) ([]HistoryItem, error) {
	var raw struct {
		Items []struct {
			Track struct {
				ID           string          `json:"id"`
				Name         string          `json:"name"`
				Artists      []spotifyArtist `json:"artists"`
				ExternalURLs externalURLs    `json:"external_urls"`
				Album        struct {
					Images []spotifyImage `json:"images"`
				} `json:"album"`
			} `json:"track"`
			PlayedAt string `json:"played_at"`
		} `json:"items"`
	}
	q := url.Values{"limit": {"50"}}
	if err := c.doGet(ctx, "/me/player/recently-played", q, &raw); err != nil {
		return nil, err
	}
	out := make([]HistoryItem, 0, len(raw.Items))
	for _, it := range raw.Items {
		var artist *string
		var artistURL string
		if len(it.Track.Artists) > 0 {
			a := it.Track.Artists[0].Name
			artist = &a
			artistURL = it.Track.Artists[0].ExternalURLs.Spotify
		}
		out = append(out, HistoryItem{
			ID:        it.Track.ID,
			Name:      it.Track.Name,
			Artist:    artist,
			PlayedAt:  it.PlayedAt,
			ImageURL:  firstImage(it.Track.Album.Images),
			TrackURL:  it.Track.ExternalURLs.Spotify,
			ArtistURL: artistURL,
		})
	}
	return out, nil
}

// GetOverview aggregates profile, playlists, top songs/artists and history.
// Results are cached for 5 minutes per access token, matching the Node client.
func (c *Client) GetOverview(ctx context.Context) (Overview, error) {
	cacheKey := "spotify_overview_" + c.accessToken
	if cached, ok := c.svc.cache.Get(cacheKey); ok {
		return cached.(Overview), nil
	}

	var ov Overview
	g, gctx := errgroup.WithContext(ctx)
	g.Go(func() error { p, err := c.GetProfile(gctx); ov.Profile = p; return err })
	g.Go(func() error { p, err := c.GetPlaylists(gctx); ov.Playlists = p; return err })
	g.Go(func() error { t, err := c.GetTopSongs(gctx, "short_term"); ov.TopSongs = t; return err })
	g.Go(func() error { t, err := c.GetTopArtists(gctx, "short_term"); ov.TopArtists = t; return err })
	g.Go(func() error { h, err := c.GetListeningHistory(gctx); ov.ListeningHistory = h; return err })
	if err := g.Wait(); err != nil {
		return Overview{}, err
	}

	c.svc.cache.Set(cacheKey, ov, cache.DefaultExpiration)
	return ov, nil
}

// doGet performs an authenticated GET, decoding the JSON body into out. It
// retries up to maxRetries times on HTTP 429 (rate limited).
func (c *Client) doGet(ctx context.Context, path string, query url.Values, out any) error {
	endpoint := c.svc.cfg.APIURL + path
	if len(query) > 0 {
		endpoint += "?" + query.Encode()
	}

	for attempt := 0; attempt < maxRetries; attempt++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
		if err != nil {
			return err
		}
		req.Header.Set("Authorization", "Bearer "+c.accessToken)
		req.Header.Set("Content-Type", "application/json")

		resp, err := c.svc.http.Do(req)
		if err != nil {
			return err
		}

		if resp.StatusCode == http.StatusTooManyRequests {
			resp.Body.Close()
			select {
			case <-time.After(retryDelay):
			case <-ctx.Done():
				return ctx.Err()
			}
			continue
		}

		if resp.StatusCode >= 400 {
			b, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return fmt.Errorf("spotify api error (%d): %s", resp.StatusCode, string(b))
		}

		err = json.NewDecoder(resp.Body).Decode(out)
		resp.Body.Close()
		return err
	}

	return errors.New("Max retries reached for Spotify API call.")
}

func firstImage(images []spotifyImage) *string {
	if len(images) > 0 && images[0].URL != "" {
		u := images[0].URL
		return &u
	}
	return nil
}
