// Package media owns the profile-image business logic: validating the upload,
// storing it in S3, cleaning up the previously stored image, and recording the
// new key/URL on the user. It composes the S3 storage client with the user
// repository.
//
// Errors from this package are rendered under the JSON key "error" rather than
// "message", because the upload client (ProfileImageUpload.jsx) reads
// response.data.error.
package media

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"strings"

	"go.mongodb.org/mongo-driver/bson"

	"statvio/backend/internal/apierror"
	"statvio/backend/internal/repository"
	"statvio/backend/internal/services/storage"
)

// maxUploadBytes caps the profile image size, matching the original multer limit.
const maxUploadBytes = 5 * 1024 * 1024 // 5 MB

// Service handles profile image uploads.
type Service struct {
	users   *repository.UserRepository
	storage *storage.S3
	log     *slog.Logger
}

// New builds the media service.
func New(users *repository.UserRepository, st *storage.S3, log *slog.Logger) *Service {
	return &Service{users: users, storage: st, log: log}
}

// Upload carries the fields of a profile-image upload, decoupled from the
// multipart request that produced them.
type Upload struct {
	UserID      string
	Filename    string
	ContentType string
	Size        int64
	File        io.Reader
}

// uploadFailed is the generic 500 returned for any storage/persistence failure.
func uploadFailed(cause error) *apierror.Error {
	return apierror.Wrap("Failed to upload file.", cause).WithKey("error")
}

// UploadProfileImage validates the file, stores it, removes the user's previous
// image, and records the new key and URL. It returns the public image URL.
func (s *Service) UploadProfileImage(ctx context.Context, in Upload) (string, error) {
	if !allowedImage(in.Filename, in.ContentType) {
		return "", apierror.BadRequest("Only .jpeg, .jpg, and .png files allowed.").WithKey("error")
	}
	if in.Size > maxUploadBytes {
		return "", apierror.BadRequest("File exceeds the 5MB size limit.").WithKey("error")
	}

	user, err := s.users.FindByID(ctx, in.UserID)
	if errors.Is(err, repository.ErrNotFound) {
		return "", apierror.NotFound("User not found.").WithKey("error")
	}
	if err != nil {
		s.log.Error("upload: user lookup failed", "error", err)
		return "", uploadFailed(err)
	}

	key, url, err := s.storage.Upload(ctx, in.UserID, in.Filename, in.ContentType, in.File)
	if err != nil {
		s.log.Error("upload: s3 upload failed", "error", err)
		return "", uploadFailed(err)
	}

	// Best-effort cleanup of the previous image.
	if user.ProfileImageKey != nil && *user.ProfileImageKey != "" {
		if err := s.storage.Delete(ctx, *user.ProfileImageKey); err != nil {
			s.log.Error("upload: failed to delete old image", "key", *user.ProfileImageKey, "error", err)
		}
	}

	if err := s.users.UpdateByID(ctx, in.UserID, bson.M{
		"profileImageKey": key,
		"profileImageUrl": url,
	}); err != nil {
		s.log.Error("upload: failed to update user", "error", err)
		return "", uploadFailed(err)
	}

	return url, nil
}

func allowedImage(filename, mimeType string) bool {
	name := strings.ToLower(filename)
	extOK := strings.HasSuffix(name, ".jpeg") || strings.HasSuffix(name, ".jpg") || strings.HasSuffix(name, ".png")
	mimeOK := strings.Contains(mimeType, "jpeg") || strings.Contains(mimeType, "jpg") || strings.Contains(mimeType, "png")
	return extOK && mimeOK
}
