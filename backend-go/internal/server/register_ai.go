package server

import "github.com/gin-gonic/gin"

// registerAIRoutes mounts the /api/ai routes, mirroring routes/ai.js.
func (s *Server) registerAIRoutes(api *gin.RouterGroup) {
	ai := api.Group("/ai")
	ai.POST("/generate-response", s.authRequired(), s.generateResponse)
}
