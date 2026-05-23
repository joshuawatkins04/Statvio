// Package db owns the MongoDB connection and index setup.
package db

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Mongo wraps the connected client and the application database handle.
type Mongo struct {
	Client   *mongo.Client
	Database *mongo.Database
}

// Connect dials Atlas, verifies the connection with a ping, and ensures the
// required indexes exist. The database name is taken from the connection
// string; if the URI omits one we fall back to "test" (Mongoose's default).
func Connect(ctx context.Context, uri string, log *slog.Logger) (*Mongo, error) {
	connectCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(connectCtx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("connect mongo: %w", err)
	}

	if err := client.Ping(connectCtx, nil); err != nil {
		return nil, fmt.Errorf("ping mongo: %w", err)
	}

	dbName := databaseFromURI(uri)
	m := &Mongo{Client: client, Database: client.Database(dbName)}

	if err := m.ensureIndexes(ctx); err != nil {
		return nil, err
	}

	log.Info("connected to MongoDB", "database", dbName)
	return m, nil
}

// ensureIndexes creates the unique indexes that the Mongoose schema declared
// (username and email). Creating an existing index is a no-op.
func (m *Mongo) ensureIndexes(ctx context.Context) error {
	idxCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	users := m.Database.Collection("users")
	_, err := users.Indexes().CreateMany(idxCtx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		return fmt.Errorf("ensure user indexes: %w", err)
	}
	return nil
}

// Disconnect cleanly closes the client. Safe to call on a nil Mongo.
func (m *Mongo) Disconnect(ctx context.Context) {
	if m == nil || m.Client == nil {
		return
	}
	_ = m.Client.Disconnect(ctx)
}

// databaseFromURI extracts the default database name from a mongodb connection
// string, falling back to "test" when none is present.
func databaseFromURI(uri string) string {
	// Parse the path component manually: mongodb+srv://host/<db>?opts
	start := -1
	for i := 0; i < len(uri)-2; i++ {
		if uri[i] == '/' && uri[i+1] == '/' {
			start = i + 2
			break
		}
	}
	if start == -1 {
		return "test"
	}
	rest := uri[start:]
	slash := -1
	for i := 0; i < len(rest); i++ {
		if rest[i] == '/' {
			slash = i
			break
		}
	}
	if slash == -1 || slash+1 >= len(rest) {
		return "test"
	}
	name := rest[slash+1:]
	for i := 0; i < len(name); i++ {
		if name[i] == '?' {
			name = name[:i]
			break
		}
	}
	if name == "" {
		return "test"
	}
	return name
}
