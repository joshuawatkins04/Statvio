package apierror

import (
	"errors"
	"fmt"
	"net/http"
	"testing"

	"go.mongodb.org/mongo-driver/mongo"

	"statvio/backend/internal/repository"
)

func TestConstructorsSetStatus(t *testing.T) {
	cases := []struct {
		err  *Error
		want int
	}{
		{BadRequest("x"), http.StatusBadRequest},
		{Unauthorized("x"), http.StatusUnauthorized},
		{Forbidden("x"), http.StatusForbidden},
		{NotFound("x"), http.StatusNotFound},
		{Conflict("x"), http.StatusConflict},
		{PaymentRequired("x"), http.StatusPaymentRequired},
		{Internal(errors.New("x")), http.StatusInternalServerError},
		{Wrap("x", errors.New("y")), http.StatusInternalServerError},
	}
	for _, c := range cases {
		if c.err.Status != c.want {
			t.Errorf("status = %d, want %d", c.err.Status, c.want)
		}
	}
}

func TestResponseKey(t *testing.T) {
	if got := BadRequest("x").ResponseKey(); got != "message" {
		t.Errorf("default key = %q, want message", got)
	}
	if got := BadRequest("x").WithKey("error").ResponseKey(); got != "error" {
		t.Errorf("overridden key = %q, want error", got)
	}
}

func TestFromPassthrough(t *testing.T) {
	orig := NotFound("nope")
	if got := From(orig); got != orig {
		t.Errorf("From should return the same *Error instance")
	}
	// Also when wrapped.
	wrapped := fmt.Errorf("context: %w", orig)
	if got := From(wrapped); got != orig {
		t.Errorf("From should unwrap to the embedded *Error")
	}
}

func TestFromNil(t *testing.T) {
	if From(nil) != nil {
		t.Errorf("From(nil) should be nil")
	}
}

func TestFromNotFound(t *testing.T) {
	got := From(repository.ErrNotFound)
	if got.Status != http.StatusNotFound || got.Message != "User not found." {
		t.Errorf("got status=%d msg=%q", got.Status, got.Message)
	}
	// errors.Is still works through the wrapped cause.
	if !errors.Is(got, repository.ErrNotFound) {
		t.Errorf("From(ErrNotFound) should retain the cause")
	}
}

func TestFromDuplicateKey(t *testing.T) {
	dup := mongo.WriteException{
		WriteErrors: mongo.WriteErrors{{Code: 11000, Message: "dup"}},
	}
	got := From(dup)
	if got.Status != http.StatusBadRequest || got.Message != "Value already in use." {
		t.Errorf("got status=%d msg=%q", got.Status, got.Message)
	}
}

func TestFromGeneric(t *testing.T) {
	got := From(errors.New("boom"))
	if got.Status != http.StatusInternalServerError {
		t.Errorf("generic error should map to 500, got %d", got.Status)
	}
	if got.Message != internalMessage {
		t.Errorf("generic error should hide cause, got message %q", got.Message)
	}
	if !errors.Is(got, got.Unwrap()) {
		t.Errorf("generic error should retain its cause for logging")
	}
}
