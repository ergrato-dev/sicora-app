package main

import (
	_ "evalinservice/docs"
	"log"
	"os"

	"evalinservice/configs"
	"evalinservice/internal/infrastructure/database"
	"evalinservice/internal/presentation/handlers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
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

	// Configurar logger
	logger := logrus.New()
	logger.SetLevel(logrus.InfoLevel)
	if cfg.Environment == "development" {
		logger.SetLevel(logrus.DebugLevel)
	}

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
	_ = database.GetDB()

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

	// Crear router config
	routerConfig := &handlers.RouterConfig{
		Logger:      logger,
		JWTSecret:   cfg.JWTSecret,
		Environment: cfg.Environment,
	}

	// Crear handlers
	handlerContainer := handlers.NewHandlerContainer(logger, useCases)

	// Configurar Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Crear router
	router := gin.Default()

	// Configurar rutas
	handlers.SetupRoutes(router, routerConfig, handlerContainer)

	// Obtener puerto
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.ServerPort
	}

	log.Printf("🚀 EvalinService starting on port %s", port)
	log.Printf("📊 Environment: %s", cfg.Environment)
	log.Printf("📑 Swagger docs available at: http://localhost:%s/swagger/index.html", port)

	// Iniciar servidor
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	// Cerrar DB al terminar
	defer func() {
		if err := database.Close(); err != nil {
			logger.Errorf("Error closing database: %v", err)
		}
	}()
}
