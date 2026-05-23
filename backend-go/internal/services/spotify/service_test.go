package spotify

import (
	"strings"
	"testing"

	"statvio/backend/internal/config"
)

func TestAuthorisationURL(t *testing.T) {
	s := NewService(config.SpotifyConfig{
		ClientID:    "cid",
		RedirectURI: "http://localhost:5000/callback",
		AuthURL:     "https://accounts.spotify.com",
	})
	u := s.AuthorisationURL("my-state")

	for _, want := range []string{
		"https://accounts.spotify.com/authorize?",
		"client_id=cid",
		"response_type=code",
		"state=my-state",
		"scope=",
		"user-top-read",
	} {
		if !strings.Contains(u, want) {
			t.Errorf("authorisation URL missing %q\n got: %s", want, u)
		}
	}
}

func TestFirstImage(t *testing.T) {
	if firstImage(nil) != nil {
		t.Error("expected nil for empty image slice")
	}
	if got := firstImage([]spotifyImage{{URL: "http://img"}}); got == nil || *got != "http://img" {
		t.Errorf("expected http://img, got %v", got)
	}
	if firstImage([]spotifyImage{{URL: ""}}) != nil {
		t.Error("expected nil when first image URL is empty")
	}
}
