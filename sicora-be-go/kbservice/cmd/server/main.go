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
	infraerrors "kbservice/internal/infrastructure/errors"
	"kbservice/internal/infrastructure/repositories"
	"kbservice/internal/presentation/handlers"
	"kbservice/internal/presentation/middleware"
	"kbservice/internal/presentation/routes"

	apperrors "sicora-be-go/pkg/errors"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Initialize error handling context
	env := getEnv("GIN_MODE", "debug")
	infraerrors.InitServiceContext("1.0.0", env)

	// Determine if development mode
	isDev := env != "release"

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

	// Run migrations
	log.Println("Running database migrations...")
	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repositories
	db := database.GetDB()

	// Setup service components (logger, health checker, shutdown manager)
	serviceSetup := infraerrors.NewServiceSetup(db, isDev)

	// Register database cleanup in shutdown manager
	serviceSetup.ShutdownManager.Register("database", 1, func(ctx context.Context) error {
		database.Close()
		return nil
	})

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

	// Setup router with V2 middlewares
	router := setupRouter(serviceSetup.Logger)
	routes.SetupDocumentRoutes(router, documentHandler)
	routes.SetupFAQRoutes(router, faqHandler)
	routes.SetupAnalyticsRoutes(router, analyticsHandler)

	// Register health routes (replaces old /health endpoint)
	infraerrors.RegisterHealthRoutes(router, serviceSetup.HealthChecker)

	// Server configuration
	port := getEnv("PORT", "8080")
	server := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Register server shutdown
	serviceSetup.ShutdownManager.Register("http-server", 10, func(ctx context.Context) error {
		return server.Shutdown(ctx)
	})

	// Setup signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Start server in goroutine
	go func() {
		serviceSetup.Logger.Info(context.Background(), "KBService starting",
			apperrors.Str("port", port),
			apperrors.Str("environment", env),
		)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serviceSetup.Logger.Fatal(context.Background(), "Failed to start server", err)
		}
	}()

	// Wait for shutdown signal
	<-sigChan
	serviceSetup.Logger.Info(context.Background(), "Shutdown signal received, closing services...")

	// Execute graceful shutdown
	if err := serviceSetup.ShutdownManager.Shutdown(); err != nil {
		serviceSetup.Logger.Error(context.Background(), "Shutdown completed with errors", err)
	} else {
		serviceSetup.Logger.Info(context.Background(), "KBService shutdown completed successfully")
	}
}

func setupRouter(logger apperrors.Logger) *gin.Engine {
	// Set gin mode
	if getEnv("GIN_MODE", "debug") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// SECURITY: Rate limiting - 30 req/min por IP
	rateLimiter := middleware.NewRateLimiter(30, time.Minute)

	// Apply V2 middlewares first
	router.Use(infraerrors.RequestContextMiddleware())
	router.Use(infraerrors.RecoveryMiddlewareV2(logger))
	router.Use(infraerrors.LoggingMiddlewareV2(logger))

	// SECURITY: Middleware en orden correcto
	router.Use(middleware.RequestID())
	router.Use(middleware.SecurityHeaders())
	router.Use(rateLimiter.RateLimitMiddleware())

	// CORS middleware - SECURITY: Origen específico en producción
	// SecureCORS lee ALLOWED_ORIGINS de env automáticamente
	router.Use(middleware.SecureCORS())

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
