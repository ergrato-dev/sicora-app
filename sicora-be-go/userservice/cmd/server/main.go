package main

//	@title			SICORA UserService API - Go
//	@version		1.0.0
//	@description	Sistema de Información de Coordinación Académica - UserService implementado con Go, Gin y Clean Architecture
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	Equipo de Desarrollo SICORA
//	@contact.email	dev@sicora.sena.edu.co

//	@license.name	MIT
//	@license.url	https://opensource.org/licenses/MIT

//	@host		localhost:8002
//	@BasePath	/api/v1

//	@securityDefinitions.apikey	BearerAuth
//	@in							header
//	@name						Authorization
//	@description				Type "Bearer" followed by a space and JWT token.

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "userservice/docs"
	"userservice/internal/application/usecases"
	"userservice/internal/infrastructure/auth"
	"userservice/internal/infrastructure/database"
	"userservice/internal/infrastructure/database/models"
	"userservice/internal/infrastructure/database/repositories"
	infraerrors "userservice/internal/infrastructure/errors"
	"userservice/internal/presentation/handlers"
	"userservice/internal/presentation/middleware"
	"userservice/internal/presentation/routes"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get environment
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	// Initialize centralized error system
	version := "1.0.0"
	infraerrors.InitServiceContext(version, env)

	// Setup logger (legacy for compatibility)
	logger := log.New(os.Stdout, "[USERSERVICE-GO] ", log.LstdFlags|log.Lshortfile)
	logger.Println("Starting SICORA UserService Go...")

	// Setup database
	dbConfig := database.NewConfig()
	db, err := database.NewConnection(dbConfig)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	// Note: db.Close() will be handled by shutdown manager

	// Setup service infrastructure (health checks, shutdown, logging)
	serviceSetup := infraerrors.NewServiceSetup(db.Connection, version, env)

	// Run migrations
	logger.Println("Running database migrations...")
	if err := db.Migrate(&models.UserModel{}); err != nil {
		logger.Fatalf("Failed to migrate database: %v", err)
	}
	logger.Println("Database migrations completed successfully")

	// Setup repository
	userRepo := repositories.NewPostgreSQLUserRepository(db.Connection)

	// Setup JWT service - SECURITY FIX
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		if os.Getenv("GIN_MODE") == "release" {
			log.Fatal("SECURITY ERROR: JWT_SECRET es OBLIGATORIO en producción")
		}
		log.Println("⚠️  WARNING: Usando JWT_SECRET por defecto - NO usar en producción")
		jwtSecret = "dev-only-unsafe-secret-key-32chars!"
	}
	if len(jwtSecret) < 32 {
		log.Fatal("SECURITY ERROR: JWT_SECRET debe tener mínimo 32 caracteres")
	}

	jwtService := auth.NewJWTService(jwtSecret, "sicora-userservice", 24*time.Hour)

	// Setup validator
	validate := validator.New()
	// Setup use cases
	createUserUseCase := usecases.NewCreateUserUseCase(userRepo, logger)
	getUserUseCase := usecases.NewGetUserUseCase(userRepo, logger)
	listUsersUseCase := usecases.NewListUsersUseCase(userRepo, logger)
	getProfileUseCase := usecases.NewGetProfileUseCase(userRepo, logger)
	updateProfileUseCase := usecases.NewUpdateProfileUseCase(userRepo, logger)
	authenticateUserUseCase := usecases.NewAuthenticateUserUseCase(userRepo, jwtService, logger)
	refreshTokenUseCase := usecases.NewRefreshTokenUseCase(userRepo, jwtService, logger)
	logoutUseCase := usecases.NewLogoutUseCase(userRepo, logger)
	forgotPasswordUseCase := usecases.NewForgotPasswordUseCase(userRepo, logger)
	resetPasswordUseCase := usecases.NewResetPasswordUseCase(userRepo, logger)
	forceChangePasswordUseCase := usecases.NewForceChangePasswordUseCase(userRepo, logger)

	// Admin use cases
	updateUserUseCase := usecases.NewUpdateUserUseCase(userRepo, logger)
	changePasswordUseCase := usecases.NewChangePasswordUseCase(userRepo, logger)
	deleteUserUseCase := usecases.NewDeleteUserUseCase(userRepo, logger)
	adminResetPasswordUseCase := usecases.NewAdminResetPasswordUseCase(userRepo, logger)
	// assignRoleUseCase := usecases.NewAssignRoleUseCase(userRepo, logger) // TODO: Implement when needed
	toggleUserStatusUseCase := usecases.NewToggleUserStatusUseCase(userRepo, logger)

	// Bulk use cases
	bulkUserUseCases := usecases.NewBulkUserUseCases(userRepo, validate)

	// Setup handlers
	userHandler := handlers.NewUserHandler(
		createUserUseCase,
		getUserUseCase,
		listUsersUseCase,
		getProfileUseCase,
		updateProfileUseCase,
		updateUserUseCase,
		deleteUserUseCase,
		authenticateUserUseCase,
		refreshTokenUseCase,
		logoutUseCase,
		forgotPasswordUseCase,
		resetPasswordUseCase,
		forceChangePasswordUseCase,
		changePasswordUseCase,
		adminResetPasswordUseCase,
		toggleUserStatusUseCase,
		bulkUserUseCases,
		validate,
		logger,
	)

	// Setup Gin router
	if os.Getenv("GIN_MODE") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Setup auth middleware configuration
	authConfig := &middleware.AuthConfig{
		JWTService: jwtService,
		SkipPaths: []string{
			"/health",
			"/docs",
			"/swagger",
			"/api/v1/auth",
			// SECURITY: NO incluir "/api/v1/users" completo (bypass de auth)
			// Solo rutas específicas de registro si son necesarias
		},
		CacheTTL:        5 * time.Minute,
		EnableBlacklist: true,
	}

	// Setup rate limiter - SECURITY: Límites estrictos
	// 30 req/min para endpoints generales (más restrictivo)
	generalRateLimiter := middleware.NewRateLimiter(30, time.Minute)
	// 10 req/min para endpoints de autenticación (previene brute force)
	authRateLimiter := middleware.NewRateLimiter(10, time.Minute)

	// SECURITY: Métricas de seguridad para detectar ataques
	securityMetrics := middleware.NewSecurityMetrics(logger)

	// Add global middleware
	router.Use(infraerrors.RequestContextMiddleware()) // Context propagation (nuevo)
	router.Use(middleware.RequestIDMiddleware())
	router.Use(middleware.SecurityHeadersMiddleware())
	router.Use(securityMetrics.SecurityMetricsMiddleware())           // Bloqueo de IPs maliciosas
	router.Use(middleware.SuspiciousPatternDetector(securityMetrics)) // Detectar SQL injection, XSS, etc.
	router.Use(infraerrors.LoggingMiddlewareV2(serviceSetup.Logger))  // Structured logging (nuevo)
	router.Use(middleware.CORSMiddleware())
	router.Use(generalRateLimiter.RateLimitMiddleware()) // 30 requests per minute
	router.Use(middleware.CompressionMiddleware())
	router.Use(infraerrors.TimeoutMiddlewareV2(30 * time.Second))     // Timeout (nuevo)
	router.Use(infraerrors.RecoveryMiddlewareV2(serviceSetup.Logger)) // Panic recovery (nuevo)
	router.Use(infraerrors.NotFoundMiddlewareV2())                    // Not found (nuevo)

	// Rate limiting específico para rutas de autenticación
	authGroup := router.Group("/api/v1/auth")
	authGroup.Use(authRateLimiter.RateLimitMiddleware()) // 10 req/min para auth

	// Endpoint de métricas de seguridad (solo admin)
	router.GET("/admin/security/metrics", func(c *gin.Context) {
		// TODO: Agregar autenticación de admin
		c.JSON(200, securityMetrics.GetStats())
	})

	// Setup routes with auth config
	routes.SetupUserRoutes(router, userHandler, authConfig)

	// Health check endpoints (nuevo sistema)
	serviceSetup.Health.RegisterRoutes(router)

	// Swagger documentation
	router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Server configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8002" // Default port for Go UserService
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Register components for graceful shutdown
	serviceSetup.RegisterComponents(db.Connection, server)

	// Start server in a goroutine
	go func() {
		logger.Printf("🚀 Server starting on port %s", port)
		logger.Printf("📊 Health check: http://localhost:%s/health", port)
		logger.Printf("📊 Readiness: http://localhost:%s/ready", port)
		logger.Printf("📊 Liveness: http://localhost:%s/live", port)
		logger.Printf("📖 API endpoints: http://localhost:%s/api/v1/users", port)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Println("🛑 Shutting down server...")

	// Graceful shutdown with centralized manager
	if err := serviceSetup.Shutdown.Shutdown(); err != nil {
		logger.Printf("Shutdown error: %v", err)
	}

	logger.Println("✅ Server shutdown completed")
}
