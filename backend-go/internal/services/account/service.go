// Package account holds the user and authentication business logic: it owns the
// signup/login rules, the field validation, and the account-update workflows
// that previously lived inline in the HTTP handlers. Handlers now parse the
// request, call a method here, and render the result.
package account

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"statvio/backend/internal/apierror"
	"statvio/backend/internal/auth"
	"statvio/backend/internal/models"
	"statvio/backend/internal/repository"
)

// Service implements account and authentication operations over the user
// repository and the JWT token manager.
type Service struct {
	users  *repository.UserRepository
	tokens *auth.Manager
}

// New builds the account service.
func New(users *repository.UserRepository, tokens *auth.Manager) *Service {
	return &Service{users: users, tokens: tokens}
}

// RegisterInput carries the signup fields.
type RegisterInput struct {
	Username string
	Email    string
	Password string
}

// Register validates the signup fields, enforces uniqueness, and creates the
// user. It returns the new user's hex id.
func (s *Service) Register(ctx context.Context, in RegisterInput) (string, error) {
	if in.Username == "" || in.Email == "" || in.Password == "" {
		return "", apierror.BadRequest("All fields are required.")
	}

	existing, err := s.users.FindByUsernameOrEmailExact(ctx, in.Username, in.Email)
	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		return "", err
	}
	if existing != nil {
		return "", apierror.BadRequest("Username or email already in use.")
	}

	if len(in.Username) < 4 || len(in.Username) > 20 {
		return "", apierror.BadRequest("Username must be between 4 and 20 characters long.")
	}
	if len(in.Email) < 5 || len(in.Email) > 45 {
		return "", apierror.BadRequest("Email must be between 5 and 45 characters long.")
	}
	if len(in.Password) < 8 || len(in.Password) > 40 {
		return "", apierror.BadRequest("Password must be between 8 and 40 characters long.")
	}

	if !isValidUsername(in.Username) {
		return "", apierror.BadRequest("Please provide a valid username.")
	}
	if !isValidEmail(in.Email) {
		return "", apierror.BadRequest("Please provide a valid email address.")
	}
	if !isValidPassword(in.Password) {
		return "", apierror.BadRequest("Please provide a valid password.")
	}

	hash, err := auth.HashPassword(in.Password)
	if err != nil {
		return "", err
	}

	created, err := s.users.Create(ctx, &models.User{
		Username: in.Username,
		Email:    in.Email,
		Password: hash,
	})
	if err != nil {
		// A duplicate-key race is translated to a 400 by apierror.From.
		return "", err
	}
	return created.ID.Hex(), nil
}

// Credentials holds the result of a successful login.
type Credentials struct {
	Token  string
	UserID string
}

// Login authenticates a user by username-or-email and password, records the
// login time, and returns a signed token. Authentication failures are reported
// with a single ambiguous message to avoid leaking which field was wrong.
func (s *Service) Login(ctx context.Context, usernameOrEmail, password string) (Credentials, error) {
	if usernameOrEmail == "" || password == "" {
		return Credentials{}, apierror.BadRequest("All fields are required.")
	}

	user, err := s.users.FindByUsernameOrEmail(ctx, usernameOrEmail)
	if errors.Is(err, repository.ErrNotFound) {
		return Credentials{}, apierror.Unauthorized("Incorrect email or password")
	}
	if err != nil {
		return Credentials{}, err
	}
	if !auth.ComparePassword(user.Password, password) {
		return Credentials{}, apierror.Unauthorized("Incorrect email or password")
	}

	token, err := s.tokens.Sign(user.ID.Hex())
	if err != nil {
		return Credentials{}, err
	}

	// Best-effort: a failed lastLogin write must not fail the login.
	_ = s.users.UpdateByID(ctx, user.ID.Hex(), bson.M{"lastLogin": time.Now().UTC()})

	return Credentials{Token: token, UserID: user.ID.Hex()}, nil
}

// Logout records the logout time for the user. Cookie clearing is the handler's
// concern; this validates the id and updates the document.
func (s *Service) Logout(ctx context.Context, userID string) error {
	if userID == "" {
		return apierror.BadRequest("User ID is required for logout.")
	}
	if _, err := primitive.ObjectIDFromHex(userID); err != nil {
		return apierror.BadRequest("Invalid user ID format.")
	}
	if err := s.users.UpdateByID(ctx, userID, bson.M{"lastLogout": time.Now().UTC()}); err != nil {
		return err
	}
	return nil
}

