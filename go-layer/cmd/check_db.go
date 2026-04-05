package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Setup DB just like your db layer
	uri := "mongodb+srv://2k23cs2313856_db_user:eOD088rMWMaLGen9@ai-habittracker-cluster.41xu1rq.mongodb.net/ai_habit_tracker?retryWrites=true&w=majority&appName=AIHabitTracker&tls=true"
	clientOpts := options.Client().ApplyURI(uri)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	col := client.Database("ai_habit_tracker").Collection("journals_go_test")

	// Let's pull the most recently processed journal entry
	opts := options.FindOne().SetSort(bson.D{{Key: "created_at", Value: -1}})
	
	var result bson.M
	err = col.FindOne(ctx, bson.M{"status": "processed"}, opts).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Fatal("No documents found! It looks like there's nothing saved yet.")
		}
		log.Fatal(err)
	}

	// Unmarshal and identically print the result saved in DB natively through BSON unbundling
	formattedJSON, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Here is the document exactly as it is stored in your MongoDB cluster right now:")
	fmt.Println(string(formattedJSON))
}
