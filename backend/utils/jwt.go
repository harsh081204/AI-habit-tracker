package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var secretKey = []byte(os.Getenv("JWT_SECRET"))

func GenerateToken(userID primitive.ObjectID) (string, error) {
	if len(secretKey) == 0 {
		secretKey = []byte("default-development-secret-key-12345")
	}

	claims := jwt.MapClaims{
		"userId": userID.Hex(),
		"exp":    time.Now().Add(time.Hour * 24).Unix(), // 24 hours
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

func ValidateToken(tokenString string) (string, error) {
	if len(secretKey) == 0 {
		secretKey = []byte("default-development-secret-key-12345")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil || !token.Valid {
		return "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", err
	}

	return claims["userId"].(string), nil
}
