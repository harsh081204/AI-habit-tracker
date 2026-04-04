package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/harsh081204/ai-habit-tracker/backend/database"
	"github.com/harsh081204/ai-habit-tracker/backend/handlers"
	"github.com/harsh081204/ai-habit-tracker/backend/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load Environment Variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system variables")
	}

	// 2. Initialize Database
	database.InitDB()

	// 3. Setup Router
	r := gin.Default()

	// 4. Global Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 5. Auth Routes (Public)
	auth := r.Group("/auth")
	{
		auth.POST("/signup", handlers.Signup)
		auth.POST("/login", handlers.Login)
		auth.POST("/logout", handlers.Logout)
	}

	// 6. Protected Routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/me", handlers.GetMe)
		
		// Journal Routes
		journals := api.Group("/journals")
		{
			journals.GET("", handlers.ListEntries)
			journals.POST("", handlers.CreateEntry)
			journals.GET("/:id", handlers.GetEntry)
			journals.PATCH("/:id", handlers.UpdateEntry)
			// AI Submission
			journals.POST("/:id/submit", handlers.SubmitEntry)
		}
	}

	// 7. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Go Backend running on http://localhost:%s", port)
	r.Run(":" + port)
}
