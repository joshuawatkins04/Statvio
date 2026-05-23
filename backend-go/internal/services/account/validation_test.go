package account

import "testing"

func TestIsValidUsername(t *testing.T) {
	valid := []string{"josh", "user_123", "abcd", "WithCAPS9"}
	invalid := []string{"abc", "ab", "has space", "no-dash", "dot.dot", ""}
	for _, s := range valid {
		if !isValidUsername(s) {
			t.Errorf("expected %q to be valid", s)
		}
	}
	for _, s := range invalid {
		if isValidUsername(s) {
			t.Errorf("expected %q to be invalid", s)
		}
	}
}

func TestIsValidEmail(t *testing.T) {
	valid := []string{"a@b.co", "josh.watkins+tag@example.com"}
	invalid := []string{"nope", "a@b", "a@b.c", "@b.co", "a@.co", ""}
	for _, s := range valid {
		if !isValidEmail(s) {
			t.Errorf("expected %q to be valid", s)
		}
	}
	for _, s := range invalid {
		if isValidEmail(s) {
			t.Errorf("expected %q to be invalid", s)
		}
	}
}

func TestIsValidPassword(t *testing.T) {
	valid := []string{"Passw0rd!", "Abcdef1$", "X9y8z7@w"}
	invalid := []string{
		"password",  // no upper/digit/special
		"Password1", // no special
		"Ab1!",      // too short
		"PÄssw0rd!", // disallowed character
		"PASSW0RD!", // no lowercase
	}
	for _, s := range valid {
		if !isValidPassword(s) {
			t.Errorf("expected %q to be valid", s)
		}
	}
	for _, s := range invalid {
		if isValidPassword(s) {
			t.Errorf("expected %q to be invalid", s)
		}
	}
}
