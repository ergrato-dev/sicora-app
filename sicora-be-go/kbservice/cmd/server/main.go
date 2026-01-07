package main

// @title           SICORA kbservice API
// @version         1.0
// @description     Microservicio kbservice del Sistema de Información de Coordinación Académica (SICORA) - SENA
// @termsOfService  http://swagger.io/terms/

// @contact.name   Equipo de Desarrollo SICORA
// @contact.email  dev@sicora.sena.edu.co

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:8000
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

import (
	"context"
	_ "kbservice/docs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"kbservice/internal/application/usecases"
	"kbservice/internal/infrastructure/database"
	"kbservice/internal/infrastructure/repositories"
	"kbservice/internal/presentation/handlers"
	"kbservice/internal/presentation/middleware"
	"kbservice/internal/presentation/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Database configuration
	dbConfig := database.Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", ""),
		DBName:   getEnv("DB_NAME", "sicora_kb"),
		SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		TimeZone: getEnv("DB_TIMEZONE", "UTC"),
	}

	// Connect to database
	log.Println("Connecting to database...")
	if err := database.Connect(dbConfig); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	log.Println("Running database migrations...")
	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repositories
	db := database.GetDB()
	documentRepo := repositories.NewDocumentRepository(db)
	faqRepo := repositories.NewFAQRepository(db)
	analyticsRepo := repositories.NewAnalyticsRepository(db)

	// Initialize use cases
	// Note: AIService and SearchService would be implemented separately
	documentUseCase := usecases.NewDocumentUseCase(
		documentRepo,
		analyticsRepo,
		nil, // aiService
		nil, // searchService
	)

	// TODO: Initialize FAQ and Analytics use cases when ready
	_ = faqRepo // Temporary to avoid unused variable error

	// Initialize handlers
	documentHandler := handlers.NewDocumentHandler(documentUseCase)
	faqHandler := handlers.NewFAQHandler()
	analyticsHandler := handlers.NewAnalyticsHandler()

	// Setup router
	router := setupRouter()
	routes.SetupDocumentRoutes(router, documentHandler)
	routes.SetupFAQRoutes(router, faqHandler)
	routes.SetupAnalyticsRoutes(router, analyticsHandler)

	// Server configuration
	port := getEnv("PORT", "8080")
	server := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

func setupRouter() *gin.Engine {
	// Set gin mode
	if getEnv("GIN_MODE", "debug") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// SECURITY: Rate limiting - 30 req/min por IP
	rateLimiter := middleware.NewRateLimiter(30, time.Minute)

	// SECURITY: Middleware en orden correcto
	router.Use(middleware.RequestID())
	router.Use(middleware.SecurityHeaders())
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(rateLimiter.RateLimitMiddleware())

	// CORS middleware - SECURITY: Origen específico en producción
	// SecureCORS lee ALLOWED_ORIGINS de env automáticamente
	router.Use(middleware.SecureCORS())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		if err := database.HealthCheck(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "unhealthy",
				"error":  err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "kbservice",
			"version":   "1.0.0",
			"timestamp": time.Now().UTC(),
		})
	})

	// API version group (reserved for future use)
	// v1 := router.Group("/api/v1")
	return router
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
