package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"kbservice/internal/domain/entities"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB holds the database connection
var DB *gorm.DB

// Config holds database configuration
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	TimeZone string
}

// Connect establishes a connection to the PostgreSQL database
func Connect(config Config) error {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.SSLMode,
		config.TimeZone,
	)

	// Configure GORM logger
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Silent, // Change to logger.Info for development
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db
	return nil
}

// AutoMigrate runs database migrations
func AutoMigrate() error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	// Try to enable pgvector extension (optional - may not be available)
	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS vector").Error; err != nil {
		log.Printf("Warning: pgvector extension not available: %v. Vector search will be disabled.", err)
		// Continue without vector extension - it's optional for basic functionality
	}

	// Auto-migrate all models FIRST (creates the tables)
	err := DB.AutoMigrate(
		&entities.Document{},
		&entities.DocumentVersion{},
		&entities.DocumentComment{},
		&entities.DocumentAnalytic{},
		&entities.DocumentRating{},
		&entities.FAQ{},
		&entities.FAQRating{},
		&entities.FAQAnalytic{},
		&entities.FAQSuggestion{},
		&entities.AnalyticsEvent{},
		&entities.SearchAnalytics{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate: %w", err)
	}

	// Create custom indexes AFTER tables exist
	if err := createCustomIndexes(); err != nil {
		return fmt.Errorf("failed to create custom indexes: %w", err)
	}

	// Create additional indexes after migration
	if err := createAdditionalIndexes(); err != nil {
		return fmt.Errorf("failed to create additional indexes: %w", err)
	}

	// Create search functions and triggers
	if err := createSearchFunctions(); err != nil {
		return fmt.Errorf("failed to create search functions: %w", err)
	}

	return nil
}

// createCustomIndexes creates custom indexes before migration
func createCustomIndexes() error {
	indexes := []string{
		// Document indexes
		"CREATE INDEX IF NOT EXISTS idx_documents_status ON kb_documents(status)",
		"CREATE INDEX IF NOT EXISTS idx_documents_category ON kb_documents(category)",
		"CREATE INDEX IF NOT EXISTS idx_documents_audience ON kb_documents(audience)",
		"CREATE INDEX IF NOT EXISTS idx_documents_author ON kb_documents(author_id)",
		"CREATE INDEX IF NOT EXISTS idx_documents_created_at ON kb_documents(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_documents_published_at ON kb_documents(published_at)",
		"CREATE INDEX IF NOT EXISTS idx_documents_view_count ON kb_documents(view_count)",
		"CREATE INDEX IF NOT EXISTS idx_documents_slug ON kb_documents(slug) WHERE deleted_at IS NULL",

		// FAQ indexes
		"CREATE INDEX IF NOT EXISTS idx_faqs_status ON kb_faqs(status)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_category ON kb_faqs(category)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_audience ON kb_faqs(audience)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_author ON kb_faqs(author_id)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_priority ON kb_faqs(priority)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_overall_score ON kb_faqs(overall_score)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON kb_faqs(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_published_at ON kb_faqs(published_at)",

		// Analytics indexes
		"CREATE INDEX IF NOT EXISTS idx_doc_analytics_document_id ON kb_document_analytics(document_id)",
		"CREATE INDEX IF NOT EXISTS idx_doc_analytics_created_at ON kb_document_analytics(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_doc_analytics_action ON kb_document_analytics(action)",
		"CREATE INDEX IF NOT EXISTS idx_faq_analytics_faq_id ON kb_faq_analytics(faq_id)",
		"CREATE INDEX IF NOT EXISTS idx_faq_analytics_created_at ON kb_faq_analytics(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_faq_analytics_action ON kb_faq_analytics(action)",

		// Rating indexes
		"CREATE INDEX IF NOT EXISTS idx_doc_ratings_document_id ON kb_document_ratings(document_id)",
		"CREATE INDEX IF NOT EXISTS idx_doc_ratings_user_id ON kb_document_ratings(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_faq_ratings_faq_id ON kb_faq_ratings(faq_id)",
		"CREATE INDEX IF NOT EXISTS idx_faq_ratings_session_id ON kb_faq_ratings(session_id)",

		// Unique constraints
		"CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_ratings_unique ON kb_document_ratings(document_id, user_id) WHERE deleted_at IS NULL",
		"CREATE UNIQUE INDEX IF NOT EXISTS idx_faq_ratings_unique ON kb_faq_ratings(faq_id, session_id)",
	}

	for _, query := range indexes {
		if err := DB.Exec(query).Error; err != nil {
			return fmt.Errorf("failed to execute index query '%s': %w", query, err)
		}
	}

	return nil
}

