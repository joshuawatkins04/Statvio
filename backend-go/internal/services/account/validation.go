package account

import (
	"regexp"
	"strings"
)

// These mirror the validators declared on the original Mongoose user schema.
// The password rule used lookahead assertions, which Go's RE2 engine does not
// support, so it is reimplemented as explicit character-class checks below.

var (
	usernameRegex = regexp.MustCompile(`^\w{4,}$`)
	emailRegex    = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

	passwordAllowed = regexp.MustCompile(`^[A-Za-z\d@$!%*?&]{8,}$`)
	passwordSpecial = "@$!%*?&"
)

func isValidUsername(s string) bool { return usernameRegex.MatchString(s) }
func isValidEmail(s string) bool    { return emailRegex.MatchString(s) }

// isValidPassword enforces: at least one lowercase, one uppercase, one digit,
// one special char from @$!%*?&, only those character classes, min length 8.
func isValidPassword(s string) bool {
	if !passwordAllowed.MatchString(s) {
		return false
	}
	var hasLower, hasUpper, hasDigit, hasSpecial bool
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z':
			hasLower = true
		case r >= 'A' && r <= 'Z':
			hasUpper = true
		case r >= '0' && r <= '9':
			hasDigit = true
		case strings.ContainsRune(passwordSpecial, r):
			hasSpecial = true
		}
	}
	return hasLower && hasUpper && hasDigit && hasSpecial
}
