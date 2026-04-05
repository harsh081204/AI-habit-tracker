package journal

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AutosaveDraft updates or inserts the raw_text as a draft into the DB.
func AutosaveDraft(ctx context.Context, col *mongo.Collection, docID primitive.ObjectID, userID primitive.ObjectID, rawText string) (*JournalDocument, error) {
	now := time.Now().UTC()

	if docID == primitive.NilObjectID {
		doc := JournalDocument{
			ID:        primitive.NewObjectID(),
			UserID:    userID,
			Status:    "draft",
			RawText:   rawText,
			CreatedAt: now,
			UpdatedAt: now,
		}
		
		_, err := col.InsertOne(ctx, doc)
		if err != nil {
			return nil, fmt.Errorf("failed to insert new draft: %w", err)
		}
		return &doc, nil
	}

	filter := bson.M{"_id": docID, "user_id": userID}
	update := bson.M{
		"$set": bson.M{
			"raw_text":   rawText,
			"updated_at": now,
		},
	}

	var updatedDoc JournalDocument
	err := col.FindOneAndUpdate(ctx, filter, update).Decode(&updatedDoc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("document not found or unauthorized")
		}
		return nil, fmt.Errorf("failed to update draft: %w", err)
	}

	updatedDoc.RawText = rawText
	updatedDoc.UpdatedAt = now
	return &updatedDoc, nil
}

// SubmitJournal processes the journal entry using Python AI and saves the completed state.
func SubmitJournal(ctx context.Context, col *mongo.Collection, docID primitive.ObjectID, userID primitive.ObjectID, rawText string, userProfile *string) (*JournalDocument, error) {
	// Call Python Processor (The Bridge)
	pythonResp, err := CallPythonProcessor(ctx, rawText, userProfile)
	if err != nil {
		return nil, fmt.Errorf("python processing failed: %w", err)
	}

	now := time.Now().UTC()
	filter := bson.M{"_id": docID, "user_id": userID}
	update := bson.M{
		"$set": bson.M{
			"status":       "processed",
			"parsed":       pythonResp.Parsed,
			"journal_text": pythonResp.JournalText,
			"raw_text":     rawText,
			"updated_at":   now,
		},
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var finalDoc JournalDocument
	err = col.FindOneAndUpdate(ctx, filter, update, opts).Decode(&finalDoc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("document not found or unauthorized")
		}
		return nil, fmt.Errorf("failed to update document with processed data: %w", err)
	}

	return &finalDoc, nil
}
