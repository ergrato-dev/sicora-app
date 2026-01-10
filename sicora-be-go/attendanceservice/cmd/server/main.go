package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"attendanceservice/configs"
	"attendanceservice/internal/application/services"
	"attendanceservice/internal/application/usecases"
	"attendanceservice/internal/infrastructure/database"
	"attendanceservice/internal/infrastructure/database/repositories"
	infraerrors "attendanceservice/internal/infrastructure/errors"
	"attendanceservice/internal/presentation/handlers"
	"attendanceservice/internal/presentation/routes"

	apperrors "sicora-be-go/pkg/errors"

	_ "attendanceservice/docs"
)

// @title AttendanceService API
// @version 1.0
// @description API para la gestión de asistencia, justificaciones y alertas del sistema SICORA
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8003
// @BasePath /
// @schemes http https

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Cargar configuración
	config, err := configs.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize error handling context
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}
	infraerrors.InitServiceContext("1.0.0", env)

	// Determine if development mode
	isDev := env == "development"

	// Configurar base de datos
	dbConfig := database.Config{
		Host:     config.Database.Host,
		Port:     config.Database.Port,
		User:     config.Database.User,
		Password: config.Database.Password,
		DBName:   config.Database.DBName,
		Schema:   config.Database.Schema,
		SSLMode:  config.Database.SSLMode,
	}

	db, err := database.NewDatabase(dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Crear schema y ejecutar migraciones
	if err := db.CreateSchema(config.Database.Schema); err != nil {
		log.Fatalf("Failed to create schema: %v", err)
	}

	if err := db.AutoMigrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Setup service components (logger, health checker, shutdown manager)
	serviceSetup := infraerrors.NewServiceSetup(db.DB, isDev)

	// Register database cleanup in shutdown manager
	serviceSetup.ShutdownManager.Register("database", 1, func(ctx context.Context) error {
		return db.Close()
	})

	// Inicializar repositorios
	attendanceRepo := repositories.NewAttendanceRepository(db.DB)
	justificationRepo := repositories.NewJustificationRepository(db.DB)
	alertRepo := repositories.NewAttendanceAlertRepository(db.DB)
	qrCodeRepo := repositories.NewQRCodeRepository(db.DB)

	// Inicializar casos de uso
	attendanceUseCase := usecases.NewAttendanceUseCase(attendanceRepo, alertRepo)
	justificationUseCase := usecases.NewJustificationUseCase(justificationRepo, attendanceRepo)
	alertUseCase := usecases.NewAlertUseCase(alertRepo)
	qrCodeUseCase := usecases.NewQRCodeUseCase(qrCodeRepo, attendanceRepo)

	// Inicializar handlers
	attendanceHandler := handlers.NewAttendanceHandler(attendanceUseCase)
	justificationHandler := handlers.NewJustificationHandler(justificationUseCase)
	alertHandler := handlers.NewAlertHandler(alertUseCase)
	qrCodeHandler := handlers.NewQRCodeHandler(qrCodeUseCase)
	healthHandler := handlers.NewHealthHandler()

	// Configurar rutas con middlewares V2
	router := routes.SetupRoutes(
		config,
		attendanceHandler,
		justificationHandler,
		alertHandler,
		qrCodeHandler,
		healthHandler,
	)

	// Apply V2 middlewares
	router.Use(infraerrors.RequestContextMiddleware())
	router.Use(infraerrors.RecoveryMiddlewareV2(serviceSetup.Logger))
	router.Use(infraerrors.LoggingMiddlewareV2(serviceSetup.Logger))

	// Health routes already registered in routes.SetupRoutes()

	// Crear contexto para el servicio programador
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Inicializar y arrancar el servicio programador de códigos QR
	qrScheduler := services.NewQRSchedulerService(qrCodeRepo, qrCodeUseCase)
	go qrScheduler.Start(ctx)

	// Configurar manejo de señales para shutdown graceful
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Create HTTP server for graceful shutdown
	server := &http.Server{
		Addr:    config.GetServerAddress(),
		Handler: router,
	}

	// Register server shutdown
	serviceSetup.ShutdownManager.Register("http-server", 10, func(ctx context.Context) error {
		return server.Shutdown(ctx)
	})

	// Register QR scheduler shutdown
	serviceSetup.ShutdownManager.Register("qr-scheduler", 5, func(ctx context.Context) error {
		qrScheduler.Stop()
		cancel()
		return nil
	})

	// Iniciar servidor en una goroutine
	go func() {
		serviceSetup.Logger.Info(ctx, "AttendanceService starting",
			apperrors.Str("address", config.GetServerAddress()),
			apperrors.Str("swagger", "http://"+config.GetServerAddress()+"/swagger/index.html"),
		)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serviceSetup.Logger.Fatal(ctx, "Failed to start server", err)
		}
	}()

	// Esperar señal de terminación
	<-sigChan
	serviceSetup.Logger.Info(ctx, "Shutdown signal received, closing services...")

	// Execute graceful shutdown
	if err := serviceSetup.ShutdownManager.Shutdown(); err != nil {
		serviceSetup.Logger.Error(ctx, "Shutdown completed with errors", err)
	} else {
		serviceSetup.Logger.Info(ctx, "AttendanceService shutdown completed successfully")
	}
}
