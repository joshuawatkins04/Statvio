package middleware

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/apierror"
)

func TestErrorHandler(t *testing.T) {
	cases := []struct {
		name     string
		err      error
		wantCode int
		wantKey  string
		wantMsg  string
	}{
		{"typed bad request", apierror.BadRequest("nope"), http.StatusBadRequest, "message", "nope"},
		{"custom key", apierror.NotFound("gone").WithKey("error"), http.StatusNotFound, "error", "gone"},
		{"generic to 500", errors.New("boom"), http.StatusInternalServerError, "message", "An unexpected server error occurred."},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			r := gin.New()
			r.Use(ErrorHandler(discardLogger()))
			r.GET("/x", func(c *gin.Context) { _ = c.Error(tc.err) })

			w := httptest.NewRecorder()
			r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/x", nil))

			if w.Code != tc.wantCode {
				t.Fatalf("code = %d, want %d", w.Code, tc.wantCode)
			}
			var body map[string]string
			if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
				t.Fatalf("invalid JSON body %q: %v", w.Body.String(), err)
			}
			if body[tc.wantKey] != tc.wantMsg {
				t.Errorf("body[%q] = %q, want %q (full body: %v)", tc.wantKey, body[tc.wantKey], tc.wantMsg, body)
			}
		})
	}
}

// A handler that writes its own response leaves the error path untouched.
func TestErrorHandlerSkipsWhenWritten(t *testing.T) {
	r := gin.New()
	r.Use(ErrorHandler(discardLogger()))
	r.GET("/x", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
		_ = c.Error(errors.New("late error"))
	})

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/x", nil))

	if w.Code != http.StatusOK {
		t.Errorf("code = %d, want 200 (written response must win)", w.Code)
	}
}
