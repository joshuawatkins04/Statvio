// Package middleware holds the cross-cutting HTTP middleware: authentication,
// CORS, security headers, rate limiting and error translation.
package middleware

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/auth"
)

// ContextUserID is the gin context key under which the authenticated user id
// is stored.
const ContextUserID = "userID"

// AuthRequired verifies a JWT taken from the Authorization header or the
// `token` query parameter (the Spotify OAuth flow uses the query form), and
// stores the user id in the context. It mirrors the Node authenticateToken
// middleware: 401 when no token is present, 403 when the token is invalid.
func AuthRequired(tokens *auth.Manager, log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := bearerToken(c.GetHeader("Authorization"))
		if token == "" {
			token = c.Query("token")
		}
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
			return
		}

		userID, err := tokens.Verify(token)
		if err != nil {
			log.Warn("token verification failed", "error", err)
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Forbidden: Invalid or expired token"})
			return
		}

		c.Set(ContextUserID, userID)
		c.Next()
	}
}

// UserID returns the authenticated user id from the context, or "" if absent.
func UserID(c *gin.Context) string {
	if v, ok := c.Get(ContextUserID); ok {
		if id, ok := v.(string); ok {
			return id
		}
	}
	return ""
}

func bearerToken(header string) string {
	if header == "" {
		return ""
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) == 2 {
		return strings.TrimSpace(parts[1])
	}
	return strings.TrimSpace(parts[0])
}
