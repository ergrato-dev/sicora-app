package main

//	@title			SICORA ProjectEvalService API - Go
//	@version		1.0.0
//	@description	Sistema de Información de Coordinación Académica - ProjectEvalService implementado con Go, Gin y Clean Architecture
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	Equipo de Desarrollo SICORA
//	@contact.email	dev@sicora.sena.edu.co

//	@license.name	MIT
//	@license.url	https://opensource.org/licenses/MIT

//	@host		localhost:8008
//	@BasePath	/api/v1

//	@securityDefinitions.apikey	BearerAuth
//	@in							header
//	@name						Authorization
//	@description				Type "Bearer" followed by a space and JWT token.

import (
	"log"
	"net/http"
	"os"
	"time"

	_ "projectevalservice/docs"
	"projectevalservice/internal/application/usecases"
	"projectevalservice/internal/infrastructure/auth"
	"projectevalservice/internal/infrastructure/database"
	"projectevalservice/internal/infrastructure/database/repositories"
	infraerrors "projectevalservice/internal/infrastructure/errors"
	"projectevalservice/internal/presentation/handlers"
	"projectevalservice/internal/presentation/middleware"
	"projectevalservice/internal/presentation/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Initialize centralized error handling
	infraerrors.InitServiceContext()

	// Initialize database
	db := database.NewDatabase()
	if err := db.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Run migrations
	if err := db.Migrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize repositories
	projectRepo := repositories.NewProjectRepository(db.GetDB())
	submissionRepo := repositories.NewSubmissionRepository(db.GetDB())
	evaluationRepo := repositories.NewEvaluationRepository(db.GetDB())

	// Initialize use cases
	projectUseCase := usecases.NewProjectUseCase(projectRepo)
	submissionUseCase := usecases.NewSubmissionUseCase(submissionRepo, projectRepo)
	evaluationUseCase := usecases.NewEvaluationUseCase(evaluationRepo, submissionRepo)

	// Initialize handlers
	projectHandler := handlers.NewProjectHandler(projectUseCase)
	submissionHandler := handlers.NewSubmissionHandler(submissionUseCase)
	evaluationHandler := handlers.NewEvaluationHandler(evaluationUseCase)

	// Initialize JWT service - SECURITY FIX
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

	jwtService := auth.NewJWTService(
		jwtSecret,
		"sicora-projectevalservice",
		24*time.Hour,
	)

	// Initialize Gin router
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// SECURITY: Rate limiting - 30 req/min por IP
	rateLimiter := middleware.NewRateLimiter(30, time.Minute)

	// SECURITY: Middleware en orden correcto (V2 with centralized error handling)
	router.Use(infraerrors.RequestContextMiddleware()) // Request ID + correlation
	router.Use(middleware.SecurityHeaders())
	router.Use(infraerrors.RecoveryMiddlewareV2()) // Replaces gin.Recovery()
	router.Use(infraerrors.LoggingMiddlewareV2())  // Replaces gin.Logger()
	router.Use(rateLimiter.RateLimitMiddleware())
	router.Use(middleware.SecureCORS())

	// Setup routes
	routes.SetupRoutes(router, projectHandler, submissionHandler, evaluationHandler, jwtService)

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Health routes already registered in routes.SetupRoutes()

	// Server configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8008"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Start server
	log.Printf("ProjectEvalService starting on port %s", port)
	log.Printf("Swagger: http://localhost:%s/swagger/index.html", port)

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start server: %v", err)
	}
}
