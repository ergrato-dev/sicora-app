package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	_ "scheduleservice/docs"
	"strings"
	"syscall"
	"time"

	"sicora-be-go/pkg/cache"

	"scheduleservice/configs"
	"scheduleservice/internal/application/usecases"
	infraCache "scheduleservice/internal/infrastructure/cache"
	"scheduleservice/internal/infrastructure/database"
	"scheduleservice/internal/infrastructure/database/repositories"
	infraerrors "scheduleservice/internal/infrastructure/errors"
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
	// Setup logger (legacy for compatibility)
	logger := log.New(os.Stdout, "[SCHEDULESERVICE] ", log.LstdFlags|log.Lshortfile)

	// Load configuration
	config := configs.LoadConfig()

	// Initialize centralized error system
	version := "1.0.0"
	env := config.Server.Mode
	infraerrors.InitServiceContext(version, env)

	// Set Gin mode
	gin.SetMode(config.Server.Mode)

	// Initialize database
	db, err := database.NewDatabase()
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	// Note: db.Close() will be handled by shutdown manager

	// Setup service infrastructure (health checks, shutdown, logging)
	serviceSetup := infraerrors.NewServiceSetup(db.DB, version, env)

	// Run migrations
	if err := db.Migrate(); err != nil {
		logger.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize Redis cache (if enabled)
	var serviceCache *infraCache.ScheduleServiceCache
	if config.Redis.Enabled {
		redisAddr := fmt.Sprintf("%s:%s", config.Redis.Host, config.Redis.Port)
		cacheConfig := &cache.CacheConfig{
			Addr:         redisAddr,
			Password:     config.Redis.Password,
			DB:           config.Redis.DB,
			KeyPrefix:    "scheduleservice",
			ReadTimeout:  5 * time.Second,
			WriteTimeout: 5 * time.Second,
		}

		cacheClient, err := cache.NewRedisClient(cacheConfig)
		if err != nil {
			logger.Printf("⚠️ Failed to connect to Redis: %v. Cache disabled.", err)
			config.Redis.Enabled = false
		} else {
			serviceCache = infraCache.NewScheduleServiceCache(cacheClient, logger)
			logger.Printf("✅ Redis cache connected successfully at %s", redisAddr)
		}
	}

	// Initialize validator
	validator := validator.New()

	// Initialize repositories
	scheduleRepo := repositories.NewScheduleRepository(db.DB)
	academicGroupRepo := repositories.NewAcademicGroupRepository(db.DB)
	venueRepo := repositories.NewVenueRepository(db.DB)
	campusRepo := repositories.NewCampusRepository(db.DB)
	academicProgramRepo := repositories.NewAcademicProgramRepository(db.DB)

	// Wrap with cached repositories if cache is enabled
	if config.Redis.Enabled && serviceCache != nil {
		campusRepo = infraCache.NewCachedCampusRepository(campusRepo, serviceCache, logger)
		academicProgramRepo = infraCache.NewCachedAcademicProgramRepository(academicProgramRepo, serviceCache, logger)
		academicGroupRepo = infraCache.NewCachedAcademicGroupRepository(academicGroupRepo, serviceCache, logger)
		venueRepo = infraCache.NewCachedVenueRepository(venueRepo, serviceCache, logger)
		logger.Printf("✅ Cached repositories enabled for master data")
	}

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
	router.Use(infraerrors.RequestContextMiddleware()) // Context propagation (nuevo)
	router.Use(middleware.RequestIDMiddleware())
	router.Use(middleware.SecurityHeadersMiddleware())
	router.Use(infraerrors.LoggingMiddlewareV2(serviceSetup.Logger))  // Structured logging (nuevo)
	router.Use(infraerrors.RecoveryMiddlewareV2(serviceSetup.Logger)) // Panic recovery (nuevo)
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

	// Setup health routes (nuevo sistema con Kubernetes probes)
	serviceSetup.Health.RegisterRoutes(router)

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

	// Register components for graceful shutdown
	serviceSetup.RegisterComponents(db.DB, server)

	// Start server in a goroutine
	go func() {
		logger.Printf("🚀 ScheduleService started successfully!")
		logger.Printf("📡 Server running on port %s", config.Server.Port)
		logger.Printf("🌍 Environment: %s", config.Server.Mode)
		logger.Printf("📚 API Documentation: http://localhost:%s/swagger/index.html", config.Server.Port)
		logger.Printf("❤️ Health Check: http://localhost:%s/health", config.Server.Port)
		logger.Printf("📊 Readiness: http://localhost:%s/ready", config.Server.Port)
		logger.Printf("📊 Liveness: http://localhost:%s/live", config.Server.Port)
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

	// Graceful shutdown with centralized manager
	if err := serviceSetup.Shutdown.Shutdown(); err != nil {
		logger.Printf("❌ Shutdown error: %v", err)
	}

	logger.Println("✅ Server exited gracefully")
}
