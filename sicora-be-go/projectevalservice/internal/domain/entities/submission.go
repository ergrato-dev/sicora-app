package entities

import (
	"time"

	"github.com/google/uuid"
)

type Submission struct {
	ID                     uuid.UUID        `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ProjectID              uuid.UUID        `json:"project_id" gorm:"type:uuid;not null" validate:"required"`
	StudentID              uuid.UUID        `json:"student_id" gorm:"type:uuid;not null" validate:"required"`
	RepositoryURL          string           `json:"repository_url" gorm:"not null" validate:"required,url"`
	DeploymentURL          string           `json:"deployment_url" validate:"omitempty,url"`
	Description            string           `json:"description" gorm:"type:text"`
	TechnicalDocumentation string           `json:"technical_documentation" gorm:"type:text"`
	Status                 SubmissionStatus `json:"status" gorm:"type:varchar(20);not null;default:'submitted'" validate:"required"`
	SubmittedAt            time.Time        `json:"submitted_at" gorm:"autoCreateTime"`
	UpdatedAt              time.Time        `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	Project     Project      `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
	Evaluations []Evaluation `json:"evaluations,omitempty" gorm:"foreignKey:SubmissionID"`
}

type SubmissionStatus string

const (
	SubmissionStatusEnviada      SubmissionStatus = "ENVIADA"
	SubmissionStatusEnEvaluacion SubmissionStatus = "EN_EVALUACION"
	SubmissionStatusEvaluada     SubmissionStatus = "EVALUADA"
	SubmissionStatusRechazada    SubmissionStatus = "RECHAZADA"
)

func (ss SubmissionStatus) String() string {
	return string(ss)
}

func (ss SubmissionStatus) IsValid() bool {
	switch ss {
	case SubmissionStatusEnviada, SubmissionStatusEnEvaluacion, SubmissionStatusEvaluada, SubmissionStatusRechazada:
		return true
	default:
		return false
	}
}

func (s *Submission) CanBeEvaluated() bool {
	return s.Status == SubmissionStatusEnviada || s.Status == SubmissionStatusEnEvaluacion
}

func (s *Submission) IsEvaluated() bool {
	return s.Status == SubmissionStatusEvaluada
}
