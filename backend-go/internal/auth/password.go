// Package auth provides password hashing and JWT issuance/verification.
package auth

import "golang.org/x/crypto/bcrypt"

// bcryptCost matches the cost factor (10) used by the original bcryptjs setup,
// so existing $2 hashes verify and new hashes are written at the same cost.
const bcryptCost = 10

// HashPassword returns a bcrypt hash of the given plaintext password.
func HashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// ComparePassword reports whether the plaintext matches the stored bcrypt hash.
func ComparePassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
