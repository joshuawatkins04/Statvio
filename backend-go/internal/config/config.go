// Package config loads and validates all runtime configuration from the
// environment. It fails fast at boot if a required value is missing so the
// service never starts in a half-configured state.
package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds every piece of runtime configuration the service needs.
type Config struct {
	Env     string // "production" | "development"
	Port    string // HTTP listen port ($PORT on Cloud Run)
	BaseURL string // public base URL of this API (used for Stripe/redirect URLs)

	MongoURI  string
	JWTSecret string

	// CORS allow-list. Defaults to the production origins if unset.
	AllowedOrigins []string

	// Frontend redirect target after a successful Spotify link.
	FrontendSpotifyURL string

	AWS    AWSConfig
	OpenAI OpenAIConfig
	Spot   SpotifyConfig
	Stripe StripeConfig
}

type AWSConfig struct {
	AccessKeyID     string
	SecretAccessKey string
	Region          string
	BucketName      string
}

type OpenAIConfig struct {
	APIKey string
}

type SpotifyConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	AuthURL      string // e.g. https://accounts.spotify.com
	APIURL       string // e.g. https://api.spotify.com/v1
}

type StripeConfig struct {
	SecretKey     string
	WebhookSecret string
	PriceID       string
	SuccessURL    string
	CancelURL     string
}

// IsProduction reports whether the service is running in production mode.
func (c *Config) IsProduction() bool { return c.Env == "production" }

// Load reads configuration from the process environment (and a .env file if
// present), validates required values, and returns the populated Config.
func Load() (*Config, error) {
	// A missing .env is fine in production where vars come from the platform.
	_ = godotenv.Load()

	cfg := &Config{
		Env:                getEnv("NODE_ENV", "development"),
		Port:               getEnv("PORT", "5000"),
		BaseURL:            os.Getenv("BASE_URL"),
		MongoURI:           os.Getenv("MONGO_URI"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		FrontendSpotifyURL: os.Getenv("FRONTEND_SPOTIFY_URL"),
		AllowedOrigins:     parseOrigins(os.Getenv("ALLOWED_ORIGINS")),
		AWS: AWSConfig{
			AccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
			Region:          os.Getenv("AWS_REGION"),
			BucketName:      os.Getenv("S3_BUCKET_NAME"),
		},
		OpenAI: OpenAIConfig{
			APIKey: os.Getenv("OPENAI_API_KEY"),
		},
		Spot: SpotifyConfig{
			ClientID:     os.Getenv("SPOTIFY_CLIENT_ID"),
			ClientSecret: os.Getenv("SPOTIFY_CLIENT_SECRET"),
			RedirectURI:  os.Getenv("SPOTIFY_REDIRECT_URI"),
			AuthURL:      getEnv("SPOTIFY_AUTH_URL", "https://accounts.spotify.com"),
			APIURL:       getEnv("SPOTIFY_API_URL", "https://api.spotify.com/v1"),
		},
		Stripe: StripeConfig{
			SecretKey:     os.Getenv("STRIPE_SECRET_KEY"),
			WebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
			PriceID:       os.Getenv("STRIPE_PRICE_ID"),
			SuccessURL:    os.Getenv("STRIPE_SUCCESS_URL"),
			CancelURL:     os.Getenv("STRIPE_CANCEL_URL"),
		},
	}

	if len(cfg.AllowedOrigins) == 0 {
		cfg.AllowedOrigins = []string{
			"https://www.statvio.com",
			"https://statvio.com",
		}
	}

	// Only the values required to boot safely are hard requirements. Missing
	// integration keys (Spotify/Stripe/AWS/OpenAI) fail at first use instead,
	// so the service can still run for the features that are configured.
	var missing []string
	if cfg.MongoURI == "" {
		missing = append(missing, "MONGO_URI")
	}
	if cfg.JWTSecret == "" {
		missing = append(missing, "JWT_SECRET")
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required environment variables: %s", strings.Join(missing, ", "))
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func parseOrigins(raw string) []string {
	if raw == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}
