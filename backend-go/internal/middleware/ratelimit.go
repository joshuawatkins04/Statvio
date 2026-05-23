package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// fixedWindowLimiter is a per-IP fixed-window counter, matching the semantics
// of express-rate-limit. State is in-memory and therefore per-instance; this is
// acceptable while the service runs with --max-instances=1 (see the migration
// plan, §7.4).
type fixedWindowLimiter struct {
	mu        sync.Mutex
	hits      map[string]*windowCount
	window    time.Duration
	max       int
	skip      func(*gin.Context) bool
	lastSwept time.Time
}

type windowCount struct {
	count int
	reset time.Time
}

// RateLimitConfig configures a limiter instance.
type RateLimitConfig struct {
	Window time.Duration
	Max    int
	// Skip returns true to bypass the limiter for a given request.
	Skip func(*gin.Context) bool
}

// NewRateLimiter builds a gin middleware enforcing the given fixed-window limit.
func NewRateLimiter(cfg RateLimitConfig) gin.HandlerFunc {
	l := &fixedWindowLimiter{
		hits:      make(map[string]*windowCount),
		window:    cfg.Window,
		max:       cfg.Max,
		skip:      cfg.Skip,
		lastSwept: time.Now(),
	}
	return l.handle
}

func (l *fixedWindowLimiter) handle(c *gin.Context) {
	if l.skip != nil && l.skip(c) {
		c.Next()
		return
	}

	ip := c.ClientIP()
	now := time.Now()

	l.mu.Lock()
	l.sweep(now)
	wc, ok := l.hits[ip]
	if !ok || now.After(wc.reset) {
		wc = &windowCount{count: 0, reset: now.Add(l.window)}
		l.hits[ip] = wc
	}
	wc.count++
	count := wc.count
	remaining := l.max - count
	reset := wc.reset
	l.mu.Unlock()

	if remaining < 0 {
		remaining = 0
	}
	c.Header("RateLimit-Limit", itoa(l.max))
	c.Header("RateLimit-Remaining", itoa(remaining))
	c.Header("RateLimit-Reset", itoa(int(time.Until(reset).Seconds())))

	if count > l.max {
		c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
			"message": "Too many requests, please try again later.",
		})
		return
	}
	c.Next()
}

// sweep periodically drops expired entries so the map doesn't grow unbounded.
// Caller must hold the lock.
func (l *fixedWindowLimiter) sweep(now time.Time) {
	if now.Sub(l.lastSwept) < l.window {
		return
	}
	for ip, wc := range l.hits {
		if now.After(wc.reset) {
			delete(l.hits, ip)
		}
	}
	l.lastSwept = now
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}

// SkipPathSuffixesOrOptions skips OPTIONS requests and any request whose path
// ends with one of the given suffixes. This honours the original intent of
// excluding the auth endpoints from the global limiter (they have their own
// stricter limiters), which the Node code attempted but matched incorrectly.
func SkipPathSuffixesOrOptions(suffixes ...string) func(*gin.Context) bool {
	return func(c *gin.Context) bool {
		if c.Request.Method == http.MethodOptions {
			return true
		}
		p := c.Request.URL.Path
		for _, suf := range suffixes {
			if hasSuffix(p, suf) {
				return true
			}
		}
		return false
	}
}

// SkipOptions skips only OPTIONS preflight requests.
func SkipOptions() func(*gin.Context) bool {
	return func(c *gin.Context) bool {
		return c.Request.Method == http.MethodOptions
	}
}

func hasSuffix(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}
