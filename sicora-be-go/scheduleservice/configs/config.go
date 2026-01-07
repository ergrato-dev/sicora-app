package configs

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Redis    RedisConfig
}

// RedisConfig holds Redis cache configuration
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
	Enabled  bool
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port         string
	Mode         string
	ReadTimeout  int
	WriteTimeout int
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	Schema   string
	LogLevel string
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	SecretKey      string
	ExpirationTime int
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		Server: ServerConfig{
			Port:         getEnvOrDefault("SERVER_PORT", "8002"),
			Mode:         getEnvOrDefault("SERVER_MODE", "debug"),
			ReadTimeout:  15,
			WriteTimeout: 15,
		},
		Database: DatabaseConfig{
			Host:     getEnvOrDefault("DB_HOST", "localhost"),
			Port:     getEnvOrDefault("DB_PORT", "5432"),
			User:     getEnvOrDefault("DB_USER", "postgres"),
			Password: getEnvOrDefault("DB_PASSWORD", "postgres"),
			Name:     getEnvOrDefault("DB_NAME", "scheduleservice_db"),
			Schema:   getEnvOrDefault("DB_SCHEMA", "public"),
			LogLevel: getEnvOrDefault("DB_LOG_LEVEL", "silent"),
		},
		JWT: JWTConfig{
			SecretKey:      getEnvOrDefault("JWT_SECRET_KEY", "your-256-bit-secret"),
			ExpirationTime: 24, // 24 hours
		},
		Redis: RedisConfig{
			Host:     getEnvOrDefault("REDIS_HOST", "localhost"),
			Port:     getEnvOrDefault("REDIS_PORT", "6379"),
			Password: getEnvOrDefault("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
			Enabled:  getEnvBool("REDIS_ENABLED", true),
		},
	}
}

// getEnvOrDefault gets environment variable or returns default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvBool gets environment variable as bool
func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		b, err := strconv.ParseBool(value)
		if err != nil {
			return defaultValue
		}
		return b
	}
	return defaultValue
}

// getEnvInt gets environment variable as int
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		i, err := strconv.Atoi(value)
		if err != nil {
			return defaultValue
		}
		return i
	}
	return defaultValue
}
