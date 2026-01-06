package dtos

import (
	"time"

	"github.com/google/uuid"
)

type EvaluationCreateRequest struct {
	InstructorID    uuid.UUID `json:"instructor_id" binding:"required"`
	StudentID       uuid.UUID `json:"student_id" binding:"required"`
	PeriodID        uuid.UUID `json:"period_id" binding:"required"`
	QuestionnaireID uuid.UUID `json:"questionnaire_id" binding:"required"`
	ScheduleID      uuid.UUID `json:"schedule_id" binding:"required"`
}

type EvaluationUpdateRequest struct {
	Responses map[string]interface{} `json:"responses"`
	Status    string                 `json:"status"`
}

type EvaluationResponse struct {
	ID                uuid.UUID              `json:"id"`
	InstructorID      uuid.UUID              `json:"instructor_id"`
	StudentID         uuid.UUID              `json:"student_id"`
	PeriodID          uuid.UUID              `json:"period_id"`
	QuestionnaireID   uuid.UUID              `json:"questionnaire_id"`
	ScheduleID        uuid.UUID              `json:"schedule_id"`
	Responses         map[string]interface{} `json:"responses"`
	Status            string                 `json:"status"`
	Score             *float64               `json:"score"`
	CompletedAt       *time.Time             `json:"completed_at"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
	InstructorName    string                 `json:"instructor_name,omitempty"`
	StudentName       string                 `json:"student_name,omitempty"`
	PeriodName        string                 `json:"period_name,omitempty"`
	QuestionnaireName string                 `json:"questionnaire_name,omitempty"`
}

type EvaluationStatsResponse struct {
	TotalEvaluations     int64   `json:"total_evaluations"`
	CompletedEvaluations int64   `json:"completed_evaluations"`
	PendingEvaluations   int64   `json:"pending_evaluations"`
	AverageScore         float64 `json:"average_score"`
	CompletionRate       float64 `json:"completion_rate"`
}

type EvaluationFilterRequest struct {
	InstructorID    *uuid.UUID `form:"instructor_id"`
	StudentID       *uuid.UUID `form:"student_id"`
	PeriodID        *uuid.UUID `form:"period_id"`
	QuestionnaireID *uuid.UUID `form:"questionnaire_id"`
	Status          *string    `form:"status"`
	StartDate       *string    `form:"start_date"`
	EndDate         *string    `form:"end_date"`
	Page            int        `form:"page" binding:"min=1"`
	PageSize        int        `form:"page_size" binding:"min=1,max=100"`
}

type EvaluationBulkUpdateRequest struct {
	EvaluationIDs []uuid.UUID `json:"evaluation_ids" binding:"required"`
	Status        string      `json:"status" binding:"required"`
}

// CreateEvaluationRequest es un alias para compatibilidad con handlers
type CreateEvaluationRequest = EvaluationCreateRequest

// UpdateEvaluationRequest es un alias para compatibilidad con handlers
type UpdateEvaluationRequest = EvaluationUpdateRequest
