package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"apigateway/internal/infrastructure/config"
	"apigateway/internal/infrastructure/logger"
	"apigateway/internal/presentation/handlers"
	"apigateway/internal/presentation/middleware"
	"apigateway/internal/presentation/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// @title SICORA API Gateway
// @version 2.0.0
// @description Gateway central para todos los microservicios de SICORA (Go Implementation)
// @termsOfService http://swagger.io/terms/

// @contact.name SICORA API Support
// @contact.url http://www.sicora.dev/support
// @contact.email support@sicora.dev

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8000
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	zapLogger, err := logger.NewLogger(cfg.LogLevel, cfg.Environment)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer zapLogger.Sync()

	// Set Gin mode based on environment
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	router := gin.New()

	// Add recovery middleware
	router.Use(gin.Recovery())

	// Configure CORS - SECURITY FIX: No permitir credentials con wildcard
	allowCredentials := true
	for _, origin := range cfg.CORSOrigins {
		if origin == "*" {
			// SECURITY: Wildcard + credentials = CSRF vulnerability
			allowCredentials = false
			log.Println("⚠️  WARNING: CORS wildcard detectado - deshabilitando credentials")
			break
		}
	}

	// SECURITY: Validar que hay origins configurados en producción
	if cfg.Environment == "production" && len(cfg.CORSOrigins) == 0 {
		log.Fatal("SECURITY ERROR: CORS_ORIGINS debe configurarse en producción")
	}

	corsConfig := cors.Config{
		AllowOrigins:     cfg.CORSOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: allowCredentials,
		MaxAge:           12 * time.Hour,
	}
	router.Use(cors.New(corsConfig))

	// Add custom middleware
	router.Use(middleware.RequestID())
	router.Use(middleware.SecurityHeaders())
	router.Use(middleware.Logger(zapLogger))
	router.Use(middleware.RateLimiter(cfg.RateLimit))

	// Create handlers
	healthHandler := handlers.NewHealthHandler(cfg)
	proxyHandler := handlers.NewProxyHandler(cfg, zapLogger)

	// Setup routes
	routes.SetupRoutes(router, cfg, zapLogger, healthHandler, proxyHandler)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	// Start server in goroutine
	go func() {
		zapLogger.Info("Starting API Gateway",
			"port", cfg.Port,
			"environment", cfg.Environment,
		)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			zapLogger.Fatal("Failed to start server", "error", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	zapLogger.Info("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		zapLogger.Fatal("Server forced to shutdown", "error", err)
	}

	zapLogger.Info("Server exited properly")
}
