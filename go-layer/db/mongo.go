package db

import (
	"context"
	"fmt"
	"log"
	"os"
	// "time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	client *mongo.Client
	dbName string
)

// ConnectDB establishes the MongoDB connection pool
func ConnectDB(ctx context.Context) error {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		return fmt.Errorf("MONGO_URI environment variable is not set")
	}

	dbName = os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		// Fallback as described in the API architecture
		dbName = "ai_habit_tracker"
	}

	clientOpts := options.Client().ApplyURI(uri)
	var err error
	client, err = mongo.Connect(ctx, clientOpts)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Ping the DB to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	log.Printf("[DB] Connected to MongoDB \u2192 %s", dbName)
	return nil
}

// DisconnectDB shuts down the DB connection pool cleanly
func DisconnectDB(ctx context.Context) {
	if client != nil {
		if err := client.Disconnect(ctx); err != nil {
			log.Printf("[DB] Error disconnecting MongoDB: %v", err)
		} else {
			log.Println("[DB] MongoDB connection closed")
		}
	}
}

// GetDB returns the main database handle
func GetDB() *mongo.Database {
	if client == nil {
		log.Fatal("GetDB called but client is nil (not connected)")
	}
	return client.Database(dbName)
}

// GetJournalsCollection returns the collection handle for Journals mode
func GetJournalsCollection() *mongo.Collection {
	return GetDB().Collection("journals")
}

// GetUsersCollection returns the collection handle for Users
func GetUsersCollection() *mongo.Collection {
	return GetDB().Collection("users")
}
