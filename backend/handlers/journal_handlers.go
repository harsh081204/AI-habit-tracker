package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/harsh081204/ai-habit-tracker/backend/database"
	"github.com/harsh081204/ai-habit-tracker/backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func CreateEntry(c *gin.Context) {
	userId, _ := c.Get("userId")
	userIdObj, _ := primitive.ObjectIDFromHex(userId.(string))

	newEntry := models.JournalEntry{
		ID:        primitive.NewObjectID(),
		UserID:    userIdObj,
		Date:      time.Now(),
		Title:     "New entry draft",
		RawText:   "",
		Processed: false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := database.Journals.InsertOne(context.TODO(), newEntry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create journal draft"})
		return
	}

	c.JSON(http.StatusCreated, newEntry)
}

func UpdateEntry(c *gin.Context) {
	userId, _ := c.Get("userId")
	userIdObj, _ := primitive.ObjectIDFromHex(userId.(string))
	
	idStr := c.Param("id")
	entryIdObj, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entry ID"})
		return
	}

	var req struct {
		RawText string `json:"rawText"`
		Title   string `json:"title"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid update data"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"raw_text":   req.RawText,
			"title":      req.Title,
			"updated_at": time.Now(),
		},
	}

	// SECURITY: Ensure the user owns this entry (from EdgeCases.md part 4)
	res, err := database.Journals.UpdateOne(
		context.TODO(),
		bson.M{"_id": entryIdObj, "user_id": userIdObj},
		update,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database update failed"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Journal entry not found or unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Entry updated successfully"})
}

func ListEntries(c *gin.Context) {
	userId, _ := c.Get("userId")
	userIdObj, _ := primitive.ObjectIDFromHex(userId.(string))

	opts := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})
	
	// SECURITY: Scoped filter (fixed from EdgeCases.md part 4)
	cursor, err := database.Journals.Find(context.TODO(), bson.M{"user_id": userIdObj}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch journals"})
		return
	}
	defer cursor.Close(context.TODO())

	var entries []models.JournalEntry
	if err = cursor.All(context.TODO(), &entries); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results"})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func GetEntry(c *gin.Context) {
	userId, _ := c.Get("userId")
	userIdObj, _ := primitive.ObjectIDFromHex(userId.(string))
	
	idStr := c.Param("id")
	entryIdObj, _ := primitive.ObjectIDFromHex(idStr)

	var entry models.JournalEntry
	err := database.Journals.FindOne(context.TODO(), bson.M{"_id": entryIdObj, "user_id": userIdObj}).Decode(&entry)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Journal entry not found or unauthorized"})
		return
	}

	c.JSON(http.StatusOK, entry)
}

// AI ORCHESTRATION: Bridge to Python Service
func SubmitEntry(c *gin.Context) {
	userId, _ := c.Get("userId")
	userIdObj, _ := primitive.ObjectIDFromHex(userId.(string))

	idStr := c.Param("id")
	entryIdObj, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entry ID"})
		return
	}

	// 1. Fetch current entry
	var entry models.JournalEntry
	err = database.Journals.FindOne(context.TODO(), bson.M{"_id": entryIdObj, "user_id": userIdObj}).Decode(&entry)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found"})
		return
	}

	if entry.RawText == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Journal text is empty"})
		return
	}

	// 2. Call Python AI processor
	pythonURL := os.Getenv("PYTHON_AI_URL")
	if pythonURL == "" {
		pythonURL = "http://localhost:8000/api/journal"
	}

	// Prepare payload for Python
	payload := map[string]string{
		"raw_text": entry.RawText,
		"user_id":  userId.(string),
	}
	jsonPayload, _ := json.Marshal(payload)

	// Make request
	resp, err := http.Post(pythonURL, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI Processing service is offline"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI Processing failed"})
		return
	}

	// Read results
	body, _ := io.ReadAll(resp.Body)
	var aiResults map[string]interface{}
	json.Unmarshal(body, &aiResults)

	// Extract the "journal_text" (narrative) and "parsed" data
	narrative, _ := aiResults["journal_text"].(string)
	parsedData, _ := aiResults["parsed"].(map[string]interface{})
	
	meta, _ := parsedData["meta"].(map[string]interface{})
	mood, _ := meta["mood"].(string)
	score, _ := meta["productivity_score"].(float64)

	// 3. Update entry with results
	update := bson.M{
		"$set": bson.M{
			"processed":  true,
			"narrative":  narrative,
			"mood":       mood,
			"score":      score,
			"updated_at": time.Now(),
		},
	}
	
	_, err = database.Journals.UpdateOne(context.TODO(), bson.M{"_id": entryIdObj}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save AI results to DB"})
		return
	}

	// Fetch fresh copy with AI results
	database.Journals.FindOne(context.TODO(), bson.M{"_id": entryIdObj}).Decode(&entry)
	c.JSON(http.StatusOK, entry)
}
