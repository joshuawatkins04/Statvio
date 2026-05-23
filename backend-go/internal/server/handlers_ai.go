package server

import (
	"github.com/gin-gonic/gin"

	"statvio/backend/internal/apierror"
	"statvio/backend/internal/response"
)

// generateResponse handles POST /api/ai/generate-response. The AI business
// logic (prompt construction, completion) lives in the OpenAI client; the
// handler only validates the request and renders the result.
func (s *Server) generateResponse(c *gin.Context) {
	var body struct {
		Input string `json:"input"`
	}
	_ = c.ShouldBind(&body)

	if body.Input == "" {
		response.Error(c, apierror.BadRequest("Invalid input provided"))
		return
	}

	resp, err := s.AI.Generic(c.Request.Context(), body.Input)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"response": resp})
}
