package entities

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AdmissibilityStatus representa el estado de admisibilidad de una apelación
type AdmissibilityStatus string

const (
	AdmissibilityStatusPendiente AdmissibilityStatus = "PENDIENTE" // En espera de revisión
	AdmissibilityStatusAdmitida  AdmissibilityStatus = "ADMITIDA"  // Apelación admitida para revisión
	AdmissibilityStatusRechazada AdmissibilityStatus = "RECHAZADA" // Apelación rechazada por inadmisible
)

// FinalDecision representa la decisión final sobre una apelación
type FinalDecision string

const (
	FinalDecisionConfirmada FinalDecision = "CONFIRMADA" // Se confirma la sanción original
	FinalDecisionModificada FinalDecision = "MODIFICADA" // Se modifica la sanción
	FinalDecisionRevocada   FinalDecision = "REVOCADA"   // Se revoca la sanción
)

// SupportingDocument representa un documento de soporte para la apelación
type SupportingDocument struct {
	URL         string    `json:"url"`         // URL del documento
	Type        string    `json:"type"`        // Tipo: PDF, imagen, etc.
	Description string    `json:"description"` // Descripción del contenido
	UploadedAt  time.Time `json:"uploaded_at"` // Fecha de carga
}

// Appeal representa un proceso de apelación a una sanción
type Appeal struct {
	// ID único de la apelación (UUID v4)
	ID uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	// ID de la sanción que se apela
	SanctionID uuid.UUID `json:"sanction_id" gorm:"type:uuid;not null"`
	// ID del aprendiz que presenta la apelación
	StudentID uuid.UUID `json:"student_id" gorm:"type:uuid;not null"`
	// Fecha de presentación de la apelación
	SubmissionDate time.Time `json:"submission_date" gorm:"not null"`
	// Fecha límite legal para presentar (5 días hábiles)
	DeadlineDate time.Time `json:"deadline_date" gorm:"not null"`
	// Argumentos y fundamentos de la apelación
	AppealGrounds string `json:"appeal_grounds" gorm:"type:text;not null"`
	// Documentos de soporte (evidencias, certificados, etc.)
	SupportingDocuments []SupportingDocument `json:"supporting_documents" gorm:"type:jsonb"`
	// Estado de admisibilidad de la apelación
	AdmissibilityStatus AdmissibilityStatus `json:"admissibility_status" gorm:"type:varchar(20);not null;default:'PENDIENTE';check:admissibility_status IN ('PENDIENTE','ADMITIDA','RECHAZADA')"`
	// Justificación de la decisión de admisibilidad
	AdmissibilityRationale *string `json:"admissibility_rationale,omitempty" gorm:"type:text"`
	// Comité de segunda instancia (si aplica)
	SecondInstanceCommitteeID *uuid.UUID `json:"second_instance_committee_id,omitempty" gorm:"type:uuid"`
	// Decisión final sobre la apelación
	FinalDecision *FinalDecision `json:"final_decision,omitempty" gorm:"type:varchar(20);check:final_decision IN ('CONFIRMADA','MODIFICADA','REVOCADA')"`
	// Justificación de la decisión final
	FinalRationale *string `json:"final_rationale,omitempty" gorm:"type:text"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime;not null"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime;not null"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"` // Soft delete

	// --- Relaciones ---
	Sanction                Sanction   `json:"-" gorm:"foreignKey:SanctionID"`
	SecondInstanceCommittee *Committee `json:"second_instance_committee,omitempty" gorm:"foreignKey:SecondInstanceCommitteeID"`
}

// BeforeCreate sets the ID before creating a new appeal
func (a *Appeal) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name for Appeal
func (Appeal) TableName() string {
	return "mevalservice_schema.appeals"
}

// IsWithinDeadline verifica si la apelación se presentó dentro del plazo legal
func (a *Appeal) IsWithinDeadline() bool {
	return a.SubmissionDate.Before(a.DeadlineDate) || a.SubmissionDate.Equal(a.DeadlineDate)
}

// IsAdmitida verifica si la apelación ha sido admitida
func (a *Appeal) IsAdmitida() bool {
	return a.AdmissibilityStatus == AdmissibilityStatusAdmitida
}

// IsRechazada verifica si la apelación ha sido rechazada
func (a *Appeal) IsRechazada() bool {
	return a.AdmissibilityStatus == AdmissibilityStatusRechazada
}

// IsPendiente verifica si la apelación está pendiente de revisión
func (a *Appeal) IsPendiente() bool {
	return a.AdmissibilityStatus == AdmissibilityStatusPendiente
}

// HasFinalDecision verifica si se ha tomado una decisión final
func (a *Appeal) HasFinalDecision() bool {
	return a.FinalDecision != nil
}

// IsExitosa verifica si la apelación fue exitosa (modificada o revocada)
func (a *Appeal) IsExitosa() bool {
	return a.FinalDecision != nil &&
		(*a.FinalDecision == FinalDecisionModificada || *a.FinalDecision == FinalDecisionRevocada)
}

// Admitir admite la apelación para revisión
func (a *Appeal) Admitir(rationale string) {
	a.AdmissibilityStatus = AdmissibilityStatusAdmitida
	a.AdmissibilityRationale = &rationale
}

// Rechazar rechaza la apelación
func (a *Appeal) Rechazar(rationale string) {
	a.AdmissibilityStatus = AdmissibilityStatusRechazada
	a.AdmissibilityRationale = &rationale
}

// SetFinalDecision establece la decisión final de la apelación
func (a *Appeal) SetFinalDecision(decision FinalDecision, rationale string) {
	a.FinalDecision = &decision
	a.FinalRationale = &rationale
}

// AddSupportingDocument adds a supporting document to the appeal
func (a *Appeal) AddSupportingDocument(doc SupportingDocument) {
	if a.SupportingDocuments == nil {
		a.SupportingDocuments = make([]SupportingDocument, 0)
	}
	doc.UploadedAt = time.Now()
	a.SupportingDocuments = append(a.SupportingDocuments, doc)
}

// GetSupportingDocumentsJSON returns supporting documents as JSON string
func (a *Appeal) GetSupportingDocumentsJSON() (string, error) {
	bytes, err := json.Marshal(a.SupportingDocuments)
	return string(bytes), err
}

// SetSupportingDocumentsFromJSON sets supporting documents from JSON string
func (a *Appeal) SetSupportingDocumentsFromJSON(jsonStr string) error {
	return json.Unmarshal([]byte(jsonStr), &a.SupportingDocuments)
}
