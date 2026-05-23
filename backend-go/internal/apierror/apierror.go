// Package apierror defines the single typed error used across the API. Service
// methods return an *Error to describe an expected failure (its HTTP status and
// the client-facing message); handlers surface it with c.Error and the
// ErrorHandler middleware renders it. Unexpected errors are wrapped as 500s by
// From, which keeps the underlying cause for logging without leaking it.
package apierror

import (
	"errors"
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"statvio/backend/internal/repository"
)

// defaultKey is the JSON field the client reads an error message from. The
// frontend reads `message` for every area except the upload endpoint, which
// reads `error` (see WithKey).
const defaultKey = "message"

// internalMessage is the generic text returned for any unexpected 5xx so server
// internals are never exposed to clients.
const internalMessage = "An unexpected server error occurred."

// Error is a typed API error carrying the HTTP status and the message safe to
// return to the client. cause holds the underlying error (if any) for logging.
type Error struct {
	Status  int
	Message string
	Key     string // JSON field for the message; empty means defaultKey
	cause   error
}

// Error implements the error interface. It reports the internal cause when one
// is present so logs are useful, falling back to the client message otherwise.
func (e *Error) Error() string {
	if e.cause != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.cause)
	}
	return e.Message
}

// Unwrap exposes the underlying cause to errors.Is/As.
func (e *Error) Unwrap() error { return e.cause }

// ResponseKey returns the JSON field the message should be rendered under.
func (e *Error) ResponseKey() string {
	if e.Key == "" {
		return defaultKey
	}
	return e.Key
}

// WithKey overrides the JSON field the message is rendered under (used by the
// upload endpoint, whose client reads `error` rather than `message`).
func (e *Error) WithKey(key string) *Error {
	e.Key = key
	return e
}

// WithCause attaches an underlying error for logging without changing the
// client-facing status or message.
func (e *Error) WithCause(cause error) *Error {
	e.cause = cause
	return e
}

// New builds an Error with an explicit status and client message.
func New(status int, message string) *Error {
	return &Error{Status: status, Message: message}
}

// BadRequest builds a 400.
func BadRequest(message string) *Error { return New(http.StatusBadRequest, message) }

// Unauthorized builds a 401.
func Unauthorized(message string) *Error { return New(http.StatusUnauthorized, message) }

// Forbidden builds a 403.
func Forbidden(message string) *Error { return New(http.StatusForbidden, message) }

// NotFound builds a 404.
func NotFound(message string) *Error { return New(http.StatusNotFound, message) }

// Conflict builds a 409.
func Conflict(message string) *Error { return New(http.StatusConflict, message) }

// PaymentRequired builds a 402.
func PaymentRequired(message string) *Error { return New(http.StatusPaymentRequired, message) }

// Internal builds a 500 that hides the cause behind a generic message while
// retaining it for logging.
func Internal(cause error) *Error {
	return &Error{Status: http.StatusInternalServerError, Message: internalMessage, cause: cause}
}

// Wrap builds a 500 with a specific client-facing message while retaining the
// cause for logging. Use it when a failure deserves a clearer message than the
// generic Internal text (e.g. "Failed to start checkout.").
func Wrap(message string, cause error) *Error {
	return &Error{Status: http.StatusInternalServerError, Message: message, cause: cause}
}

// From normalises any error into an *Error. An existing *Error is returned
// unchanged. Known infrastructure errors are mapped to their HTTP equivalents,
// mirroring the translations the ErrorHandler middleware used to do inline:
//   - Mongo duplicate-key  -> 400 "Value already in use."
//   - repository.ErrNotFound -> 404 "User not found."
//
// Anything else becomes an Internal 500 wrapping the cause.
func From(err error) *Error {
	if err == nil {
		return nil
	}
	var apiErr *Error
	if errors.As(err, &apiErr) {
		return apiErr
	}
	switch {
	case mongo.IsDuplicateKeyError(err):
		return BadRequest("Value already in use.").WithCause(err)
	case errors.Is(err, repository.ErrNotFound):
		return NotFound("User not found.").WithCause(err)
	default:
		return Internal(err)
	}
}
