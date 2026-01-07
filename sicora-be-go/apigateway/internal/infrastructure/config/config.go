package config

import (
	"fmt"
	"log"
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

	environment := getEnv("ENVIRONMENT", "development")

	// SECURITY FIX: JWT_SECRET obligatorio en producción
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		if environment == "production" {
			return nil, fmt.Errorf("SECURITY ERROR: JWT_SECRET es OBLIGATORIO en producción")
		}
		// Solo en desarrollo usar default con warning
		log.Println("⚠️  WARNING: Usando JWT_SECRET por defecto - NO usar en producción")
		jwtSecret = "dev-only-unsafe-secret-key-32chars!"
	}

	// SECURITY: Validar longitud mínima del secret (32 caracteres)
	if len(jwtSecret) < 32 {
		return nil, fmt.Errorf("SECURITY ERROR: JWT_SECRET debe tener mínimo 32 caracteres (actual: %d)", len(jwtSecret))
	}

	// SECURITY FIX: CORS restrictivo en producción
	defaultCORS := []string{"http://localhost:3000", "http://localhost:5173"}
	if environment == "production" {
		defaultCORS = []string{} // En producción DEBE configurarse explícitamente
	}

	cfg := &Config{
		Port:          getEnv("PORT", "8000"),
		Environment:   environment,
		LogLevel:      getEnv("LOG_LEVEL", "info"),
		ReadTimeout:   getDurationEnv("READ_TIMEOUT", 30*time.Second),
		WriteTimeout:  getDurationEnv("WRITE_TIMEOUT", 30*time.Second),
		IdleTimeout:   getDurationEnv("IDLE_TIMEOUT", 60*time.Second),
		CORSOrigins:   getSliceEnv("CORS_ORIGINS", defaultCORS),
		RateLimit:     getIntEnv("RATE_LIMIT", 100),
		JWTSecret:     jwtSecret,
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
