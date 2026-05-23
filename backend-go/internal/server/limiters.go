package server

import (
	"time"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/middleware"
)

// authRequired is the JWT-verifying middleware applied to protected routes.
func (s *Server) authRequired() gin.HandlerFunc {
	return middleware.AuthRequired(s.Tokens, s.Log)
}

// globalLimiter: 100 requests / 15 min, applied to all /api routes. Skips
// OPTIONS and the auth endpoints (which carry their own stricter limiters).
func (s *Server) globalLimiter() gin.HandlerFunc {
	return middleware.NewRateLimiter(middleware.RateLimitConfig{
		Window: 15 * time.Minute,
		Max:    100,
		Skip:   middleware.SkipPathSuffixesOrOptions("/login", "/signup", "/verify", "/stripe/webhook"),
	})
}

// authLimiter: 5 requests / 10 min, for signup and login.
func (s *Server) authLimiter() gin.HandlerFunc {
	return middleware.NewRateLimiter(middleware.RateLimitConfig{
		Window: 10 * time.Minute,
		Max:    5,
		Skip:   middleware.SkipOptions(),
	})
}

// verifyLimiter: 10 requests / 10 min, for the token verify endpoint.
func (s *Server) verifyLimiter() gin.HandlerFunc {
	return middleware.NewRateLimiter(middleware.RateLimitConfig{
		Window: 10 * time.Minute,
		Max:    10,
		Skip:   middleware.SkipOptions(),
	})
}
