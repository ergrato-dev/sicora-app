package entities

import (
	"time"

	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

type Report struct {
	ID           uuid.UUID                 `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	PeriodID     uuid.UUID                 `json:"period_id" gorm:"type:uuid;not null;index"`
	Type         valueobjects.ReportType   `json:"type" gorm:"type:varchar(50);not null"`
	Status       valueobjects.ReportStatus `json:"status" gorm:"type:varchar(20);not null;default:'pending'"`
	Title        string                    `json:"title" gorm:"type:varchar(255);not null"`
	Description  string                    `json:"description" gorm:"type:text"`
	Parameters   map[string]interface{}    `json:"parameters" gorm:"type:jsonb"`
	Results      map[string]interface{}    `json:"results" gorm:"type:jsonb"`
	FilePath     string                    `json:"file_path" gorm:"type:varchar(500)"`
	GeneratedBy  uuid.UUID                 `json:"generated_by" gorm:"type:uuid;not null;index"`
	GeneratedAt  *time.Time                `json:"generated_at"`
	ErrorMessage string                    `json:"error_message" gorm:"type:text"`
	CreatedAt    time.Time                 `json:"created_at" gorm:"not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt    time.Time                 `json:"updated_at" gorm:"not null;default:CURRENT_TIMESTAMP"`

	Period *EvaluationPeriod `json:"period,omitempty" gorm:"foreignKey:PeriodID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func NewReport(periodID, generatedBy uuid.UUID, reportType valueobjects.ReportType, title, description string, parameters map[string]interface{}) *Report {
	return &Report{
		ID:          uuid.New(),
		PeriodID:    periodID,
		Type:        reportType,
		Status:      valueobjects.ReportStatusPending,
		Title:       title,
		Description: description,
		Parameters:  parameters,
		GeneratedBy: generatedBy,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

func (r *Report) SetGenerating() {
	r.Status = valueobjects.ReportStatusGenerating
	r.UpdatedAt = time.Now()
}

func (r *Report) SetCompleted(filePath string, results map[string]interface{}) {
	r.Status = valueobjects.ReportStatusCompleted
	r.FilePath = filePath
	r.Results = results
	now := time.Now()
	r.GeneratedAt = &now
	r.UpdatedAt = now
}

func (r *Report) SetFailed(errorMessage string) {
	r.Status = valueobjects.ReportStatusFailed
	r.ErrorMessage = errorMessage
	r.UpdatedAt = time.Now()
}

func (r *Report) UpdateParameters(parameters map[string]interface{}) {
	r.Parameters = parameters
	r.UpdatedAt = time.Now()
}

func (r *Report) IsValid() bool {
	return r.Type.IsValid() && r.Status.IsValid() && r.Title != ""
}
