package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	_ "scheduleservice/docs"
	"strings"
	"syscall"
	"time"

	"scheduleservice/configs"
	"scheduleservice/internal/application/usecases"
	"scheduleservice/internal/infrastructure/database"
	"scheduleservice/internal/infrastructure/database/repositories"
	"scheduleservice/internal/presentation/middleware"
	"scheduleservice/internal/presentation/routes"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// @title Schedule Service API
// @version 1.0
// @description API para gestión de horarios académicos con operaciones bulk
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8002
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Setup logger
	logger := log.New(os.Stdout, "[SCHEDULESERVICE] ", log.LstdFlags|log.Lshortfile)

	// Load configuration
	config := configs.LoadConfig()

	// Set Gin mode
	gin.SetMode(config.Server.Mode)

	// Initialize database
	db, err := database.NewDatabase()
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Run migrations
	if err := db.Migrate(); err != nil {
		logger.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize validator
	validator := validator.New()

	// Initialize repositories
	scheduleRepo := repositories.NewScheduleRepository(db.DB)
	// TODO: Implement master data use cases
	// academicProgramRepo := repositories.NewAcademicProgramRepository(db.DB)
	academicGroupRepo := repositories.NewAcademicGroupRepository(db.DB)
	venueRepo := repositories.NewVenueRepository(db.DB)
	// campusRepo := repositories.NewCampusRepository(db.DB)

	// Initialize use cases
	createScheduleUseCase := usecases.NewCreateScheduleUseCase(
		scheduleRepo, academicGroupRepo, venueRepo, logger)
	getScheduleUseCase := usecases.NewGetScheduleUseCase(scheduleRepo, logger)
	updateScheduleUseCase := usecases.NewUpdateScheduleUseCase(
		scheduleRepo, academicGroupRepo, venueRepo, logger)
	deleteScheduleUseCase := usecases.NewDeleteScheduleUseCase(scheduleRepo, logger)
	listSchedulesUseCase := usecases.NewListSchedulesUseCase(scheduleRepo, logger)

	// Initialize bulk use cases
	bulkScheduleUseCases := usecases.NewBulkScheduleUseCases(
		scheduleRepo, academicGroupRepo, venueRepo, validator, logger)

	// Initialize master data use cases (placeholders for now)
	// Academic Programs
	createProgramUseCase := &usecases.CreateAcademicProgramUseCase{}
	getProgramUseCase := &usecases.GetAcademicProgramUseCase{}
	updateProgramUseCase := &usecases.UpdateAcademicProgramUseCase{}
	deleteProgramUseCase := &usecases.DeleteAcademicProgramUseCase{}
	listProgramsUseCase := &usecases.ListAcademicProgramsUseCase{}

	// Academic Groups
	createGroupUseCase := &usecases.CreateAcademicGroupUseCase{}
	getGroupUseCase := &usecases.GetAcademicGroupUseCase{}
	updateGroupUseCase := &usecases.UpdateAcademicGroupUseCase{}
	deleteGroupUseCase := &usecases.DeleteAcademicGroupUseCase{}
	listGroupsUseCase := &usecases.ListAcademicGroupsUseCase{}

	// Venues
	createVenueUseCase := &usecases.CreateVenueUseCase{}
	getVenueUseCase := &usecases.GetVenueUseCase{}
	updateVenueUseCase := &usecases.UpdateVenueUseCase{}
	deleteVenueUseCase := &usecases.DeleteVenueUseCase{}
	listVenuesUseCase := &usecases.ListVenuesUseCase{}

	// Campus
	createCampusUseCase := &usecases.CreateCampusUseCase{}
	getCampusUseCase := &usecases.GetCampusUseCase{}
	updateCampusUseCase := &usecases.UpdateCampusUseCase{}
	deleteCampusUseCase := &usecases.DeleteCampusUseCase{}
	listCampusesUseCase := &usecases.ListCampusesUseCase{}

	// Initialize auth middleware
	authConfig := &middleware.AuthConfig{
		SecretKey: config.JWT.SecretKey,
		SkipPaths: []string{"/health", "/ready"},
	}
	authMiddleware := middleware.NewAuthMiddleware(authConfig)

	// Setup router
	router := gin.New()

	// SECURITY: Rate limiting - 30 req/min por IP
	rateLimiter := middleware.NewRateLimiter(30, time.Minute)

	// Global middleware - SECURITY FIRST
	router.Use(middleware.RequestIDMiddleware())
	router.Use(middleware.SecurityHeadersMiddleware())
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(rateLimiter.RateLimitMiddleware())

	// CORS middleware - SECURITY: Origen específico en producción
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:5173",
	}
	if os.Getenv("ALLOWED_ORIGINS") != "" {
		// En producción, usar orígenes configurados
		allowedOrigins = strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	}
	router.Use(middleware.SecureCORSMiddleware(allowedOrigins))

	// Setup health routes
	routes.SetupHealthRoutes(router)

	// Setup schedule routes with bulk operations
	routes.SetupScheduleRoutes(
		router,
		createScheduleUseCase,
		getScheduleUseCase,
		updateScheduleUseCase,
		deleteScheduleUseCase,
		listSchedulesUseCase,
		bulkScheduleUseCases,
		authMiddleware,
		logger,
	)

	// Setup master data routes
	routes.SetupMasterDataRoutes(
		router,
		// Academic Program use cases
		createProgramUseCase, getProgramUseCase, updateProgramUseCase,
		deleteProgramUseCase, listProgramsUseCase,
		// Academic Group use cases
		createGroupUseCase, getGroupUseCase, updateGroupUseCase,
		deleteGroupUseCase, listGroupsUseCase,
		// Venue use cases
		createVenueUseCase, getVenueUseCase, updateVenueUseCase,
		deleteVenueUseCase, listVenuesUseCase,
		// Campus use cases
		createCampusUseCase, getCampusUseCase, updateCampusUseCase,
		deleteCampusUseCase, listCampusesUseCase,
		authMiddleware,
		logger,
	)

	// Create HTTP server
	server := &http.Server{
		Addr:         ":" + config.Server.Port,
		Handler:      router,
		ReadTimeout:  time.Duration(config.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(config.Server.WriteTimeout) * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Printf("🚀 ScheduleService started successfully!")
		logger.Printf("📡 Server running on port %s", config.Server.Port)
		logger.Printf("🌍 Environment: %s", config.Server.Mode)
		logger.Printf("📚 API Documentation: http://localhost:%s/swagger/index.html", config.Server.Port)
		logger.Printf("❤️ Health Check: http://localhost:%s/health", config.Server.Port)
		logger.Printf("📋 Bulk Operations Available:")
		logger.Printf("   - POST /api/v1/schedules/bulk - Create multiple schedules")
		logger.Printf("   - POST /api/v1/schedules/upload-csv - Upload CSV file")

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("❌ Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Println("🔄 Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Fatalf("❌ Server forced to shutdown: %v", err)
	}

	logger.Println("✅ Server exited gracefully")
}
