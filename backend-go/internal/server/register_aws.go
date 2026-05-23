package server

import "github.com/gin-gonic/gin"

// registerAWSRoutes mounts the /api/aws routes, mirroring routes/aws.js.
func (s *Server) registerAWSRoutes(api *gin.RouterGroup) {
	aws := api.Group("/aws")
	aws.POST("/upload", s.authRequired(), s.uploadProfileImage)
}