// Verify loads the user behind a validated token, returning 401 when the user
// no longer exists (the token is valid but references a deleted account).
func (s *Service) Verify(ctx context.Context, userID string) (*models.User, error) {
	user, err := s.users.FindByID(ctx, userID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, apierror.Unauthorized("Unauthorized")
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

// Get loads a user by id, mapping a missing user to a 404. Used by the
// dashboard, profile and api-info endpoints.
func (s *Service) Get(ctx context.Context, userID string) (*models.User, error) {
	user, err := s.users.FindByID(ctx, userID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, apierror.NotFound("User not found.")
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

// UpdateUsername changes a user's username after checking it differs, is not
// taken, and is valid. Returns the new username.
func (s *Service) UpdateUsername(ctx context.Context, userID, newUsername string) (string, error) {
	if newUsername == "" {
		return "", apierror.BadRequest("New username is required.")
	}

	user, err := s.Get(ctx, userID)
	if err != nil {
		return "", err
	}
	if user.Username == newUsername {
		return "", apierror.BadRequest("New username must be different from the current one.")
	}

	taken, err := s.users.FindByUsername(ctx, newUsername)
	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		return "", err
	}
	if taken != nil {
		return "", apierror.Conflict("Username already in use.")
	}
	if !isValidUsername(newUsername) {
		return "", apierror.BadRequest("Please provide a valid username.")
	}

	if err := s.users.UpdateByID(ctx, user.ID.Hex(), bson.M{"username": newUsername}); err != nil {
		return "", err
	}
	return newUsername, nil
}

// UpdateEmail changes a user's email after checking it differs, is not taken,
// and is valid. Returns the new email.
func (s *Service) UpdateEmail(ctx context.Context, userID, newEmail string) (string, error) {
	if newEmail == "" {
		return "", apierror.BadRequest("New email is required.")
	}

	user, err := s.Get(ctx, userID)
	if err != nil {
		return "", err
	}
	if user.Email == newEmail {
		return "", apierror.BadRequest("New email must be different from the current one.")
	}

	taken, err := s.users.FindByEmail(ctx, newEmail)
	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		return "", err
	}
	if taken != nil {
		return "", apierror.Conflict("Email already in use.")
	}
	if !isValidEmail(newEmail) {
		return "", apierror.BadRequest("Please provide a valid email address.")
	}

	if err := s.users.UpdateByID(ctx, user.ID.Hex(), bson.M{"email": newEmail}); err != nil {
		return "", err
	}
	return newEmail, nil
}

// UpdatePassword sets a new password after confirming it matches, is different
// from the current one, and satisfies the password policy.
func (s *Service) UpdatePassword(ctx context.Context, userID, newPassword, confirmPassword string) error {
	if newPassword == "" || confirmPassword == "" {
		return apierror.BadRequest("All password fields are required.")
	}
	if newPassword != confirmPassword {
		return apierror.BadRequest("New passwords do not match.")
	}
	if len(newPassword) < 8 || len(newPassword) > 40 {
		return apierror.BadRequest("Password must be between 8 and 40 characters long.")
	}

	user, err := s.Get(ctx, userID)
	if err != nil {
		return err
	}
	if auth.ComparePassword(user.Password, newPassword) {
		return apierror.BadRequest("New password must be different from the current password.")
	}
	if !isValidPassword(newPassword) {
		return apierror.BadRequest("Please provide a valid password.")
	}

	hash, err := auth.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.users.UpdateByID(ctx, user.ID.Hex(), bson.M{"password": hash})
}

// UpdateTutorialStatus toggles the user's tutorial-complete flag, rejecting a
// no-op update.
func (s *Service) UpdateTutorialStatus(ctx context.Context, userID string, complete bool) error {
	user, err := s.Get(ctx, userID)
	if err != nil {
		return err
	}
	if user.TutorialComplete == complete {
		return apierror.BadRequest("Value already the same.")
	}
	return s.users.UpdateByID(ctx, user.ID.Hex(), bson.M{"tutorialComplete": complete})
}
