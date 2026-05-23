package server

import "github.com/gin-gonic/gin"

// registerAuthRoutes mounts the /api/auth routes, mirroring routes/user.js.
func (s *Server) registerAuthRoutes(api *gin.RouterGroup) {
	auth := api.Group("/auth")

	authLimiter := s.authLimiter()
	protected := s.authRequired()

	auth.POST("/signup", authLimiter, s.registerUser)
	auth.POST("/login", authLimiter, s.loginUser)
	auth.POST("/logout", protected, s.logoutUser)

	auth.GET("/verify", protected, s.verifyLimiter(), s.verifyAuth)
	auth.GET("/dashboard", protected, s.getUserDashboard)
	auth.GET("/user", protected, s.getUser)
	auth.GET("/api-info", protected, s.getApiInfo)

	auth.PUT("/update-username", protected, s.updateUsername)
	auth.PUT("/update-email", protected, s.updateEmail)
	auth.PUT("/update-password", protected, s.updatePassword)
	auth.PUT("/update-tutorial-status", protected, s.updateTutorialStatus)
}
