package server

import (
	"github.com/gin-gonic/gin"

	"statvio/backend/internal/apierror"
	"statvio/backend/internal/middleware"
	"statvio/backend/internal/response"
	"statvio/backend/internal/services/media"
)

// uploadProfileImage handles POST /api/aws/upload (multipart field "profileImage").
func (s *Server) uploadProfileImage(c *gin.Context) {
	fileHeader, err := c.FormFile("profileImage")
	if err != nil {
		response.Error(c, apierror.BadRequest("No file uploaded.").WithKey("error"))
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		response.Error(c, apierror.Wrap("Failed to upload file.", err).WithKey("error"))
		return
	}
	defer file.Close()

	url, err := s.Media.UploadProfileImage(c.Request.Context(), media.Upload{
		UserID:      middleware.UserID(c),
		Filename:    fileHeader.Filename,
		ContentType: fileHeader.Header.Get("Content-Type"),
		Size:        fileHeader.Size,
		File:        file,
	})
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, gin.H{"imageUrl": url})
}
