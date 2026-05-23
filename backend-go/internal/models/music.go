package models

// PlaylistTrack is a normalized track from a music provider. It is the input to
// the AI recommendation/analysis prompts and the shape returned by the Spotify
// playlist endpoints.
type PlaylistTrack struct {
	Name     string `json:"name"`
	Artists  string `json:"artists"`
	Duration int    `json:"duration"`
	TrackURL string `json:"track_url"`
}
