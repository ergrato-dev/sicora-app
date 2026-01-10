package dto

import (
	"time"

	"github.com/google/uuid"
)

// Committee DTOs - Alineado con Acuerdo OneVision 009/2024

// CreateCommitteeRequest solicitud para crear un comité
type CreateCommitteeRequest struct {
	// Fecha programada del comité
	CommitteeDate time.Time `json:"committee_date" validate:"required"`
	// Tipo de comité (único valor: SEGUIMIENTO_EVALUACION)
	CommitteeType string `json:"committee_type" validate:"required,oneof=SEGUIMIENTO_EVALUACION"`
	// ID del programa de formación (opcional)
	ProgramID *uuid.UUID `json:"program_id,omitempty"`
	// Periodo académico (ej: 2024-2)
	AcademicPeriod string `json:"academic_period" validate:"required,min=3,max=20"`
}

// UpdateCommitteeRequest solicitud para actualizar un comité
type UpdateCommitteeRequest struct {
	// Nueva fecha del comité
	CommitteeDate *time.Time `json:"committee_date,omitempty"`
	// Estado del comité
	Status string `json:"status,omitempty" validate:"omitempty,oneof=PROGRAMADO EN_SESION COMPLETADO CANCELADO APLAZADO"`
	// Periodo académico
	AcademicPeriod string `json:"academic_period,omitempty" validate:"omitempty,min=3,max=20"`
	// Acta de la sesión
	SessionMinutes *string `json:"session_minutes,omitempty"`
}

// CommitteeResponse respuesta con datos del comité
type CommitteeResponse struct {
	ID              uuid.UUID                 `json:"id"`
	CommitteeDate   time.Time                 `json:"committee_date"`
	CommitteeType   string                    `json:"committee_type"`
	Status          string                    `json:"status"`
	ProgramID       *uuid.UUID                `json:"program_id,omitempty"`
	AcademicPeriod  string                    `json:"academic_period"`
	AgendaGenerated bool                      `json:"agenda_generated"`
	QuorumAchieved  bool                      `json:"quorum_achieved"`
	SessionMinutes  *string                   `json:"session_minutes,omitempty"`
	Members         []CommitteeMemberResponse `json:"members,omitempty"`
	CreatedAt       time.Time                 `json:"created_at"`
	UpdatedAt       time.Time                 `json:"updated_at"`
}

// Committee Member DTOs - Alineado con Acuerdo OneVision 009/2024

// CreateCommitteeMemberRequest solicitud para agregar miembro al comité
type CreateCommitteeMemberRequest struct {
	// ID del comité
	CommitteeID uuid.UUID `json:"committee_id" validate:"required"`
	// ID del usuario
	UserID uuid.UUID `json:"user_id" validate:"required"`
	// Rol del miembro
	MemberRole string `json:"member_role" validate:"required,oneof=COORDINADOR INSTRUCTOR ASISTENTE APRENDIZ APOYO BIENESTAR REPRESENTANTE_APRENDICES ABOGADO DIRECCION"`
	// Peso del voto (0=sin voto, 1=normal, 2=doble, 3=veto)
	VotePower int16 `json:"vote_power,omitempty" validate:"omitempty,min=0,max=3"`
}

// UpdateCommitteeMemberRequest solicitud para actualizar miembro
type UpdateCommitteeMemberRequest struct {
	// Nuevo rol
	MemberRole string `json:"member_role,omitempty" validate:"omitempty,oneof=COORDINADOR INSTRUCTOR ASISTENTE APRENDIZ APOYO BIENESTAR REPRESENTANTE_APRENDICES ABOGADO DIRECCION"`
	// Indica si está presente
	IsPresent *bool `json:"is_present,omitempty"`
	// Peso del voto
	VotePower *int16 `json:"vote_power,omitempty" validate:"omitempty,min=0,max=3"`
}

// CommitteeMemberResponse respuesta con datos del miembro
type CommitteeMemberResponse struct {
	ID          uuid.UUID `json:"id"`
	CommitteeID uuid.UUID `json:"committee_id"`
	UserID      uuid.UUID `json:"user_id"`
	MemberRole  string    `json:"member_role"`
	IsPresent   bool      `json:"is_present"`
	VotePower   int16     `json:"vote_power"`
	CreatedAt   time.Time `json:"created_at"`
}

