package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// This file ports the ipBan and botFilter middleware from the Node service.
// Both were commented out / disabled in the original `configureMiddleware`, so
// they are provided here but NOT wired into the router. Enable them in
// server.Router() if/when desired.

// BotFilter blocks obvious scanner/bot traffic by user-agent. Ported disabled.
func BotFilter() gin.HandlerFunc {
	allowedBots := []string{"Googlebot", "Bingbot", "DuckDuckBot", "BaiduSpider", "YandexBot"}
	return func(c *gin.Context) {
		ua := c.GetHeader("User-Agent")
		scannedBy := c.GetHeader("X-Scanned-By")

		isAllowed := false
		for _, b := range allowedBots {
			if strings.Contains(ua, b) {
				isAllowed = true
				break
			}
		}
		blocked := strings.Contains(scannedBy, "RecordedFuture") ||
			(!isAllowed && strings.Contains(strings.ToLower(ua), "bot"))

		if blocked {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Forbidden: Bot traffic detected"})
			return
		}
		c.Next()
	}
}

// IPBan bans IPs that repeatedly hit disallowed paths. Ported disabled.
// In-memory state, per-instance (see migration plan §7.4).
func IPBan() gin.HandlerFunc {
	const (
		banDuration         = 24 * time.Hour
		suspiciousWindow    = 5 * time.Minute
		suspiciousThreshold = 3
	)
	allowedPaths := []string{"/", "/api", "/favicon.ico", "/robots.txt", "/manifest.json", "/static", "/assets"}

	var mu sync.Mutex
	banned := make(map[string]time.Time)
	suspicious := make(map[string][]time.Time)

	pathAllowed := func(p string) bool {
		for _, a := range allowedPaths {
			if strings.HasPrefix(p, a) {
				return true
			}
		}
		return false
	}

	return func(c *gin.Context) {
		ip := c.ClientIP()
		path := c.Request.URL.Path
		now := time.Now()

		mu.Lock()
		defer mu.Unlock()

		if exp, ok := banned[ip]; ok {
			if now.Before(exp) {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
				return
			}
			delete(banned, ip)
		}

		if !pathAllowed(path) {
			ts := suspicious[ip]
			kept := ts[:0]
			for _, t := range ts {
				if now.Sub(t) < suspiciousWindow {
					kept = append(kept, t)
				}
			}
			kept = append(kept, now)
			suspicious[ip] = kept

			if len(kept) >= suspiciousThreshold {
				banned[ip] = now.Add(banDuration)
				delete(suspicious, ip)
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
				return
			}
		}

		c.Next()
	}
}
