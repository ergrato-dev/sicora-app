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
	"mevalservice/internal/infrastructure/repositories"
	"mevalservice/internal/jobs"
	"mevalservice/internal/presentation/handlers"
	"mevalservice/internal/presentation/routes"
	"mevalservice/internal/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database
	db, err := database.NewDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Printf("Error closing database connection: %v", err)
		}
	}()

	// Run migrations
	if err := db.AutoMigrate(); err != nil {
		log.Fatalf("Failed to run database migrations: %v", err)
	}

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
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	
	router := gin.New()
	router.Use(gin.Recovery())

	// Setup routes
	routes.SetupRoutes(router, committeeHandler, studentCaseHandler, improvementPlanHandler, sanctionHandler, appealHandler, healthHandler)

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
		log.Printf("Warning: Failed to start job scheduler: %v", err)
	}
	defer jobScheduler.Stop()

	// Configure server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting MEvalService on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Give the server 5 seconds to finish requests
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
