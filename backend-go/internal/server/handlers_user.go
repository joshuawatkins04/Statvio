package server

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"statvio/backend/internal/apierror"
	"statvio/backend/internal/auth"
	"statvio/backend/internal/middleware"
	"statvio/backend/internal/response"
	"statvio/backend/internal/services/account"
)

// setAuthCookie writes the JWT as an httpOnly cookie, matching the Node config:
// httpOnly, secure in production, SameSite=Strict, 1h lifetime.
func (s *Server) setAuthCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("token", token, int(auth.TokenTTL.Seconds()), "/", "", s.Cfg.IsProduction(), true)
}

func (s *Server) clearAuthCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("token", "", -1, "/", "", s.Cfg.IsProduction(), true)
}

// registerUser handles POST /api/auth/signup.
func (s *Server) registerUser(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	_ = c.ShouldBind(&body)

	userID, err := s.Account.Register(c.Request.Context(), account.RegisterInput{
		Username: body.Username,
		Email:    body.Email,
		Password: body.Password,
	})
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, gin.H{
		"message": "User registered successfully",
		"userId":  userID,
	})
}

// loginUser handles POST /api/auth/login.
func (s *Server) loginUser(c *gin.Context) {
	var body struct {
		UsernameOrEmail string `json:"usernameOrEmail"`
		Password        string `json:"password"`
	}
	_ = c.ShouldBind(&body)

	creds, err := s.Account.Login(c.Request.Context(), body.UsernameOrEmail, body.Password)
	if err != nil {
		response.Error(c, err)
		return
	}
	s.setAuthCookie(c, creds.Token)

	response.OK(c, gin.H{
		"message": "Login successful",
		"token":   creds.Token,
		"userId":  creds.UserID,
	})
}

// logoutUser handles POST /api/auth/logout. The user id comes from the request
// body (preserving the original behaviour, even though the route is protected).
func (s *Server) logoutUser(c *gin.Context) {
	var body struct {
		UserID string `json:"userId"`
	}
	_ = c.ShouldBind(&body)

	s.clearAuthCookie(c)

	if err := s.Account.Logout(c.Request.Context(), body.UserID); err != nil {
		response.Error(c, err)
		return
	}
	response.Message(c, http.StatusOK, "Successfully logged out.")
}

// verifyAuth handles GET /api/auth/verify.
func (s *Server) verifyAuth(c *gin.Context) {
	user, err := s.Account.Verify(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{
		"isValid": true,
		"user": gin.H{
			"id":       user.ID.Hex(),
			"email":    user.Email,
			"username": user.Username,
		},
	})
}

// getUserDashboard handles GET /api/auth/dashboard.
func (s *Server) getUserDashboard(c *gin.Context) {
	user, err := s.Account.Get(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{
		"message": "Welcome to your dashboard",
		"user": gin.H{
			"id":       user.ID.Hex(),
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// getUser handles GET /api/auth/user — returns the full user document (minus
// password, which is excluded via the model's json tag).
func (s *Server) getUser(c *gin.Context) {
	user, err := s.Account.Get(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, user)
}

// getApiInfo handles GET /api/auth/api-info.
func (s *Server) getApiInfo(c *gin.Context) {
	user, err := s.Account.Get(c.Request.Context(), middleware.UserID(c))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{
		"apiCount":   user.APICount,
		"apisLinked": user.APIsLinked,
	})
}

// updateUsername handles PUT /api/auth/update-username.
func (s *Server) updateUsername(c *gin.Context) {
	var body struct {
		NewUsername string `json:"newUsername"`
	}
	_ = c.ShouldBind(&body)

	username, err := s.Account.UpdateUsername(c.Request.Context(), middleware.UserID(c), body.NewUsername)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"message": "Username updated successfully.", "username": username})
}

// updateEmail handles PUT /api/auth/update-email.
func (s *Server) updateEmail(c *gin.Context) {
	var body struct {
		NewEmail string `json:"newEmail"`
	}
	_ = c.ShouldBind(&body)

	email, err := s.Account.UpdateEmail(c.Request.Context(), middleware.UserID(c), body.NewEmail)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.OK(c, gin.H{"message": "Email updated successfully.", "email": email})
}

// updatePassword handles PUT /api/auth/update-password.
func (s *Server) updatePassword(c *gin.Context) {
	var body struct {
		NewPassword        string `json:"newPassword"`
		ConfirmNewPassword string `json:"confirmNewPassword"`
	}
	_ = c.ShouldBind(&body)

	if err := s.Account.UpdatePassword(c.Request.Context(), middleware.UserID(c), body.NewPassword, body.ConfirmNewPassword); err != nil {
		response.Error(c, err)
		return
	}
	response.Message(c, http.StatusOK, "Password updated successfully.")
}

// updateTutorialStatus handles PUT /api/auth/update-tutorial-status.
func (s *Server) updateTutorialStatus(c *gin.Context) {
	var body struct {
		TutorialComplete *bool `json:"tutorialComplete"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.TutorialComplete == nil {
		response.Error(c, apierror.BadRequest("Invalid value"))
		return
	}

	if err := s.Account.UpdateTutorialStatus(c.Request.Context(), middleware.UserID(c), *body.TutorialComplete); err != nil {
		response.Error(c, err)
		return
	}
	response.Message(c, http.StatusOK, "Tutorial status updated successfully.")
}
