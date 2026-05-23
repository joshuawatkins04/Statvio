package openai

import (
	"testing"

	"statvio/backend/internal/models"
)

func TestFormatTracks(t *testing.T) {
	got := formatTracks([]models.PlaylistTrack{
		{Name: "Blinding Lights", Artists: "The Weeknd"},
		{Name: "Levitating", Artists: "Dua Lipa"},
	})
	want := "1. \"Blinding Lights\" - The Weeknd\n2. \"Levitating\" - Dua Lipa"
	if got != want {
		t.Errorf("formatTracks mismatch\n got: %q\nwant: %q", got, want)
	}
}

func TestFormatTracksEmpty(t *testing.T) {
	if got := formatTracks(nil); got != "" {
		t.Errorf("expected empty string for no tracks, got %q", got)
	}
}
