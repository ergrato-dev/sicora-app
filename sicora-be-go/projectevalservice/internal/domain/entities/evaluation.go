package entities

import (
	"time"

	"github.com/google/uuid"
)

type Evaluation struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SubmissionID uuid.UUID `json:"submission_id" gorm:"type:uuid;not null" validate:"required"`
	EvaluatorID  uuid.UUID `json:"evaluator_id" gorm:"type:uuid;not null" validate:"required"`

	// Technical Criteria Scores
	FunctionalityScore float64 `json:"functionality_score" gorm:"not null;default:0" validate:"min=0,max=100"`
	CodeQualityScore   float64 `json:"code_quality_score" gorm:"not null;default:0" validate:"min=0,max=100"`
	ArchitectureScore  float64 `json:"architecture_score" gorm:"not null;default:0" validate:"min=0,max=100"`
	DocumentationScore float64 `json:"documentation_score" gorm:"not null;default:0" validate:"min=0,max=100"`
	TestingScore       float64 `json:"testing_score" gorm:"not null;default:0" validate:"min=0,max=100"`
	DeploymentScore    float64 `json:"deployment_score" gorm:"not null;default:0" validate:"min=0,max=100"`
	SecurityScore      float64 `json:"security_score" gorm:"not null;default:0" validate:"min=0,max=100"`
	PerformanceScore   float64 `json:"performance_score" gorm:"not null;default:0" validate:"min=0,max=100"`

	// Calculated Fields
	TotalScore float64 `json:"total_score" gorm:"not null;default:0"`
	Grade      string  `json:"grade" gorm:"type:varchar(10)"`

	// Comments and Feedback
	GeneralComments       string `json:"general_comments" gorm:"type:text"`
	FunctionalityComments string `json:"functionality_comments" gorm:"type:text"`
	CodeQualityComments   string `json:"code_quality_comments" gorm:"type:text"`
	ArchitectureComments  string `json:"architecture_comments" gorm:"type:text"`
	DocumentationComments string `json:"documentation_comments" gorm:"type:text"`
	TestingComments       string `json:"testing_comments" gorm:"type:text"`
	DeploymentComments    string `json:"deployment_comments" gorm:"type:text"`
	SecurityComments      string `json:"security_comments" gorm:"type:text"`
	PerformanceComments   string `json:"performance_comments" gorm:"type:text"`

	// Recommendations
	Recommendations string `json:"recommendations" gorm:"type:text"`

	// Status and Timestamps
	Status      EvaluationStatus `json:"status" gorm:"type:varchar(20);not null;default:'draft'" validate:"required"`
	EvaluatedAt *time.Time       `json:"evaluated_at"`
	CreatedAt   time.Time        `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time        `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	Submission Submission `json:"submission,omitempty" gorm:"foreignKey:SubmissionID"`
}

type EvaluationStatus string

const (
	EvaluationStatusBorrador   EvaluationStatus = "BORRADOR"
	EvaluationStatusCompletada EvaluationStatus = "COMPLETADA"
	EvaluationStatusPublicada  EvaluationStatus = "PUBLICADA"
)

func (es EvaluationStatus) String() string {
	return string(es)
}

func (es EvaluationStatus) IsValid() bool {
	switch es {
	case EvaluationStatusBorrador, EvaluationStatusCompletada, EvaluationStatusPublicada:
		return true
	default:
		return false
	}
}

func (e *Evaluation) CalculateTotalScore() {
	weights := map[string]float64{
		"functionality": 0.20,
		"code_quality":  0.15,
		"architecture":  0.15,
		"documentation": 0.10,
		"testing":       0.15,
		"deployment":    0.10,
		"security":      0.10,
		"performance":   0.05,
	}

	e.TotalScore = e.FunctionalityScore*weights["functionality"] +
		e.CodeQualityScore*weights["code_quality"] +
		e.ArchitectureScore*weights["architecture"] +
		e.DocumentationScore*weights["documentation"] +
		e.TestingScore*weights["testing"] +
		e.DeploymentScore*weights["deployment"] +
		e.SecurityScore*weights["security"] +
		e.PerformanceScore*weights["performance"]
}

func (e *Evaluation) CalculateGrade() {
	switch {
	case e.TotalScore >= 90:
		e.Grade = "A"
	case e.TotalScore >= 80:
		e.Grade = "B"
	case e.TotalScore >= 70:
		e.Grade = "C"
	case e.TotalScore >= 60:
		e.Grade = "D"
	default:
		e.Grade = "F"
	}
}

func (e *Evaluation) Complete() {
	e.CalculateTotalScore()
	e.CalculateGrade()
	e.Status = EvaluationStatusCompletada
	now := time.Now()
	e.EvaluatedAt = &now
}

func (e *Evaluation) CanBeModified() bool {
	return e.Status == EvaluationStatusBorrador
}

func (e *Evaluation) IsCompleted() bool {
	return e.Status == EvaluationStatusCompletada || e.Status == EvaluationStatusPublicada
}
