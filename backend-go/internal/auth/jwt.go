package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TokenTTL is the lifetime of an issued token (1 hour), matching the Node setup.
const TokenTTL = time.Hour

// ErrInvalidToken is returned when a token is missing, malformed, expired, or
// carries no user id.
var ErrInvalidToken = errors.New("invalid or expired token")

// Manager signs and verifies JWTs with a shared HMAC secret.
type Manager struct {
	secret []byte
}

// NewManager constructs a token manager from the configured secret.
func NewManager(secret string) *Manager {
	return &Manager{secret: []byte(secret)}
}

// claims is the token payload. The original Node tokens carry only {id}, so we
// keep the same shape for cross-compatibility during the migration overlap.
type claims struct {
	ID string `json:"id"`
	jwt.RegisteredClaims
}

// Sign issues an HS256 token for the given user id, expiring after TokenTTL.
func (m *Manager) Sign(userID string) (string, error) {
	now := time.Now()
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims{
		ID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(TokenTTL)),
		},
	})
	return tok.SignedString(m.secret)
}

// Verify validates a token string and returns the embedded user id.
func (m *Manager) Verify(tokenString string) (string, error) {
	parsed, err := jwt.ParseWithClaims(tokenString, &claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return m.secret, nil
	})
	if err != nil {
		return "", ErrInvalidToken
	}
	c, ok := parsed.Claims.(*claims)
	if !ok || !parsed.Valid || c.ID == "" {
		return "", ErrInvalidToken
	}
	return c.ID, nil
}
