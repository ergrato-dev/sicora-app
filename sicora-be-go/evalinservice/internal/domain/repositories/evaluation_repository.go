package repositories

import (
	"context"
	"time"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

// EvaluationRepository define las operaciones para la gestión de evaluaciones
type EvaluationRepository interface {
	// Create crea una nueva evaluación
	Create(ctx context.Context, evaluation *entities.Evaluation) error

	// GetByID obtiene una evaluación por su ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Evaluation, error)

	// GetAll obtiene todas las evaluaciones con filtros opcionales
	GetAll(ctx context.Context, filters EvaluationFilters) ([]*entities.Evaluation, error)

	// Update actualiza una evaluación existente
	Update(ctx context.Context, evaluation *entities.Evaluation) error

	// Delete elimina una evaluación (soft delete)
	Delete(ctx context.Context, id uuid.UUID) error

	// GetByStudentAndPeriod obtiene evaluaciones de un estudiante en un período
	GetByStudentAndPeriod(ctx context.Context, studentID, periodID uuid.UUID) ([]*entities.Evaluation, error)

	// GetByInstructorAndPeriod obtiene evaluaciones de un instructor en un período
	GetByInstructorAndPeriod(ctx context.Context, instructorID, periodID uuid.UUID) ([]*entities.Evaluation, error)

	// GetByStudent obtiene todas las evaluaciones de un estudiante
	GetByStudent(ctx context.Context, studentID uuid.UUID) ([]*entities.Evaluation, error)

	// GetByInstructor obtiene todas las evaluaciones de un instructor
	GetByInstructor(ctx context.Context, instructorID uuid.UUID) ([]*entities.Evaluation, error)

	// ExistsEvaluation verifica si ya existe una evaluación específica
	ExistsEvaluation(ctx context.Context, studentID, instructorID, periodID uuid.UUID) (bool, error)

	// GetEvaluationByStudentInstructorPeriod obtiene una evaluación específica
	GetEvaluationByStudentInstructorPeriod(ctx context.Context, studentID, instructorID, periodID uuid.UUID) (*entities.Evaluation, error)

	// GetSubmittedEvaluations obtiene evaluaciones enviadas
	GetSubmittedEvaluations(ctx context.Context, filters EvaluationFilters) ([]*entities.Evaluation, error)

	// GetDraftEvaluations obtiene evaluaciones en borrador
	GetDraftEvaluations(ctx context.Context, filters EvaluationFilters) ([]*entities.Evaluation, error)

	// GetEvaluationsByPeriod obtiene evaluaciones por período
	GetEvaluationsByPeriod(ctx context.Context, periodID uuid.UUID) ([]*entities.Evaluation, error)

	// GetParticipationStats obtiene estadísticas de participación
	GetParticipationStats(ctx context.Context, periodID uuid.UUID, fichaID *string) (*ParticipationStats, error)

	// GetInstructorEvaluationSummary obtiene resumen de evaluaciones de un instructor
	GetInstructorEvaluationSummary(ctx context.Context, instructorID uuid.UUID, periodID *uuid.UUID) (*InstructorEvaluationSummary, error)

	// BulkUpdateStatus actualiza el estado de múltiples evaluaciones
	BulkUpdateStatus(ctx context.Context, evaluationIDs []uuid.UUID, status valueobjects.EvaluationStatus) error
}

// EvaluationFilters define los filtros para búsqueda de evaluaciones
type EvaluationFilters struct {
	StudentID       *uuid.UUID                    `json:"student_id"`
	InstructorID    *uuid.UUID                    `json:"instructor_id"`
	PeriodID        *uuid.UUID                    `json:"period_id"`
	QuestionnaireID *uuid.UUID                    `json:"questionnaire_id"`
	Status          valueobjects.EvaluationStatus `json:"status"`
	SubmittedFrom   *time.Time                    `json:"submitted_from"`
	SubmittedTo     *time.Time                    `json:"submitted_to"`
	CreatedFrom     *time.Time                    `json:"created_from"`
	CreatedTo       *time.Time                    `json:"created_to"`
	HasComment      *bool                         `json:"has_comment"`
	FichaID         *string                       `json:"ficha_id"` // Para filtrar por ficha del estudiante
	Limit           int                           `json:"limit"`
	Offset          int                           `json:"offset"`
	OrderBy         string                        `json:"order_by"`  // "created_at", "submitted_at", "updated_at"
	OrderDir        string                        `json:"order_dir"` // "asc", "desc"
}

// ParticipationStats contiene estadísticas de participación en evaluaciones
type ParticipationStats struct {
	PeriodID             uuid.UUID `json:"period_id"`
	TotalStudents        int       `json:"total_students"`
	StudentsParticipated int       `json:"students_participated"`
	ParticipationRate    float64   `json:"participation_rate"`
	TotalEvaluations     int       `json:"total_evaluations"`
	SubmittedEvaluations int       `json:"submitted_evaluations"`
	DraftEvaluations     int       `json:"draft_evaluations"`
	AverageResponseTime  float64   `json:"average_response_time_hours"`
}

// InstructorEvaluationSummary contiene resumen de evaluaciones de un instructor
type InstructorEvaluationSummary struct {
	InstructorID         uuid.UUID                   `json:"instructor_id"`
	PeriodID             *uuid.UUID                  `json:"period_id"`
	TotalEvaluations     int                         `json:"total_evaluations"`
	AverageRating        float64                     `json:"average_rating"`
	ResponseDistribution map[string]int              `json:"response_distribution"`
	Categories           map[string]*CategorySummary `json:"categories"`
	Comments             []string                    `json:"comments"`
	LastUpdated          time.Time                   `json:"last_updated"`
}

// CategorySummary contiene resumen por categoría de preguntas
type CategorySummary struct {
	Category       string  `json:"category"`
	AverageRating  float64 `json:"average_rating"`
	TotalQuestions int     `json:"total_questions"`
	ResponseCount  int     `json:"response_count"`
}
