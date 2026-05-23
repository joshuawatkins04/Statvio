package middleware

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/auth"
)

func init() { gin.SetMode(gin.TestMode) }

func discardLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

func TestAuthRequired(t *testing.T) {
	m := auth.NewManager("test-secret")
	tok, _ := m.Sign("u1")

	r := gin.New()
	r.Use(AuthRequired(m, discardLogger()))
	r.GET("/x", func(c *gin.Context) { c.String(http.StatusOK, UserID(c)) })

	do := func(setup func(*http.Request)) *httptest.ResponseRecorder {
		w := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/x", nil)
		setup(req)
		r.ServeHTTP(w, req)
		return w
	}

	if w := do(func(req *http.Request) { req.Header.Set("Authorization", "Bearer "+tok) }); w.Code != 200 || w.Body.String() != "u1" {
		t.Errorf("header auth: code=%d body=%q", w.Code, w.Body.String())
	}
	if w := do(func(req *http.Request) { req.URL.RawQuery = "token=" + tok }); w.Code != 200 {
		t.Errorf("query auth: code=%d", w.Code)
	}
	if w := do(func(*http.Request) {}); w.Code != 401 {
		t.Errorf("missing token: want 401 got %d", w.Code)
	}
	if w := do(func(req *http.Request) { req.Header.Set("Authorization", "Bearer garbage") }); w.Code != 403 {
		t.Errorf("invalid token: want 403 got %d", w.Code)
	}
}

func TestRateLimiter(t *testing.T) {
	r := gin.New()
	r.Use(NewRateLimiter(RateLimitConfig{Window: time.Minute, Max: 2}))
	r.GET("/x", func(c *gin.Context) { c.Status(http.StatusOK) })

	send := func() int {
		w := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/x", nil)
		req.RemoteAddr = "1.2.3.4:5678"
		r.ServeHTTP(w, req)
		return w.Code
	}

	first, second := send(), send()
	if first != 200 || second != 200 {
		t.Errorf("first two requests should be allowed, got %d and %d", first, second)
	}
	if code := send(); code != 429 {
		t.Errorf("third request should be limited, got %d", code)
	}
}

func TestCORS(t *testing.T) {
	r := gin.New()
	r.Use(CORS([]string{"https://statvio.com"}, true))
	r.GET("/api/x", func(c *gin.Context) { c.Status(http.StatusOK) })

	// Allowed origin echoes back in the ACAO header.
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/x", nil)
	req.Header.Set("Origin", "https://statvio.com")
	r.ServeHTTP(w, req)
	if w.Code != 200 || w.Header().Get("Access-Control-Allow-Origin") != "https://statvio.com" {
		t.Errorf("allowed origin: code=%d acao=%q", w.Code, w.Header().Get("Access-Control-Allow-Origin"))
	}

	// Disallowed origin is rejected.
	w = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/x", nil)
	req.Header.Set("Origin", "https://evil.com")
	r.ServeHTTP(w, req)
	if w.Code != 403 {
		t.Errorf("blocked origin: want 403 got %d", w.Code)
	}

	// Preflight is answered with 200.
	w = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodOptions, "/api/x", nil)
	req.Header.Set("Origin", "https://statvio.com")
	r.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Errorf("preflight: want 200 got %d", w.Code)
	}

	// No Origin header on an /api path is allowed (internal calls).
	w = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/x", nil)
	r.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Errorf("no-origin /api: want 200 got %d", w.Code)
	}
}

func TestSecurityHeaders(t *testing.T) {
	r := gin.New()
	r.Use(SecurityHeaders())
	r.GET("/x", func(c *gin.Context) { c.Status(http.StatusOK) })

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/x", nil))
	if got := w.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Errorf("X-Content-Type-Options: want nosniff got %q", got)
	}
}