// createAdditionalIndexes creates additional specialized indexes
func createAdditionalIndexes() error {
	indexes := []string{
		// GIN indexes for arrays
		"CREATE INDEX IF NOT EXISTS idx_documents_tags ON kb_documents USING GIN (tags)",
		"CREATE INDEX IF NOT EXISTS idx_documents_keywords ON kb_documents USING GIN (keywords)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_tags ON kb_faqs USING GIN (tags)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_keywords ON kb_faqs USING GIN (keywords)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_related_faqs ON kb_faqs USING GIN (related_faqs)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_related_documents ON kb_faqs USING GIN (related_documents)",

		// Vector indexes for semantic search (using HNSW for better performance)
		"CREATE INDEX IF NOT EXISTS idx_documents_embedding ON kb_documents USING hnsw (embedding vector_cosine_ops)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_embedding ON kb_faqs USING hnsw (embedding vector_cosine_ops)",

		// Full-text search indexes
		"CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON kb_documents USING GIN (search_vector)",
		"CREATE INDEX IF NOT EXISTS idx_faqs_search_vector ON kb_faqs USING GIN (search_vector)",

		// Composite indexes for common queries
		"CREATE INDEX IF NOT EXISTS idx_documents_status_category ON kb_documents(status, category) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_documents_status_audience ON kb_documents(status, audience) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_faqs_status_category ON kb_faqs(status, category) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_faqs_status_audience ON kb_faqs(status, audience) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_faqs_category_score ON kb_faqs(category, overall_score DESC) WHERE status = 'PUBLISHED' AND deleted_at IS NULL",
	}

	for _, query := range indexes {
		if err := DB.Exec(query).Error; err != nil {
			// Some indexes might fail if vector extension is not available, log but continue
			log.Printf("Warning: failed to create index: %s - %v", query, err)
		}
	}

	return nil
}

// createSearchFunctions creates PostgreSQL functions for search and triggers
func createSearchFunctions() error {
	functions := []string{
		// Function to update document search vector
		`CREATE OR REPLACE FUNCTION update_document_search_vector() RETURNS trigger AS $$
		BEGIN
			NEW.search_vector := 
				setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
				setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B') ||
				setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
				setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;`,

		// Function to update FAQ search vector
		`CREATE OR REPLACE FUNCTION update_faq_search_vector() RETURNS trigger AS $$
		BEGIN
			NEW.search_vector := 
				setweight(to_tsvector('english', COALESCE(NEW.question, '')), 'A') ||
				setweight(to_tsvector('english', COALESCE(NEW.answer, '')), 'B') ||
				setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;`,

		// Function to calculate FAQ scores
		`CREATE OR REPLACE FUNCTION update_faq_scores() RETURNS trigger AS $$
		BEGIN
			-- Popularity score based on views and clicks
			IF NEW.view_count > 0 THEN
				NEW.popularity_score := NEW.click_count::float / NEW.view_count::float;
			ELSE
				NEW.popularity_score := 0.0;
			END IF;
			
			-- Relevance score based on helpfulness
			IF (NEW.helpful_count + NEW.unhelpful_count) > 0 THEN
				NEW.relevance_score := NEW.helpful_count::float / (NEW.helpful_count + NEW.unhelpful_count)::float;
			ELSE
				NEW.relevance_score := 0.0;
			END IF;
			
			-- Freshness score (decays over time)
			NEW.freshness_score := 1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - NEW.updated_at)) / 86400.0 / 30.0);
			
			-- Overall score (weighted combination)
			NEW.overall_score := (NEW.popularity_score * 0.4 + NEW.relevance_score * 0.4 + NEW.freshness_score * 0.2);
			
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;`,
	}

	for _, query := range functions {
		if err := DB.Exec(query).Error; err != nil {
			return fmt.Errorf("failed to create function: %w", err)
		}
	}

	// Create triggers
	triggers := []string{
		// Document search vector trigger
		`DROP TRIGGER IF EXISTS trigger_update_document_search_vector ON kb_documents;
		CREATE TRIGGER trigger_update_document_search_vector
			BEFORE INSERT OR UPDATE ON kb_documents
			FOR EACH ROW EXECUTE FUNCTION update_document_search_vector();`,

		// FAQ search vector trigger
		`DROP TRIGGER IF EXISTS trigger_update_faq_search_vector ON kb_faqs;
		CREATE TRIGGER trigger_update_faq_search_vector
			BEFORE INSERT OR UPDATE ON kb_faqs
			FOR EACH ROW EXECUTE FUNCTION update_faq_search_vector();`,

		// FAQ scores trigger
		`DROP TRIGGER IF EXISTS trigger_update_faq_scores ON kb_faqs;
		CREATE TRIGGER trigger_update_faq_scores
			BEFORE INSERT OR UPDATE ON kb_faqs
			FOR EACH ROW EXECUTE FUNCTION update_faq_scores();`,
	}

	for _, query := range triggers {
		if err := DB.Exec(query).Error; err != nil {
			return fmt.Errorf("failed to create trigger: %w", err)
		}
	}

	return nil
}

// Close closes the database connection
func Close() error {
	if DB == nil {
		return nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	return sqlDB.Close()
}

// GetDB returns the database connection
func GetDB() *gorm.DB {
	return DB
}

// Transaction executes a function within a database transaction
func Transaction(ctx context.Context, fn func(*gorm.DB) error) error {
	return DB.WithContext(ctx).Transaction(fn)
}

// HealthCheck checks if the database is healthy
func HealthCheck(ctx context.Context) error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return sqlDB.PingContext(ctx)
}