// Student Case DTOs - Alineado con Acuerdo OneVision 009/2024

// CreateStudentCaseRequest solicitud para crear caso de aprendiz
type CreateStudentCaseRequest struct {
	// ID del aprendiz
	StudentID uuid.UUID `json:"student_id" validate:"required"`
	// ID del comité
	CommitteeID uuid.UUID `json:"committee_id" validate:"required"`
	// Tipo de caso
	CaseType string `json:"case_type" validate:"required,oneof=ACADEMICO DISCIPLINARIO INASISTENCIA FELICITACION"`
	// Indica si fue detección automática
	AutomaticDetection bool `json:"automatic_detection"`
	// Criterios de detección
	DetectionCriteria *DetectionCriteriaDTO `json:"detection_criteria,omitempty"`
	// Descripción del caso
	CaseDescription string `json:"case_description" validate:"required,min=10"`
	// Documentos de evidencia
	EvidenceDocuments []EvidenceDocumentDTO `json:"evidence_documents,omitempty"`
	// Comentarios del instructor
	InstructorComments *string `json:"instructor_comments,omitempty"`
}

// DetectionCriteriaDTO criterios de detección automática
type DetectionCriteriaDTO struct {
	AverageGrade        float64 `json:"average_grade,omitempty"`
	DisciplinaryFaults  int     `json:"disciplinary_faults,omitempty"`
	AttendanceRate      float64 `json:"attendance_rate,omitempty"`
	LeadershipIndicator bool    `json:"leadership_indicator,omitempty"`
	ComplianceRate      float64 `json:"compliance_rate,omitempty"`
	DaysOverdue         int     `json:"days_overdue,omitempty"`
}

