package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORS reproduces the original Express CORS behaviour:
//   - requests from an allow-listed origin are permitted with credentials
//   - requests with no Origin header are allowed when they target /api
//     (internal/server-to-server calls) or in development
//   - any other origin is rejected with 403
//   - OPTIONS preflight requests are answered with 200
func CORS(allowedOrigins []string, isProduction bool) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	for _, o := range allowedOrigins {
		allowed[o] = struct{}{}
	}

	const (
		methods = "GET, POST, PUT, DELETE, OPTIONS"
		headers = "Content-Type, Authorization, withCredentials"
	)

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		setCommon := func() {
			c.Header("Access-Control-Allow-Methods", methods)
			c.Header("Access-Control-Allow-Headers", headers)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Vary", "Origin")
		}

		switch {
		case origin == "":
			// No Origin header. Allow in dev, or for internal /api calls.
			if isProduction && !strings.HasPrefix(c.Request.URL.Path, "/api") {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Not allowed by CORS"})
				return
			}
			setCommon()
		default:
			if _, ok := allowed[origin]; !ok {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Not allowed by CORS"})
				return
			}
			c.Header("Access-Control-Allow-Origin", origin)
			setCommon()
		}

		// Answer preflight immediately.
		if c.Request.Method == http.MethodOptions {
			if origin != "" {
				c.Header("Access-Control-Allow-Origin", origin)
			} else {
				c.Header("Access-Control-Allow-Origin", "*")
			}
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	}
}
