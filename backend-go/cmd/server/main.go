// Command server is the Statvio backend HTTP service entrypoint.
package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"statvio/backend/internal/auth"
	"statvio/backend/internal/config"
	"statvio/backend/internal/db"
	"statvio/backend/internal/logging"
	"statvio/backend/internal/repository"
	"statvio/backend/internal/server"
	"statvio/backend/internal/services/account"
	"statvio/backend/internal/services/billing"
	"statvio/backend/internal/services/media"
	"statvio/backend/internal/services/music"
	"statvio/backend/internal/services/openai"
	"statvio/backend/internal/services/spotify"
	"statvio/backend/internal/services/storage"
	"statvio/backend/internal/services/stripe"
)

func main() {
	cfg, err := config.Load()
	log := logging.New(cfg != nil && cfg.IsProduction())
	if err != nil {
		log.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	ctx := context.Background()

	mongo, err := db.Connect(ctx, cfg.MongoURI, log)
	if err != nil {
		log.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer mongo.Disconnect(ctx)

	tokens := auth.NewManager(cfg.JWTSecret)
	users := repository.NewUserRepository(mongo.Database)

	// Low-level integration clients.
	aiClient := openai.New(cfg.OpenAI.APIKey)
	spotifyClient := spotify.NewService(cfg.Spot)
	storageClient := storage.New(cfg.AWS)
	stripeClient := stripe.New(cfg.Stripe)

	// Domain services compose the clients with the repository and hold the
	// business logic; handlers only orchestrate.
	srv := server.New(cfg, log, tokens)
	srv.Account = account.New(users, tokens)
	srv.Music = music.New(users, spotifyClient, aiClient)
	srv.Billing = billing.New(users, stripeClient, cfg.Stripe.PriceID, log)
	srv.Media = media.New(users, storageClient, log)
	srv.AI = aiClient

	httpServer := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           srv.Router(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	// Run the server until an interrupt/terminate signal arrives.
	go func() {
		log.Info("server listening", "port", cfg.Port, "env", cfg.Env)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		log.Error("graceful shutdown failed", "error", err)
	}
}
