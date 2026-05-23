package auth

import "testing"

func TestSignVerifyRoundTrip(t *testing.T) {
	m := NewManager("a-secret")
	tok, err := m.Sign("user123")
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	id, err := m.Verify(tok)
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if id != "user123" {
		t.Fatalf("got id %q, want user123", id)
	}
}

func TestVerifyRejectsWrongSecret(t *testing.T) {
	tok, _ := NewManager("secret-a").Sign("u")
	if _, err := NewManager("secret-b").Verify(tok); err == nil {
		t.Fatal("expected verification to fail with a different secret")
	}
}

func TestVerifyRejectsMalformed(t *testing.T) {
	m := NewManager("s")
	for _, bad := range []string{"", "not-a-token", "a.b.c"} {
		if _, err := m.Verify(bad); err == nil {
			t.Errorf("expected error for %q", bad)
		}
	}
}

func TestPasswordHashRoundTrip(t *testing.T) {
	hash, err := HashPassword("Sup3r$ecret")
	if err != nil {
		t.Fatalf("hash: %v", err)
	}
	if hash[:2] != "$2" {
		t.Fatalf("expected a bcrypt $2 hash, got prefix %q", hash[:2])
	}
	if !ComparePassword(hash, "Sup3r$ecret") {
		t.Fatal("correct password should match")
	}
	if ComparePassword(hash, "wrong") {
		t.Fatal("incorrect password should not match")
	}
}
