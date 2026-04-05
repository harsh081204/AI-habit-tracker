package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FirstName    string             `bson:"first_name" json:"firstName"`
	LastName     string             `bson:"last_name" json:"lastName"`
	Email        string             `bson:"email" json:"email"`
	PasswordHash string             `bson:"password_hash" json:"-"`
	CreatedAt    time.Time          `bson:"created_at" json:"createdAt"`
}

type Activity struct {
	Type   string `bson:"type" json:"type"`
	Title  string `bson:"title" json:"title"`
	Meta   string `bson:"meta" json:"meta"`
	Status string `bson:"status" json:"status"`
}

type JournalEntry struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"userId"`
	Date      time.Time          `bson:"date" json:"date"`
	Title     string             `bson:"title" json:"title"`
	RawText   string             `bson:"raw_text" json:"rawText"`
	Processed bool               `bson:"processed" json:"processed"`
	
	// AI Generated Fields
	Narrative       string    `bson:"narrative" json:"narrative"`
	Mood            string    `bson:"mood" json:"mood"`
	Score           float64   `bson:"score" json:"score"`
	Skills          []string  `bson:"skills" json:"skills"`
	People          []string  `bson:"people" json:"people"`
	Places          []string  `bson:"places" json:"places"`
	ActivityEntries []Activity `bson:"activity_entries" json:"activityEntries"`
	
	CreatedAt time.Time `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time `bson:"updated_at" json:"updatedAt"`
}
