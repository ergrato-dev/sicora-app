package entities

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CaseType represents the type of student case according to Agreement 009
type CaseType string

const (
	CaseTypeAcademico     CaseType = "ACADEMICO"
	CaseTypeDisciplinario CaseType = "DISCIPLINARIO"
	CaseTypeInasistencia  CaseType = "INASISTENCIA"
	CaseTypeFelicitacion  CaseType = "FELICITACION"
)

// CaseStatus represents the current status of a student case
type CaseStatus string

const (
	CaseStatusRegistrado          CaseStatus = "REGISTRADO"
	CaseStatusEnRevision          CaseStatus = "EN_REVISION"
	CaseStatusPendienteResolucion CaseStatus = "PENDIENTE_RESOLUCION"
	CaseStatusResuelto            CaseStatus = "RESUELTO"
	CaseStatusArchivado           CaseStatus = "ARCHIVADO"
)

// DetectionCriteria represents the criteria used for automatic detection
type DetectionCriteria struct {
	AverageGrade        float64 `json:"average_grade,omitempty"`
	DisciplinaryFaults  int     `json:"disciplinary_faults,omitempty"`
	AttendanceRate      float64 `json:"attendance_rate,omitempty"`
	LeadershipIndicator bool    `json:"leadership_indicator,omitempty"`
	ComplianceRate      float64 `json:"compliance_rate,omitempty"`
	DaysOverdue         int     `json:"days_overdue,omitempty"`
}

// EvidenceDocument represents a document URL and metadata
type EvidenceDocument struct {
	URL         string    `json:"url"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	UploadedAt  time.Time `json:"uploaded_at"`
}

// StudentCase represents a case for student evaluation
type StudentCase struct {
	ID                 uuid.UUID          `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	StudentID          uuid.UUID          `json:"student_id" gorm:"type:uuid;not null"`
	CommitteeID        uuid.UUID          `json:"committee_id" gorm:"type:uuid;not null"`
	CaseType           CaseType           `json:"case_type" gorm:"type:varchar(20);not null;check:case_type IN ('ACADEMICO','DISCIPLINARIO','INASISTENCIA','FELICITACION')"`
	CaseStatus         CaseStatus         `json:"case_status" gorm:"type:varchar(25);not null;default:'REGISTRADO';check:case_status IN ('REGISTRADO','EN_REVISION','PENDIENTE_RESOLUCION','RESUELTO','ARCHIVADO')"`
	AutomaticDetection bool               `json:"automatic_detection" gorm:"default:true"`
	DetectionCriteria  DetectionCriteria  `json:"detection_criteria" gorm:"type:jsonb"`
	CaseDescription    string             `json:"case_description" gorm:"type:text"`
	EvidenceDocuments  []EvidenceDocument `json:"evidence_documents" gorm:"type:jsonb"`
	InstructorComments *string            `json:"instructor_comments,omitempty" gorm:"type:text"`
	CreatedAt          time.Time          `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt          time.Time          `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	Committee        Committee           `json:"-" gorm:"foreignKey:CommitteeID"`
	ImprovementPlans []ImprovementPlan   `json:"improvement_plans,omitempty" gorm:"foreignKey:StudentCaseID"`
	Sanctions        []Sanction          `json:"sanctions,omitempty" gorm:"foreignKey:StudentCaseID"`
	Decisions        []CommitteeDecision `json:"decisions,omitempty" gorm:"foreignKey:StudentCaseID"`
}

// BeforeCreate sets the ID before creating a new student case
func (sc *StudentCase) BeforeCreate(tx *gorm.DB) error {
	if sc.ID == uuid.Nil {
		sc.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name for StudentCase
func (StudentCase) TableName() string {
	return "mevalservice_schema.student_cases"
}

// IsFelicitacion checks if this is a recognition/felicitacion case
func (sc *StudentCase) IsFelicitacion() bool {
	return sc.CaseType == CaseTypeFelicitacion
}

// IsDisciplinario checks if this is a disciplinary case
func (sc *StudentCase) IsDisciplinario() bool {
	return sc.CaseType == CaseTypeDisciplinario
}

// IsAcademico checks if this is an academic case
func (sc *StudentCase) IsAcademico() bool {
	return sc.CaseType == CaseTypeAcademico
}

// IsResuelto checks if the case is resolved
func (sc *StudentCase) IsResuelto() bool {
	return sc.CaseStatus == CaseStatusResuelto
}

// AddEvidenceDocument adds a new evidence document to the case
func (sc *StudentCase) AddEvidenceDocument(doc EvidenceDocument) {
	if sc.EvidenceDocuments == nil {
		sc.EvidenceDocuments = make([]EvidenceDocument, 0)
	}
	doc.UploadedAt = time.Now()
	sc.EvidenceDocuments = append(sc.EvidenceDocuments, doc)
}

// GetDetectionCriteriaJSON returns detection criteria as JSON string
func (sc *StudentCase) GetDetectionCriteriaJSON() (string, error) {
	bytes, err := json.Marshal(sc.DetectionCriteria)
	return string(bytes), err
}

// SetDetectionCriteriaFromJSON sets detection criteria from JSON string
func (sc *StudentCase) SetDetectionCriteriaFromJSON(jsonStr string) error {
	return json.Unmarshal([]byte(jsonStr), &sc.DetectionCriteria)
}
