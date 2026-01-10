package entities

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PlanType representa el tipo de plan de mejoramiento según Acuerdo 009
type PlanType string

const (
	PlanTypeAcademico     PlanType = "ACADEMICO"     // Bajo rendimiento académico
	PlanTypeDisciplinario PlanType = "DISCIPLINARIO" // Faltas disciplinarias
	PlanTypeActitudinal   PlanType = "ACTITUDINAL"   // Problemas de actitud/comportamiento
	PlanTypeMixto         PlanType = "MIXTO"         // Combinación de factores
)

// PlanStatus representa el estado actual del plan de mejoramiento
type PlanStatus string

const (
	PlanStatusBorrador   PlanStatus = "BORRADOR"   // Plan en elaboración
	PlanStatusActivo     PlanStatus = "ACTIVO"     // Plan en ejecución
	PlanStatusCompletado PlanStatus = "COMPLETADO" // Plan finalizado exitosamente
	PlanStatusIncumplido PlanStatus = "INCUMPLIDO" // Plan no cumplido
	PlanStatusCancelado  PlanStatus = "CANCELADO"  // Plan cancelado por circunstancias
)

// Objective represents a specific objective in the improvement plan
type Objective struct {
	ID          string    `json:"id"`
	Description string    `json:"description"`
	Target      string    `json:"target"`
	Deadline    time.Time `json:"deadline"`
	Completed   bool      `json:"completed"`
}

// Activity represents an activity to be completed
type Activity struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	DueDate     time.Time  `json:"due_date"`
	Completed   bool       `json:"completed"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

// SuccessCriteria represents criteria for success
type SuccessCriteria struct {
	ID          string  `json:"id"`
	Description string  `json:"description"`
	Metric      string  `json:"metric"`
	Target      float64 `json:"target"`
	Achieved    bool    `json:"achieved"`
}

// ImprovementPlan representa un plan de mejoramiento académico/disciplinario
type ImprovementPlan struct {
	// ID único del plan (UUID v4 generado automáticamente)
	ID uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	// ID del aprendiz al que pertenece el plan
	StudentID uuid.UUID `json:"student_id" gorm:"type:uuid;not null"`
	// ID del caso que originó el plan (opcional, puede ser preventivo)
	StudentCaseID *uuid.UUID `json:"student_case_id,omitempty" gorm:"type:uuid"`
	// Tipo de plan: ACADEMICO, DISCIPLINARIO, ACTITUDINAL, MIXTO
	PlanType PlanType `json:"plan_type" gorm:"type:varchar(20);not null;check:plan_type IN ('ACADEMICO','DISCIPLINARIO','ACTITUDINAL','MIXTO')"`
	// Fecha de inicio del plan
	StartDate time.Time `json:"start_date" gorm:"not null"`
	// Fecha límite de cumplimiento
	EndDate time.Time `json:"end_date" gorm:"not null"`
	// Objetivos específicos del plan (JSONB)
	Objectives []Objective `json:"objectives" gorm:"type:jsonb;not null"`
	// Actividades a realizar (JSONB)
	Activities []Activity `json:"activities" gorm:"type:jsonb;not null"`
	// Criterios de éxito medibles (JSONB)
	SuccessCriteria []SuccessCriteria `json:"success_criteria" gorm:"type:jsonb;not null"`
	// Instructor responsable del seguimiento
	ResponsibleInstructorID *uuid.UUID `json:"responsible_instructor_id,omitempty" gorm:"type:uuid"`
	// Estado actual del plan
	CurrentStatus PlanStatus `json:"current_status" gorm:"type:varchar(20);not null;default:'BORRADOR';check:current_status IN ('BORRADOR','ACTIVO','COMPLETADO','INCUMPLIDO','CANCELADO')"`
	// Porcentaje de cumplimiento (0-100)
	CompliancePercentage int16 `json:"compliance_percentage" gorm:"type:smallint;default:0;check:compliance_percentage >= 0 AND compliance_percentage <= 100"`
	// Evaluación final del instructor (al cerrar el plan)
	FinalEvaluation *string `json:"final_evaluation,omitempty" gorm:"type:text"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime;not null"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime;not null"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"` // Soft delete

	// --- Relaciones ---
	StudentCase *StudentCase `json:"-" gorm:"foreignKey:StudentCaseID"`
}

// BeforeCreate sets the ID before creating a new improvement plan
func (ip *ImprovementPlan) BeforeCreate(tx *gorm.DB) error {
	if ip.ID == uuid.Nil {
		ip.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name for ImprovementPlan
func (ImprovementPlan) TableName() string {
	return "mevalservice_schema.improvement_plans"
}

// IsActivo checks if the improvement plan is currently active
func (ip *ImprovementPlan) IsActivo() bool {
	return ip.CurrentStatus == PlanStatusActivo
}

// IsCompletado checks if the improvement plan is completed
func (ip *ImprovementPlan) IsCompletado() bool {
	return ip.CurrentStatus == PlanStatusCompletado
}

// IsIncumplido checks if the improvement plan has failed
func (ip *ImprovementPlan) IsIncumplido() bool {
	return ip.CurrentStatus == PlanStatusIncumplido
}

// IsVencido checks if the improvement plan is overdue
func (ip *ImprovementPlan) IsVencido() bool {
	return time.Now().After(ip.EndDate) && ip.CurrentStatus == PlanStatusActivo
}

// CalculateCompliancePercentage calculates the current compliance percentage
func (ip *ImprovementPlan) CalculateCompliancePercentage() int16 {
	if len(ip.Activities) == 0 {
		return 0
	}

	completedActivities := 0
	for _, activity := range ip.Activities {
		if activity.Completed {
			completedActivities++
		}
	}

	percentage := int16(float64(completedActivities) / float64(len(ip.Activities)) * 100)
	ip.CompliancePercentage = percentage
	return percentage
}

// GetCompletedObjectives returns the number of completed objectives
func (ip *ImprovementPlan) GetCompletedObjectives() int {
	completed := 0
	for _, objective := range ip.Objectives {
		if objective.Completed {
			completed++
		}
	}
	return completed
}

// GetObjectivesJSON returns objectives as JSON string
func (ip *ImprovementPlan) GetObjectivesJSON() (string, error) {
	bytes, err := json.Marshal(ip.Objectives)
	return string(bytes), err
}

// SetObjectivesFromJSON sets objectives from JSON string
func (ip *ImprovementPlan) SetObjectivesFromJSON(jsonStr string) error {
	return json.Unmarshal([]byte(jsonStr), &ip.Objectives)
}

// GetActivitiesJSON returns activities as JSON string
func (ip *ImprovementPlan) GetActivitiesJSON() (string, error) {
	bytes, err := json.Marshal(ip.Activities)
	return string(bytes), err
}

// SetActivitiesFromJSON sets activities from JSON string
func (ip *ImprovementPlan) SetActivitiesFromJSON(jsonStr string) error {
	return json.Unmarshal([]byte(jsonStr), &ip.Activities)
}

// MarkActivityCompleted marks an activity as completed
func (ip *ImprovementPlan) MarkActivityCompleted(activityID string) bool {
	for i, activity := range ip.Activities {
		if activity.ID == activityID {
			now := time.Now()
			ip.Activities[i].Completed = true
			ip.Activities[i].CompletedAt = &now
			ip.CalculateCompliancePercentage()
			return true
		}
	}
	return false
}
