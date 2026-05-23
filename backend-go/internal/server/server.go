// Package server wires dependencies together and builds the HTTP router.
package server

import (
	"log/slog"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/auth"
	"statvio/backend/internal/config"
	"statvio/backend/internal/middleware"
	"statvio/backend/internal/response"
	"statvio/backend/internal/services/account"
	"statvio/backend/internal/services/billing"
	"statvio/backend/internal/services/media"
	"statvio/backend/internal/services/music"
	"statvio/backend/internal/services/openai"
)

// Server holds the shared dependencies every handler needs. Handlers are thin:
// they parse the request, call into one of the domain services below, and
// render the result. The services own the business logic.
type Server struct {
	Cfg    *config.Config
	Log    *slog.Logger
	Tokens *auth.Manager // used by AuthRequired middleware and the OAuth callback

	// Domain services. Populated by main during startup.
	Account *account.Service
	Music   *music.Service
	Billing *billing.Service
	Media   *media.Service
	AI      *openai.Client // the OpenAI client is itself the AI service
}

// New constructs a Server from its core dependencies. Domain services are
// attached afterwards via the exported fields.
func New(cfg *config.Config, log *slog.Logger, tokens *auth.Manager) *Server {
	return &Server{Cfg: cfg, Log: log, Tokens: tokens}
}

// Router builds the gin engine with all middleware and routes registered.
func (s *Server) Router() *gin.Engine {
	if s.Cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Trust the platform proxy (Cloud Run / load balancer) so c.ClientIP()
	// reflects the real client via X-Forwarded-For.
	_ = r.SetTrustedProxies([]string{"0.0.0.0/0", "::/0"})
	r.ForwardedByClientIP = true

	// Middleware order mirrors the Node configureMiddleware chain:
	// recovery → error translation → security headers → CORS → (body parsing
	// is implicit in gin) → global rate limit → routes.
	r.Use(gin.Recovery())
	r.Use(middleware.ErrorHandler(s.Log))
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.CORS(s.Cfg.AllowedOrigins, s.Cfg.IsProduction()))

	r.GET("/healthz", func(c *gin.Context) {
		response.OK(c, gin.H{"status": "ok"})
	})

	// Routes are registered per feature in register_*.go as phases land.
	api := r.Group("/api")
	api.Use(s.globalLimiter())
	s.registerAuthRoutes(api)
	s.registerMusicRoutes(api)
	s.registerAIRoutes(api)
	s.registerAWSRoutes(api)
	s.registerStripeRoutes(api)

	return r
}
