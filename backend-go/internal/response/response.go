// Package response centralises how handlers write HTTP responses. Success paths
// call OK/Created/JSON/Message/Text; failures call Error, which records the
// error on the gin context so the ErrorHandler middleware renders and logs it
// in one place. Handlers therefore never build error JSON or pick status codes
// inline.
package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// OK writes a 200 with the given body.
func OK(c *gin.Context, body any) { c.JSON(http.StatusOK, body) }

// Created writes a 201 with the given body.
func Created(c *gin.Context, body any) { c.JSON(http.StatusCreated, body) }

// JSON writes an arbitrary status with the given body.
func JSON(c *gin.Context, status int, body any) { c.JSON(status, body) }

// Message writes a status with a single {"message": msg} body — the standard
// success envelope for endpoints that only confirm an action.
func Message(c *gin.Context, status int, msg string) {
	c.JSON(status, gin.H{"message": msg})
}

// Text writes a plain-text response. Used by the browser-facing OAuth endpoints
// whose output is shown directly to the user rather than parsed as JSON.
func Text(c *gin.Context, status int, msg string) { c.String(status, msg) }

// Redirect issues an HTTP redirect.
func Redirect(c *gin.Context, url string) { c.Redirect(http.StatusFound, url) }

// Error records err on the gin context for the ErrorHandler middleware to
// render and log. Handlers call this and return; they do not write the error
// body themselves, keeping status/message selection in the apierror layer.
func Error(c *gin.Context, err error) { _ = c.Error(err) }
