package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"evalinservice/internal/infrastructure/database/models"
)

// DB es la instancia global de la base de datos
var DB *gorm.DB

// DatabaseConfig contiene la configuración de la base de datos
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Connect establece la conexión con la base de datos PostgreSQL
func Connect(config DatabaseConfig) error {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.SSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Verificar la conexión
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to PostgreSQL database")
	return nil
}

// Migrate ejecuta las migraciones automáticas de GORM
func Migrate() error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	log.Println("Running database migrations...")

	// Ejecutar migraciones para todos los modelos
	err := DB.AutoMigrate(
		&models.Question{},
		&models.Questionnaire{},
		&models.QuestionnaireQuestion{},
		&models.EvaluationPeriod{},
		&models.Evaluation{},
		&models.Comment{},
		&models.Report{},
		&models.Configuration{},
		&models.Notification{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// Close cierra la conexión a la base de datos
func Close() error {
	if DB == nil {
		return nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("failed to close database connection: %w", err)
	}

	log.Println("Database connection closed")
	return nil
}

// GetDB retorna la instancia de la base de datos
func GetDB() *gorm.DB {
	return DB
}

// Transaction ejecuta una función dentro de una transacción
func Transaction(fn func(*gorm.DB) error) error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	return DB.Transaction(fn)
}

// CreateTestDatabase crea una base de datos de prueba en memoria (SQLite)
func CreateTestDatabase() (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open("host=localhost user=test password=test dbname=test_evalin port=5432 sslmode=disable"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create test database: %w", err)
	}

	// Ejecutar migraciones para la base de datos de prueba
	err = db.AutoMigrate(
		&models.Question{},
		&models.Questionnaire{},
		&models.QuestionnaireQuestion{},
		&models.EvaluationPeriod{},
		&models.Evaluation{},
		&models.Comment{},
		&models.Report{},
		&models.Configuration{},
		&models.Notification{},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to migrate test database: %w", err)
	}

	return db, nil
}
