package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"apigateway/internal/infrastructure/cache"
	"apigateway/internal/infrastructure/config"
	infraerrors "apigateway/internal/infrastructure/errors"
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

	// Initialize centralized error handling
	infraerrors.InitServiceContext()

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

	// Initialize Redis cache for distributed rate limiting and sessions
	stdLogger := log.New(os.Stdout, "[apigateway-cache] ", log.LstdFlags)
	gatewayCache, err := cache.NewAPIGatewayCacheFromEnv(stdLogger)
	if err != nil {
		// Log warning but continue - fall back to in-memory rate limiting
		zapLogger.Warn("Failed to initialize Redis cache, using in-memory fallback", "error", err)
		gatewayCache = nil
	} else {
		defer gatewayCache.Close()
		zapLogger.Info("Redis cache initialized for API Gateway")
	}

	// Initialize service setup (health checker + shutdown manager)
	serviceSetup := infraerrors.NewServiceSetup(gatewayCache)

	// Create middleware manager with cache
	var middlewareManager *middleware.MiddlewareManager
	if gatewayCache != nil {
		middlewareManager = middleware.NewMiddlewareManager(gatewayCache, cfg)
	}

	// Create Gin router
	router := gin.New()

	// Add V2 recovery middleware (centralized error handling)
	router.Use(infraerrors.RecoveryMiddlewareV2())

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

	// Add V2 middlewares (centralized error handling)
	router.Use(infraerrors.RequestContextMiddleware()) // Replaces middleware.RequestID()
	router.Use(middleware.SecurityHeaders())
	router.Use(infraerrors.LoggingMiddlewareV2()) // Replaces middleware.Logger(zapLogger)

	// Use Redis-based rate limiting if available, otherwise fall back to in-memory
	if middlewareManager != nil {
		router.Use(middlewareManager.RateLimiterRedis(cfg.RateLimit, 1*time.Minute))
		zapLogger.Info("Using Redis-based distributed rate limiting")
	} else {
		router.Use(middleware.RateLimiter(cfg.RateLimit))
		zapLogger.Info("Using in-memory rate limiting (single instance only)")
	}

	// Create handlers
	healthHandler := handlers.NewHealthHandler(cfg)
	proxyHandler := handlers.NewProxyHandler(cfg, zapLogger)

	// Setup routes with middleware manager for Redis-based auth
	// NOTE: Health routes are already registered in SetupRoutes via healthHandler
	routes.SetupRoutes(router, cfg, zapLogger, healthHandler, proxyHandler, middlewareManager)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	// Register HTTP server with shutdown manager (priority 100 = shutdown last)
	serviceSetup.ShutdownManager.Register("http-server", 100, func(ctx context.Context) error {
		return srv.Shutdown(ctx)
	})

	// Register Redis cache with shutdown manager (priority 50 = shutdown before http)
	if gatewayCache != nil {
		serviceSetup.ShutdownManager.Register("redis-cache", 50, func(ctx context.Context) error {
			gatewayCache.Close()
			return nil
		})
	}

	// Start server
	zapLogger.Info("Starting API Gateway",
		"port", cfg.Port,
		"environment", cfg.Environment,
	)

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		zapLogger.Fatal("Failed to start server", "error", err)
	}
}
