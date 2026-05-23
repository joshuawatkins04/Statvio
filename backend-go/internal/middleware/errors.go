package middleware

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/apierror"
)

// ErrorHandler is the final-stage middleware that renders errors recorded by
// handlers (via c.Error) into HTTP responses. It is the single place that turns
// an error into a status code and JSON body: handlers signal failure by
// recording an *apierror.Error (or any error) and returning. Server errors are
// logged with their underlying cause; client errors are not.
func ErrorHandler(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) == 0 || c.Writer.Written() {
			return
		}

		apiErr := apierror.From(c.Errors.Last().Err)
		if apiErr.Status >= http.StatusInternalServerError {
			route := c.Request.Method + " " + c.Request.URL.Path
			log.Error("request failed", "route", route, "status", apiErr.Status, "error", apiErr.Error())
		}
		c.JSON(apiErr.Status, gin.H{apiErr.ResponseKey(): apiErr.Message})
	}
}
