// Package logging configures the application's structured logger.
//
// It replaces the Node winston + daily-rotate-file setup. On Cloud Run the
// filesystem is ephemeral, so we log structured JSON to stdout and let Cloud
// Logging capture it instead of rotating files on disk.
package logging

import (
	"log/slog"
	"os"
)

// New returns a structured JSON logger. In development it logs at debug level
// with source positions; in production it logs at info level.
func New(production bool) *slog.Logger {
	level := slog.LevelDebug
	if production {
		level = slog.LevelInfo
	}

	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level:     level,
		AddSource: !production,
	})

	logger := slog.New(handler)
	slog.SetDefault(logger)
	return logger
}
