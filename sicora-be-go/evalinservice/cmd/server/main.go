package main

import (
	"context"
	_ "evalinservice/docs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"evalinservice/configs"
	"evalinservice/internal/infrastructure/database"
	infraerrors "evalinservice/internal/infrastructure/errors"
	"evalinservice/internal/presentation/handlers"

	apperrors "sicora-be-go/pkg/errors"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// @title EvalinService API
// @version 1.0
// @description Microservicio para evaluación de instructores - SICORA-APP
// @termsOfService http://swagger.io/terms/

// @contact.name SICORA Dev Team
// @contact.url http://sicora.sena.edu.co
// @contact.email sicora@sena.edu.co

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8004
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Inicializar configuración
	cfg := configs.LoadConfig()

	// Initialize error handling context
	infraerrors.InitServiceContext("1.0.0", cfg.Environment)

	// Determine if development mode
	isDev := cfg.Environment == "development"

	// Inicializar base de datos
	dbConfig := database.DatabaseConfig{
		Host:     cfg.DatabaseHost,
		Port:     cfg.DatabasePort,
		User:     cfg.DatabaseUser,
		Password: cfg.DatabasePassword,
		DBName:   cfg.DatabaseName,
		SSLMode:  cfg.DatabaseSSLMode,
	}

	err := database.Connect(dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Ejecutar migraciones
	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Obtener instancia de DB
	db := database.GetDB()

	// Setup service components (logger, health checker, shutdown manager)
	serviceSetup := infraerrors.NewServiceSetup(db, isDev)

	// Register database cleanup in shutdown manager
	serviceSetup.ShutdownManager.Register("database", 1, func(ctx context.Context) error {
		return database.Close()
	})

	// Crear usecases (simplificado para compilación inicial)
	useCases := &handlers.UseCaseContainer{
		// Usecases vacíos por ahora - se implementarán en la siguiente iteración
		Evaluation:    nil,
		Question:      nil,
		Questionnaire: nil,
		Period:        nil,
		Comment:       nil,
		Report:        nil,
		Config:        nil,
		Notification:  nil,
	}

	// Crear router config (using legacy logrus for compatibility)
	routerConfig := &handlers.RouterConfig{
		Logger:      nil, // Will be set up differently
		JWTSecret:   cfg.JWTSecret,
		Environment: cfg.Environment,
	}

	// Crear handlers
	handlerContainer := handlers.NewHandlerContainer(nil, useCases)

	// Configurar Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Crear router con middlewares V2
	router := gin.New()
	router.Use(infraerrors.RequestContextMiddleware())
	router.Use(infraerrors.RecoveryMiddlewareV2(serviceSetup.Logger))
	router.Use(infraerrors.LoggingMiddlewareV2(serviceSetup.Logger))

	// Configurar rutas
	handlers.SetupRoutes(router, routerConfig, handlerContainer)

	// Register health routes
	infraerrors.RegisterHealthRoutes(router, serviceSetup.HealthChecker)

	// Obtener puerto
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.ServerPort
	}

	// Create HTTP server for graceful shutdown
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
		serviceSetup.Logger.Info(context.Background(), "EvalinService starting",
			apperrors.Str("port", port),
			apperrors.Str("environment", cfg.Environment),
			apperrors.Str("swagger", "http://localhost:"+port+"/swagger/index.html"),
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
		serviceSetup.Logger.Info(context.Background(), "EvalinService shutdown completed successfully")
	}
}
