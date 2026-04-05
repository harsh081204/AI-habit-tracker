package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/harsh/ai-habit-tracker-go" // Assuming the go mod is named github.com/harsh/ai-habit-tracker-go and the files are at root
)

func main() {
	// 1. Setup DB
	uri := "mongodb+srv://2k23cs2313856_db_user:eOD088rMWMaLGen9@ai-habittracker-cluster.41xu1rq.mongodb.net/ai_habit_tracker?retryWrites=true&w=majority&appName=AIHabitTracker&tls=true"
	clientOpts := options.Client().ApplyURI(uri)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	db := client.Database("ai_habit_tracker")
	col := db.Collection("journals_go_test") // Use a test collection

	// 2. Mock Frontend Action - User types something (Autosave)
	fmt.Println("Mocking frontend: Autosaving draft...")
	userID := primitive.NewObjectID()
	rawText := "woke up late today around 10am because I stayed up doing leetcode graph problems. Had coffee and then went to the gym. did shoulders. read a bit about system design load balancers and now going to bed."

	draftDoc, err := journal.AutosaveDraft(ctx, col, primitive.NilObjectID, userID, rawText)
	if err != nil {
		log.Fatalf("Autosave failed: %v", err)
	}
	fmt.Printf("Draft saved with ID: %s, Status: %s\n", draftDoc.ID.Hex(), draftDoc.Status)

	// 3. Mock Frontend Action - User Clicks Submit (Triggers Python ML Bridge)
	fmt.Println("\nMocking frontend: Clicking Submit (Routing to Python for parsing)...")
	profile := "backend engineer"
	
	processedDoc, err := journal.SubmitJournal(ctx, col, draftDoc.ID, userID, rawText, &profile)
	if err != nil {
		log.Fatalf("Submit failed: %v", err)
	}

	// 4. Verification output
	fmt.Println("\n=== Final Processed Document ===")
	fmt.Printf("ID: %s\n", processedDoc.ID.Hex())
	fmt.Printf("Status: %s\n", processedDoc.Status)
	fmt.Printf("Generated Journal Text:\n%s\n", processedDoc.JournalText)
	
	fmt.Println("\nEntities Parsed:")
	if len(processedDoc.Parsed.SkillsTouched) > 0 {
		fmt.Printf("  Skills Touched:\n")
		for _, s := range processedDoc.Parsed.SkillsTouched {
			topic := "null"
			if s.Subtopic != nil {
				topic = *s.Subtopic
			}
			fmt.Printf("   - %s (%s)\n", s.Name, topic)
		}
	}
	if processedDoc.Parsed.Meta.ProductivityScore != nil {
		fmt.Printf("  Calculated Score: %.1f\n", *processedDoc.Parsed.Meta.ProductivityScore)
	}
}
