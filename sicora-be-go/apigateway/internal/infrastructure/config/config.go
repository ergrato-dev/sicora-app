package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the API Gateway
type Config struct {
	// Server settings
	Port         string
	Environment  string
	LogLevel     string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration

	// CORS settings
	CORSOrigins []string

	// Rate limiting
	RateLimit int

	// JWT settings
	JWTSecret     string
	JWTExpiration time.Duration

	// Service URLs
	Services map[string]string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if exists
	_ = godotenv.Load()

	cfg := &Config{
		Port:          getEnv("PORT", "8000"),
		Environment:   getEnv("ENVIRONMENT", "development"),
		LogLevel:      getEnv("LOG_LEVEL", "info"),
		ReadTimeout:   getDurationEnv("READ_TIMEOUT", 30*time.Second),
		WriteTimeout:  getDurationEnv("WRITE_TIMEOUT", 30*time.Second),
		IdleTimeout:   getDurationEnv("IDLE_TIMEOUT", 60*time.Second),
		CORSOrigins:   getSliceEnv("CORS_ORIGINS", []string{"*"}),
		RateLimit:     getIntEnv("RATE_LIMIT", 100),
		JWTSecret:     getEnv("JWT_SECRET", "sicora-secret-key-change-in-production"),
		JWTExpiration: getDurationEnv("JWT_EXPIRATION", 24*time.Hour),
		Services:      loadServiceURLs(),
	}

	return cfg, nil
}

// loadServiceURLs loads all microservice URLs from environment
func loadServiceURLs() map[string]string {
	return map[string]string{
		"userservice":        getEnv("USERSERVICE_URL", "http://localhost:8001"),
		"scheduleservice":    getEnv("SCHEDULESERVICE_URL", "http://localhost:8002"),
		"attendanceservice":  getEnv("ATTENDANCESERVICE_URL", "http://localhost:8003"),
		"evalinservice":      getEnv("EVALINSERVICE_URL", "http://localhost:8004"),
		"kbservice":          getEnv("KBSERVICE_URL", "http://localhost:8005"),
		"aiservice":          getEnv("AISERVICE_URL", "http://localhost:8006"),
		"projectevalservice": getEnv("PROJECTEVALSERVICE_URL", "http://localhost:8007"),
		"mevalservice":       getEnv("MEVALSERVICE_URL", "http://localhost:8008"),
	}
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getSliceEnv(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}
	return defaultValue
}
