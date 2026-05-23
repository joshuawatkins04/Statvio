// Package models defines the persistent data structures. The bson tags map
// exactly onto the documents written by the original Mongoose schema so the Go
// service is read/write compatible with the existing Atlas `users` collection.
package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// LinkedAccount is the shared shape for a connected music provider (Spotify,
// SoundCloud). OAuth tokens are persisted in bson but never serialized to API
// responses (json:"-") — the original Node code leaked them via GET /user.
type LinkedAccount struct {
	Linked          bool       `bson:"linked" json:"linked"`
	ProviderID      string     `bson:"spotifyId,omitempty" json:"providerId,omitempty"`
	DisplayName     string     `bson:"displayName,omitempty" json:"displayName,omitempty"`
	Email           string     `bson:"email,omitempty" json:"email,omitempty"`
	ProfileImageURL string     `bson:"profileImageUrl,omitempty" json:"profileImageUrl,omitempty"`
	AccessToken     string     `bson:"accessToken,omitempty" json:"-"`
	RefreshToken    string     `bson:"refreshToken,omitempty" json:"-"`
	TokenExpiresAt  *time.Time `bson:"tokenExpiresAt,omitempty" json:"-"`
	LastSyncedAt    *time.Time `bson:"lastSyncedAt,omitempty" json:"lastSyncedAt,omitempty"`
}

// SoundcloudAccount mirrors LinkedAccount but with the soundcloudId bson key.
type SoundcloudAccount struct {
	Linked          bool       `bson:"linked" json:"linked"`
	ProviderID      string     `bson:"soundcloudId,omitempty" json:"providerId,omitempty"`
	DisplayName     string     `bson:"displayName,omitempty" json:"displayName,omitempty"`
	Email           string     `bson:"email,omitempty" json:"email,omitempty"`
	ProfileImageURL string     `bson:"profileImageUrl,omitempty" json:"profileImageUrl,omitempty"`
	AccessToken     string     `bson:"accessToken,omitempty" json:"-"`
	RefreshToken    string     `bson:"refreshToken,omitempty" json:"-"`
	TokenExpiresAt  *time.Time `bson:"tokenExpiresAt,omitempty" json:"-"`
	LastSyncedAt    *time.Time `bson:"lastSyncedAt,omitempty" json:"lastSyncedAt,omitempty"`
}

// Subscription holds Stripe billing state. Added in the Stripe migration; it is
// omitempty so existing user documents (which lack it) decode cleanly.
type Subscription struct {
	Status               string     `bson:"status,omitempty" json:"status,omitempty"`
	StripeCustomerID     string     `bson:"stripeCustomerId,omitempty" json:"-"`
	StripeSubscriptionID string     `bson:"stripeSubscriptionId,omitempty" json:"-"`
	PriceID              string     `bson:"priceId,omitempty" json:"priceId,omitempty"`
	CurrentPeriodEnd     *time.Time `bson:"currentPeriodEnd,omitempty" json:"currentPeriodEnd,omitempty"`
	UpdatedAt            *time.Time `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

// User is the document stored in the `users` collection.
type User struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Username         string             `bson:"username" json:"username"`
	Email            string             `bson:"email" json:"email"`
	Password         string             `bson:"password" json:"-"`
	Role             string             `bson:"role,omitempty" json:"role,omitempty"`
	TutorialComplete bool               `bson:"tutorialComplete" json:"tutorialComplete"`
	ProfileImageURL  string             `bson:"profileImageUrl,omitempty" json:"profileImageUrl,omitempty"`
	ProfileImageKey  *string            `bson:"profileImageKey,omitempty" json:"profileImageKey,omitempty"`
	LastLogin        *time.Time         `bson:"lastLogin,omitempty" json:"lastLogin,omitempty"`
	LastLogout       *time.Time         `bson:"lastLogout,omitempty" json:"lastLogout,omitempty"`
	APIsLinked       []string           `bson:"apisLinked" json:"apisLinked"`
	APICount         int                `bson:"apiCount" json:"apiCount"`

	Spotify    LinkedAccount     `bson:"spotify,omitempty" json:"spotify"`
	Soundcloud SoundcloudAccount `bson:"soundcloud,omitempty" json:"soundcloud"`

	Subscription *Subscription `bson:"subscription,omitempty" json:"subscription,omitempty"`

	CreatedAt time.Time `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt time.Time `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
	Version   int       `bson:"__v,omitempty" json:"-"`
}