// EvidenceDocumentDTO documento de evidencia
type EvidenceDocumentDTO struct {
	URL         string    `json:"url"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	UploadedAt  time.Time `json:"uploaded_at,omitempty"`
}

// UpdateStudentCaseRequest solicitud para actualizar caso
type UpdateStudentCaseRequest struct {
	// Estado del caso
	CaseStatus string `json:"case_status,omitempty" validate:"omitempty,oneof=REGISTRADO EN_REVISION PENDIENTE_RESOLUCION RESUELTO ARCHIVADO"`
	// Descripción del caso
	CaseDescription string `json:"case_description,omitempty" validate:"omitempty,min=10"`
	// Comentarios del instructor
	InstructorComments *string `json:"instructor_comments,omitempty"`
	// Documentos de evidencia
	EvidenceDocuments []EvidenceDocumentDTO `json:"evidence_documents,omitempty"`
}

// StudentCaseResponse respuesta con datos del caso
type StudentCaseResponse struct {
	ID                 uuid.UUID                   `json:"id"`
	StudentID          uuid.UUID                   `json:"student_id"`
	CommitteeID        uuid.UUID                   `json:"committee_id"`
	CaseType           string                      `json:"case_type"`
	CaseStatus         string                      `json:"case_status"`
	AutomaticDetection bool                        `json:"automatic_detection"`
	DetectionCriteria  *DetectionCriteriaDTO       `json:"detection_criteria,omitempty"`
	CaseDescription    string                      `json:"case_description"`
	EvidenceDocuments  []EvidenceDocumentDTO       `json:"evidence_documents,omitempty"`
	InstructorComments *string                     `json:"instructor_comments,omitempty"`
	Committee          *CommitteeResponse          `json:"committee,omitempty"`
	ImprovementPlans   []ImprovementPlanResponse   `json:"improvement_plans,omitempty"`
	Sanctions          []SanctionResponse          `json:"sanctions,omitempty"`
	Decisions          []CommitteeDecisionResponse `json:"decisions,omitempty"`
	CreatedAt          time.Time                   `json:"created_at"`
	UpdatedAt          time.Time                   `json:"updated_at"`
}

// Improvement Plan DTOs - Alineado con Acuerdo OneVision 009/2024

// ObjectiveDTO objetivo específico del plan de mejoramiento
type ObjectiveDTO struct {
	ID          string    `json:"id,omitempty"`
	Description string    `json:"description" validate:"required,min=10"`
	Target      string    `json:"target" validate:"required"`
	Deadline    time.Time `json:"deadline" validate:"required"`
	Completed   bool      `json:"completed,omitempty"`
}

// ActivityDTO actividad a completar
type ActivityDTO struct {
	ID          string     `json:"id,omitempty"`
	Name        string     `json:"name" validate:"required,min=3,max=100"`
	Description string     `json:"description" validate:"required,min=10"`
	DueDate     time.Time  `json:"due_date" validate:"required"`
	Completed   bool       `json:"completed,omitempty"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

// SuccessCriteriaDTO criterios de éxito
type SuccessCriteriaDTO struct {
	ID          string  `json:"id,omitempty"`
	Description string  `json:"description" validate:"required,min=10"`
	Metric      string  `json:"metric" validate:"required"`
	Target      float64 `json:"target" validate:"required"`
	Achieved    bool    `json:"achieved,omitempty"`
}

// CreateImprovementPlanRequest solicitud para crear plan de mejoramiento
type CreateImprovementPlanRequest struct {
	// ID del aprendiz
	StudentID uuid.UUID `json:"student_id" validate:"required"`
	// ID del caso asociado (opcional)
	StudentCaseID *uuid.UUID `json:"student_case_id,omitempty"`
	// Tipo de plan
	PlanType                string               `json:"plan_type" validate:"required,oneof=ACADEMICO DISCIPLINARIO ACTITUDINAL MIXTO"`
	StartDate               time.Time            `json:"start_date" validate:"required"`
	EndDate                 time.Time            `json:"end_date" validate:"required"`
	Objectives              []ObjectiveDTO       `json:"objectives" validate:"required,min=1"`
	Activities              []ActivityDTO        `json:"activities" validate:"required,min=1"`
	SuccessCriteria         []SuccessCriteriaDTO `json:"success_criteria" validate:"required,min=1"`
	ResponsibleInstructorID *uuid.UUID           `json:"responsible_instructor_id,omitempty"`
}

type UpdateImprovementPlanRequest struct {
	// Estado actual del plan
	CurrentStatus string `json:"current_status,omitempty" validate:"omitempty,oneof=BORRADOR ACTIVO COMPLETADO INCUMPLIDO CANCELADO"`
	// Porcentaje de cumplimiento (0-100)
	CompliancePercentage *int16               `json:"compliance_percentage,omitempty" validate:"omitempty,min=0,max=100"`
	FinalEvaluation      *string              `json:"final_evaluation,omitempty"`
	Objectives           []ObjectiveDTO       `json:"objectives,omitempty"`
	Activities           []ActivityDTO        `json:"activities,omitempty"`
	SuccessCriteria      []SuccessCriteriaDTO `json:"success_criteria,omitempty"`
}

type ImprovementPlanResponse struct {
	ID                      uuid.UUID            `json:"id"`
	StudentID               uuid.UUID            `json:"student_id"`
	StudentCaseID           *uuid.UUID           `json:"student_case_id,omitempty"`
	PlanType                string               `json:"plan_type"`
	StartDate               time.Time            `json:"start_date"`
	EndDate                 time.Time            `json:"end_date"`
	Objectives              []ObjectiveDTO       `json:"objectives"`
	Activities              []ActivityDTO        `json:"activities"`
	SuccessCriteria         []SuccessCriteriaDTO `json:"success_criteria"`
	ResponsibleInstructorID *uuid.UUID           `json:"responsible_instructor_id,omitempty"`
	CurrentStatus           string               `json:"current_status"`
	CompliancePercentage    float64              `json:"compliance_percentage"`
	FinalEvaluation         *string              `json:"final_evaluation,omitempty"`
	CreatedAt               time.Time            `json:"created_at"`
	UpdatedAt               time.Time            `json:"updated_at"`
}

// Sanction DTOs - Alineado con Acuerdo OneVision 009/2024
type CreateSanctionRequest struct {
	// ID del aprendiz
	StudentID uuid.UUID `json:"student_id" validate:"required"`
	// ID del caso asociado
	StudentCaseID uuid.UUID `json:"student_case_id" validate:"required"`
	// Tipo de sanción
	SanctionType string `json:"sanction_type" validate:"required,oneof=LLAMADO_ATENCION_VERBAL LLAMADO_ATENCION_ESCRITO PLAN_MEJORAMIENTO CONDICIONAMIENTO_MATRICULA CANCELACION_MATRICULA"`
	// Nivel de gravedad
	SeverityLevel string `json:"severity_level" validate:"required,oneof=LEVE MODERADA GRAVE MUY_GRAVE"`
	// Descripción de la sanción
	Description string `json:"description" validate:"required,min=10"`
	// Fecha de inicio
	StartDate time.Time `json:"start_date" validate:"required"`
	// Fecha de fin (opcional)
	EndDate *time.Time `json:"end_date,omitempty"`
	// Indica si requiere cumplimiento
	ComplianceRequired bool `json:"compliance_required"`
}

type UpdateSanctionRequest struct {
	// Estado de cumplimiento
	ComplianceStatus string `json:"compliance_status,omitempty" validate:"omitempty,oneof=PENDIENTE EN_PROGRESO CUMPLIDO INCUMPLIDO"`
	// Fecha de fin
	EndDate *time.Time `json:"end_date,omitempty"`
}

type SanctionResponse struct {
	ID                 uuid.UUID  `json:"id"`
	StudentID          uuid.UUID  `json:"student_id"`
	StudentCaseID      uuid.UUID  `json:"student_case_id"`
	SanctionType       string     `json:"sanction_type"`
	SeverityLevel      string     `json:"severity_level"`
	Description        string     `json:"description"`
	StartDate          time.Time  `json:"start_date"`
	EndDate            *time.Time `json:"end_date,omitempty"`
	ComplianceRequired bool       `json:"compliance_required"`
	ComplianceStatus   string     `json:"compliance_status"`
	AppealDeadline     *time.Time `json:"appeal_deadline,omitempty"`
	Appealed           bool       `json:"appealed"`
	AppealResult       *string    `json:"appeal_result,omitempty"`
	IsActive           bool       `json:"is_active"`
	IsAppealable       bool       `json:"is_appealable"`
	DurationDays       int        `json:"duration_days"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

// Committee Decision DTOs - Alineado con Acuerdo OneVision 009/2024
type CreateCommitteeDecisionRequest struct {
	// ID del comité
	CommitteeID uuid.UUID `json:"committee_id" validate:"required"`
	// ID del caso (opcional)
	StudentCaseID *uuid.UUID `json:"student_case_id,omitempty"`
	// Tipo de decisión
	Type          string    `json:"type" validate:"required,oneof=RECONOCIMIENTO SANCION RENOVACION_PLAN APELACION"`
	Title         string    `json:"title" validate:"required,min=5,max=200"`
	Description   string    `json:"description" validate:"required,min=10"`
	Resolution    string    `json:"resolution" validate:"required,min=10"`
	Justification string    `json:"justification" validate:"required,min=10"`
	VotingResult  string    `json:"voting_result,omitempty"`
	AttendeesList string    `json:"attendees_list,omitempty"`
	DecisionDate  time.Time `json:"decision_date" validate:"required"`
}

type UpdateCommitteeDecisionRequest struct {
	// Estado de la decisión
	Status string `json:"status,omitempty" validate:"omitempty,oneof=BORRADOR APROBADO EJECUTADO APELADO"`
	// Fecha de ejecución
	ExecutionDate *time.Time `json:"execution_date,omitempty"`
	// Firma del presidente
	PresidentSignature bool `json:"president_signature,omitempty"`
	// Firma del secretario
	SecretarySignature bool `json:"secretary_signature,omitempty"`
}

type CommitteeDecisionResponse struct {
	ID                 uuid.UUID  `json:"id"`
	CommitteeID        uuid.UUID  `json:"committee_id"`
	StudentCaseID      *uuid.UUID `json:"student_case_id,omitempty"`
	DecisionNumber     string     `json:"decision_number"`
	Type               string     `json:"type"`
	Title              string     `json:"title"`
	Description        string     `json:"description"`
	Resolution         string     `json:"resolution"`
	Justification      string     `json:"justification"`
	VotingResult       string     `json:"voting_result"`
	AttendeesList      string     `json:"attendees_list"`
	Status             string     `json:"status"`
	DecisionDate       time.Time  `json:"decision_date"`
	ExecutionDate      *time.Time `json:"execution_date,omitempty"`
	PresidentSignature bool       `json:"president_signature"`
	SecretarySignature bool       `json:"secretary_signature"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

// Appeal DTOs - Alineado con Acuerdo OneVision 009/2024

// SupportingDocumentDTO documento de soporte
type SupportingDocumentDTO struct {
	URL         string    `json:"url" validate:"required,url"`
	Type        string    `json:"type" validate:"required"`
	Description string    `json:"description"`
	UploadedAt  time.Time `json:"uploaded_at,omitempty"`
}

type CreateAppealRequest struct {
	SanctionID          uuid.UUID               `json:"sanction_id" validate:"required"`
	StudentID           uuid.UUID               `json:"student_id" validate:"required"`
	AppealGrounds       string                  `json:"appeal_grounds" validate:"required,min=50"`
	SupportingDocuments []SupportingDocumentDTO `json:"supporting_documents,omitempty"`
}

type UpdateAppealRequest struct {
	// Estado de admisibilidad
	AdmissibilityStatus string `json:"admissibility_status,omitempty" validate:"omitempty,oneof=PENDIENTE ADMITIDA RECHAZADA"`
	// Justificación de admisibilidad
	AdmissibilityRationale string `json:"admissibility_rationale,omitempty"`
	// ID del comité de segunda instancia
	SecondInstanceCommitteeID *uuid.UUID `json:"second_instance_committee_id,omitempty"`
	// Decisión final
	FinalDecision string `json:"final_decision,omitempty" validate:"omitempty,oneof=CONFIRMADA MODIFICADA REVOCADA"`
	// Justificación de decisión final
	FinalRationale string `json:"final_rationale,omitempty"`
}

type AppealResponse struct {
	ID                        uuid.UUID               `json:"id"`
	SanctionID                uuid.UUID               `json:"sanction_id"`
	StudentID                 uuid.UUID               `json:"student_id"`
	SubmissionDate            time.Time               `json:"submission_date"`
	DeadlineDate              time.Time               `json:"deadline_date"`
	AppealGrounds             string                  `json:"appeal_grounds"`
	SupportingDocuments       []SupportingDocumentDTO `json:"supporting_documents,omitempty"`
	AdmissibilityStatus       string                  `json:"admissibility_status"`
	AdmissibilityRationale    *string                 `json:"admissibility_rationale,omitempty"`
	SecondInstanceCommitteeID *uuid.UUID              `json:"second_instance_committee_id,omitempty"`
	FinalDecision             *string                 `json:"final_decision,omitempty"`
	FinalRationale            *string                 `json:"final_rationale,omitempty"`
	IsWithinDeadline          bool                    `json:"is_within_deadline"`
	IsAdmitted                bool                    `json:"is_admitted"`
	HasFinalDecision          bool                    `json:"has_final_decision"`
	IsSuccessful              bool                    `json:"is_successful"`
	CreatedAt                 time.Time               `json:"created_at"`
	UpdatedAt                 time.Time               `json:"updated_at"`
}

// Common DTOs
type PaginationRequest struct {
	Page     int    `json:"page" validate:"min=1"`
	PageSize int    `json:"page_size" validate:"min=1,max=100"`
	OrderBy  string `json:"order_by,omitempty"`
	Order    string `json:"order,omitempty" validate:"omitempty,oneof=asc desc"`
}

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalItems int64       `json:"total_items"`
	TotalPages int         `json:"total_pages"`
}

type ErrorResponse struct {
	Error   string            `json:"error"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
}

type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
