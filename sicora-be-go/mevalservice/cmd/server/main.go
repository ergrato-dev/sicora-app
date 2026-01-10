package main

// @title           SICORA mevalservice API
// @version         1.0
// @description     Microservicio mevalservice del Sistema de Información de Coordinación Académica (SICORA) - SENA
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
	"log"
	_ "mevalservice/docs"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"mevalservice/internal/application/usecases"
	"mevalservice/internal/infrastructure/database"
	infraerrors "mevalservice/internal/infrastructure/errors"
	"mevalservice/internal/infrastructure/repositories"
	"mevalservice/internal/jobs"
	"mevalservice/internal/presentation/handlers"
	"mevalservice/internal/presentation/middleware"
	"mevalservice/internal/presentation/routes"
	"mevalservice/internal/services"

	apperrors "sicora-be-go/pkg/errors"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize error handling context
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}
	infraerrors.InitServiceContext("1.0.0", env)

	// Determine if development mode
	isDev := env != "production"

	// Initialize database
	db, err := database.NewDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := db.AutoMigrate(); err != nil {
		log.Fatalf("Failed to run database migrations: %v", err)
	}

	// Setup service components (logger, health checker, shutdown manager)
	serviceSetup := infraerrors.NewServiceSetup(db.DB, isDev)

	// Register database cleanup in shutdown manager
	serviceSetup.ShutdownManager.Register("database", 1, func(ctx context.Context) error {
		return db.Close()
	})

	// Initialize repositories
	repos := repositories.NewRepositories(db)

	// Initialize use cases
	committeeUC := usecases.NewCommitteeUseCases(repos.Committee, repos.CommitteeMember)
	studentCaseUC := usecases.NewStudentCaseUseCases(repos.StudentCase, repos.Committee)
	improvementPlanUC := usecases.NewImprovementPlanUseCases(repos.ImprovementPlan, repos.StudentCase)
	sanctionUC := usecases.NewSanctionUseCases(repos.Sanction, repos.StudentCase)
	appealUC := usecases.NewAppealUseCases(repos.Appeal, repos.Sanction)

	// Initialize handlers
	committeeHandler := handlers.NewCommitteeHandler(committeeUC)
	studentCaseHandler := handlers.NewStudentCaseHandler(studentCaseUC)
	improvementPlanHandler := handlers.NewImprovementPlanHandler(improvementPlanUC)
	sanctionHandler := handlers.NewSanctionHandler(sanctionUC)
	appealHandler := handlers.NewAppealHandler(appealUC)
	healthHandler := handlers.NewHealthHandler()

	// Initialize Gin router
	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Apply V2 middlewares first
	router.Use(infraerrors.RequestContextMiddleware())
	router.Use(infraerrors.RecoveryMiddlewareV2(serviceSetup.Logger))
	router.Use(infraerrors.LoggingMiddlewareV2(serviceSetup.Logger))

	// SECURITY: Rate limiting - 30 req/min por IP
	rateLimiter := middleware.NewRateLimiter(30, time.Minute)

	// SECURITY: Middleware en orden correcto
	router.Use(middleware.RequestID())
	router.Use(middleware.SecurityHeaders())
	router.Use(rateLimiter.RateLimitMiddleware())
	router.Use(middleware.SecureCORS())

	// Setup routes
	routes.SetupRoutes(router, committeeHandler, studentCaseHandler, improvementPlanHandler, sanctionHandler, appealHandler, healthHandler)

	// Health routes already registered in routes.SetupRoutes()

	// Initialize notification service
	notificationService := services.NewMockNotificationService()

	// Initialize and start job scheduler
	jobScheduler := jobs.NewJobScheduler(
		committeeUC,
		studentCaseUC,
		improvementPlanUC,
		sanctionUC,
		appealUC,
		repos.Committee,
		repos.StudentCase,
		repos.ImprovementPlan,
		repos.Sanction,
		repos.Appeal,
		notificationService,
	)

	if err := jobScheduler.Start(); err != nil {
		serviceSetup.Logger.Warn(context.Background(), "Failed to start job scheduler",
			apperrors.Str("error", err.Error()))
	}

	// Register job scheduler shutdown
	serviceSetup.ShutdownManager.Register("job-scheduler", 5, func(ctx context.Context) error {
		jobScheduler.Stop()
		return nil
	})

	// Configure server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Register server shutdown
	serviceSetup.ShutdownManager.Register("http-server", 10, func(ctx context.Context) error {
		return srv.Shutdown(ctx)
	})

	// Setup signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Start server in goroutine
	go func() {
		serviceSetup.Logger.Info(context.Background(), "MEvalService starting",
			apperrors.Str("port", port),
			apperrors.Str("environment", env),
		)

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
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
		serviceSetup.Logger.Info(context.Background(), "MEvalService shutdown completed successfully")
	}
}
