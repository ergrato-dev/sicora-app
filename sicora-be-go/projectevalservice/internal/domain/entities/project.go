package entities

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID              uuid.UUID     `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name            string        `json:"name" gorm:"not null" validate:"required,min=3,max=200"`
	Description     string        `json:"description" gorm:"type:text"`
	TechnologyStack string        `json:"technology_stack" gorm:"not null" validate:"required"`
	Requirements    string        `json:"requirements" gorm:"type:text"`
	DeliveryDate    time.Time     `json:"delivery_date" gorm:"not null" validate:"required"`
	MaxScore        float64       `json:"max_score" gorm:"not null;default:100" validate:"required,min=0"`
	Status          ProjectStatus `json:"status" gorm:"type:varchar(20);not null;default:'active'" validate:"required"`
	InstructorID    uuid.UUID     `json:"instructor_id" gorm:"type:uuid;not null" validate:"required"`
	CreatedAt       time.Time     `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time     `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	Submissions []Submission `json:"submissions,omitempty" gorm:"foreignKey:ProjectID"`
}

type ProjectStatus string

const (
	ProjectStatusActivo    ProjectStatus = "ACTIVO"
	ProjectStatusInactivo  ProjectStatus = "INACTIVO"
	ProjectStatusArchivado ProjectStatus = "ARCHIVADO"
)

func (ps ProjectStatus) String() string {
	return string(ps)
}

func (ps ProjectStatus) IsValid() bool {
	switch ps {
	case ProjectStatusActivo, ProjectStatusInactivo, ProjectStatusArchivado:
		return true
	default:
		return false
	}
}

func (p *Project) IsActive() bool {
	return p.Status == ProjectStatusActivo
}

func (p *Project) IsDeliveryDatePassed() bool {
	return time.Now().After(p.DeliveryDate)
}

func (p *Project) CanReceiveSubmissions() bool {
	return p.IsActive() && !p.IsDeliveryDatePassed()
}
