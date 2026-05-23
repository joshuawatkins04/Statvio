// Package repository contains all data access for the users collection. It is
// the Go equivalent of the Mongoose model queries scattered across the Node
// controllers, collected behind one type.
package repository

import (
	"context"
	"errors"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"statvio/backend/internal/models"
)

// ErrNotFound is returned when a query matches no document.
var ErrNotFound = errors.New("user not found")

var emailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

// UserRepository provides CRUD access to the users collection.
type UserRepository struct {
	col *mongo.Collection
}

// NewUserRepository builds a repository over the given database.
func NewUserRepository(database *mongo.Database) *UserRepository {
	return &UserRepository{col: database.Collection("users")}
}

// Create inserts a new user, applying the schema defaults the Mongoose model
// used to set automatically, and returns the stored document.
func (r *UserRepository) Create(ctx context.Context, u *models.User) (*models.User, error) {
	now := time.Now().UTC()
	if u.Role == "" {
		u.Role = "user"
	}
	if u.ProfileImageURL == "" {
		u.ProfileImageURL = "https://www.gravatar.com/avatar/?d=mp"
	}
	if u.APIsLinked == nil {
		u.APIsLinked = []string{}
	}
	u.CreatedAt = now
	u.UpdatedAt = now

	res, err := r.col.InsertOne(ctx, u)
	if err != nil {
		return nil, err
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		u.ID = oid
	}
	return u, nil
}

// FindByID looks up a user by hex object id.
func (r *UserRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrNotFound
	}
	return r.findOne(ctx, bson.M{"_id": oid})
}

// FindByUsernameOrEmail resolves a login identifier to a user, choosing the
// field to query by whether the identifier looks like an email.
func (r *UserRepository) FindByUsernameOrEmail(ctx context.Context, identifier string) (*models.User, error) {
	if emailRegex.MatchString(identifier) {
		return r.findOne(ctx, bson.M{"email": identifier})
	}
	return r.findOne(ctx, bson.M{"username": identifier})
}

// FindByUsername looks up a user by exact username.
func (r *UserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	return r.findOne(ctx, bson.M{"username": username})
}

// FindByEmail looks up a user by exact email.
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	return r.findOne(ctx, bson.M{"email": email})
}

// FindByUsernameOrEmailExact matches either field (used for duplicate checks at
// registration, mirroring the Mongoose $or query).
func (r *UserRepository) FindByUsernameOrEmailExact(ctx context.Context, username, email string) (*models.User, error) {
	return r.findOne(ctx, bson.M{"$or": []bson.M{{"username": username}, {"email": email}}})
}

// FindByStripeCustomerID resolves a Stripe customer id back to a user, used by
// the webhook to apply subscription state changes.
func (r *UserRepository) FindByStripeCustomerID(ctx context.Context, customerID string) (*models.User, error) {
	return r.findOne(ctx, bson.M{"subscription.stripeCustomerId": customerID})
}

// UpdateByID applies a $set partial update and refreshes updatedAt.
func (r *UserRepository) UpdateByID(ctx context.Context, id string, set bson.M) error {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return ErrNotFound
	}
	set["updatedAt"] = time.Now().UTC()
	res, err := r.col.UpdateByID(ctx, oid, bson.M{"$set": set})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *UserRepository) findOne(ctx context.Context, filter bson.M) (*models.User, error) {
	var u models.User
	err := r.col.FindOne(ctx, filter).Decode(&u)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
