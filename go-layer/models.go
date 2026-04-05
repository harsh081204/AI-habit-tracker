package journal

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Meta holds the metadata for a parsed journal entry.
type Meta struct {
	InputMode         string   `json:"input_mode" bson:"input_mode"`
	InferredProfile   *string  `json:"inferred_profile" bson:"inferred_profile"`
	Mood              *string  `json:"mood" bson:"mood"`
	ProductivityScore *float64 `json:"productivity_score" bson:"productivity_score"`
	Date              string   `json:"date" bson:"date"`
}

// Entry hold individual activity entries.
type Entry struct {
	Type         string                 `json:"type" bson:"type"`
	Status       string                 `json:"status" bson:"status"`
	TimeHint     *string                `json:"time_hint" bson:"time_hint"`
	DurationMins *int                   `json:"duration_mins" bson:"duration_mins"`
	Data         map[string]interface{} `json:"data" bson:"data"`
}

// SkillTouched represents a skill the user worked on.
type SkillTouched struct {
	Name     string  `json:"name" bson:"name"`
	Subtopic *string `json:"subtopic" bson:"subtopic"`
}

// ParsedJournal represents the unified extracted data from the AI parser.
type ParsedJournal struct {
	Meta          Meta           `json:"meta" bson:"meta"`
	Entries       []Entry        `json:"entries" bson:"entries"`
	SkillsTouched []SkillTouched `json:"skills_touched" bson:"skills_touched"`
	PeopleMet     []string       `json:"people_met" bson:"people_met"`
	PlacesVisited []string       `json:"places_visited" bson:"places_visited"`
}

// JournalDocument is the main record stored in MongoDB.
type JournalDocument struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID      primitive.ObjectID `json:"user_id" bson:"user_id"`
	Status      string             `json:"status" bson:"status"` // draft | processed
	RawText     string             `json:"raw_text" bson:"raw_text"`
	Parsed      *ParsedJournal     `json:"parsed,omitempty" bson:"parsed,omitempty"`
	JournalText string             `json:"journal_text,omitempty" bson:"journal_text,omitempty"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}
