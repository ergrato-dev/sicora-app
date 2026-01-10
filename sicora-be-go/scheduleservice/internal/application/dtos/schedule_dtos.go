package dtos

import (
	"time"

	"github.com/google/uuid"
)

// Schedule DTOs

// CreateScheduleRequest DTO para crear un horario
type CreateScheduleRequest struct {
	AcademicGroupID uuid.UUID `json:"academic_group_id" validate:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	InstructorID    uuid.UUID `json:"instructor_id" validate:"required" example:"550e8400-e29b-41d4-a716-446655440001"`
	VenueID         uuid.UUID `json:"venue_id" validate:"required" example:"550e8400-e29b-41d4-a716-446655440002"`
	Subject         string    `json:"subject" validate:"required,min=3,max=200" example:"Programación de Software"`
	DayOfWeek       int       `json:"day_of_week" validate:"required,min=1,max=7" example:"1"`
	StartTime       string    `json:"start_time" validate:"required" example:"08:00"`
	EndTime         string    `json:"end_time" validate:"required" example:"10:00"`
	BlockIdentifier string    `json:"block_identifier" validate:"required,min=4,max=10" example:"MLUN1"`
	StartDate       string    `json:"start_date" validate:"required" example:"2024-01-15"`
	EndDate         string    `json:"end_date" validate:"required" example:"2024-06-15"`
}

// UpdateScheduleRequest DTO para actualizar un horario
type UpdateScheduleRequest struct {
	AcademicGroupID *uuid.UUID `json:"academic_group_id,omitempty"`
	InstructorID    *uuid.UUID `json:"instructor_id,omitempty"`
	VenueID         *uuid.UUID `json:"venue_id,omitempty"`
	Subject         *string    `json:"subject,omitempty" validate:"omitempty,min=3,max=200"`
	DayOfWeek       *int       `json:"day_of_week,omitempty" validate:"omitempty,min=1,max=7"`
	StartTime       *string    `json:"start_time,omitempty"`
	EndTime         *string    `json:"end_time,omitempty"`
	BlockIdentifier *string    `json:"block_identifier,omitempty" validate:"omitempty,min=4,max=10"`
	StartDate       *string    `json:"start_date,omitempty"`
	EndDate         *string    `json:"end_date,omitempty"`
	Status          *string    `json:"status,omitempty" validate:"omitempty,oneof=ACTIVE CANCELLED SUSPENDED"`
}

// ScheduleResponse DTO de respuesta para horario
type ScheduleResponse struct {
	ID              uuid.UUID              `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	AcademicGroupID uuid.UUID              `json:"academic_group_id" example:"550e8400-e29b-41d4-a716-446655440001"`
	AcademicGroup   *AcademicGroupResponse `json:"academic_group,omitempty"`
	InstructorID    uuid.UUID              `json:"instructor_id" example:"550e8400-e29b-41d4-a716-446655440002"`
	VenueID         uuid.UUID              `json:"venue_id" example:"550e8400-e29b-41d4-a716-446655440003"`
	Venue           *VenueResponse         `json:"venue,omitempty"`
	Subject         string                 `json:"subject" example:"Programación de Software"`
	DayOfWeek       int                    `json:"day_of_week" example:"1"`
	DayOfWeekName   string                 `json:"day_of_week_name" example:"Lunes"`
	StartTime       string                 `json:"start_time" example:"08:00"`
	EndTime         string                 `json:"end_time" example:"10:00"`
	BlockIdentifier string                 `json:"block_identifier" example:"MLUN1"`
	StartDate       string                 `json:"start_date" example:"2024-01-15"`
	EndDate         string                 `json:"end_date" example:"2024-06-15"`
	Status          string                 `json:"status" example:"ACTIVO"`
	IsActive        bool                   `json:"is_active" example:"true"`
	CreatedAt       time.Time              `json:"created_at"`
	UpdatedAt       time.Time              `json:"updated_at"`
}

// Academic Program DTOs

// CreateAcademicProgramRequest DTO para crear programa académico
type CreateAcademicProgramRequest struct {
	Name        string `json:"name" validate:"required,min=5,max=200" example:"Análisis y Desarrollo de Software"`
	Code        string `json:"code" validate:"required,min=2,max=20" example:"ADSO"`
	Type        string `json:"type" validate:"required,oneof=TECNICO TECNOLOGO ESPECIALIZACION CURSO_CORTO" example:"TECNOLOGO"`
	Duration    int    `json:"duration" validate:"required,min=1,max=60" example:"24"`
	Description string `json:"description,omitempty" example:"Programa de formación en desarrollo de software"`
}

// UpdateAcademicProgramRequest DTO para actualizar programa académico
type UpdateAcademicProgramRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=5,max=200"`
	Code        *string `json:"code,omitempty" validate:"omitempty,min=2,max=20"`
	Type        *string `json:"type,omitempty" validate:"omitempty,oneof=TECNICO TECNOLOGO ESPECIALIZACION CURSO_CORTO"`
	Duration    *int    `json:"duration,omitempty" validate:"omitempty,min=1,max=60"`
	Description *string `json:"description,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
}

// AcademicProgramResponse DTO de respuesta para programa académico
type AcademicProgramResponse struct {
	ID          uuid.UUID `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name        string    `json:"name" example:"Análisis y Desarrollo de Software"`
	Code        string    `json:"code" example:"ADSO"`
	Type        string    `json:"type" example:"TECNOLOGO"`
	Duration    int       `json:"duration" example:"24"`
	Description string    `json:"description" example:"Programa de formación en desarrollo de software"`
	IsActive    bool      `json:"is_active" example:"true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Academic Group DTOs

// CreateAcademicGroupRequest DTO para crear ficha/grupo
type CreateAcademicGroupRequest struct {
	Number            string    `json:"number" validate:"required,min=4,max=20" example:"2691698"`
	AcademicProgramID uuid.UUID `json:"academic_program_id" validate:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	Quarter           int       `json:"quarter" validate:"required,min=1,max=10" example:"3"`
	Year              int       `json:"year" validate:"required,min=2020,max=2030" example:"2024"`
	Shift             string    `json:"shift" validate:"required,oneof=MANANA TARDE NOCHE" example:"MANANA"`
}

// UpdateAcademicGroupRequest DTO para actualizar ficha/grupo
type UpdateAcademicGroupRequest struct {
	Number            *string    `json:"number,omitempty" validate:"omitempty,min=4,max=20"`
	AcademicProgramID *uuid.UUID `json:"academic_program_id,omitempty"`
	Quarter           *int       `json:"quarter,omitempty" validate:"omitempty,min=1,max=10"`
	Year              *int       `json:"year,omitempty" validate:"omitempty,min=2020,max=2030"`
	Shift             *string    `json:"shift,omitempty" validate:"omitempty,oneof=MANANA TARDE NOCHE"`
	IsActive          *bool      `json:"is_active,omitempty"`
}

// AcademicGroupResponse DTO de respuesta para ficha/grupo
type AcademicGroupResponse struct {
	ID                uuid.UUID                `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Number            string                   `json:"number" example:"2691698"`
	AcademicProgramID uuid.UUID                `json:"academic_program_id" example:"550e8400-e29b-41d4-a716-446655440001"`
	AcademicProgram   *AcademicProgramResponse `json:"academic_program,omitempty"`
	Quarter           int                      `json:"quarter" example:"3"`
	Year              int                      `json:"year" example:"2024"`
	Shift             string                   `json:"shift" example:"MANANA"`
	IsActive          bool                     `json:"is_active" example:"true"`
	CreatedAt         time.Time                `json:"created_at"`
	UpdatedAt         time.Time                `json:"updated_at"`
}

// Venue DTOs

// CreateVenueRequest DTO para crear ambiente/aula
type CreateVenueRequest struct {
	Name     string    `json:"name" validate:"required,min=2,max=100" example:"Laboratorio de Software"`
	Code     string    `json:"code" validate:"required,min=2,max=20" example:"LAB-SW-01"`
	Type     string    `json:"type" validate:"required,oneof=AULA LABORATORIO TALLER AUDITORIO BIBLIOTECA" example:"LABORATORIO"`
	Capacity int       `json:"capacity" validate:"required,min=1,max=100" example:"30"`
	CampusID uuid.UUID `json:"campus_id" validate:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	Floor    string    `json:"floor,omitempty" validate:"max=10" example:"2"`
}

// UpdateVenueRequest DTO para actualizar ambiente/aula
type UpdateVenueRequest struct {
	Name     *string    `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Code     *string    `json:"code,omitempty" validate:"omitempty,min=2,max=20"`
	Type     *string    `json:"type,omitempty" validate:"omitempty,oneof=AULA LABORATORIO TALLER AUDITORIO BIBLIOTECA"`
	Capacity *int       `json:"capacity,omitempty" validate:"omitempty,min=1,max=100"`
	CampusID *uuid.UUID `json:"campus_id,omitempty"`
	Floor    *string    `json:"floor,omitempty" validate:"omitempty,max=10"`
	IsActive *bool      `json:"is_active,omitempty"`
}

// VenueResponse DTO de respuesta para ambiente/aula
type VenueResponse struct {
	ID        uuid.UUID       `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name      string          `json:"name" example:"Laboratorio de Software"`
	Code      string          `json:"code" example:"LAB-SW-01"`
	Type      string          `json:"type" example:"LABORATORIO"`
	Capacity  int             `json:"capacity" example:"30"`
	CampusID  uuid.UUID       `json:"campus_id" example:"550e8400-e29b-41d4-a716-446655440001"`
	Campus    *CampusResponse `json:"campus,omitempty"`
	Floor     string          `json:"floor" example:"2"`
	IsActive  bool            `json:"is_active" example:"true"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// Campus DTOs

// CreateCampusRequest DTO para crear sede
type CreateCampusRequest struct {
	Name    string `json:"name" validate:"required,min=2,max=100" example:"Centro de Gestión y Desarrollo Sostenible Suroccidente"`
	Code    string `json:"code" validate:"required,min=2,max=20" example:"CGDSS"`
	Address string `json:"address,omitempty" example:"Calle 44 No. 1-104"`
	City    string `json:"city,omitempty" validate:"max=50" example:"Mocoa"`
}

// UpdateCampusRequest DTO para actualizar sede
type UpdateCampusRequest struct {
	Name     *string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Code     *string `json:"code,omitempty" validate:"omitempty,min=2,max=20"`
	Address  *string `json:"address,omitempty"`
	City     *string `json:"city,omitempty" validate:"omitempty,max=50"`
	IsActive *bool   `json:"is_active,omitempty"`
}

// CampusResponse DTO de respuesta para sede
type CampusResponse struct {
	ID        uuid.UUID `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name      string    `json:"name" example:"Centro de Gestión y Desarrollo Sostenible Suroccidente"`
	Code      string    `json:"code" example:"CGDSS"`
	Address   string    `json:"address" example:"Calle 44 No. 1-104"`
	City      string    `json:"city" example:"Mocoa"`
	IsActive  bool      `json:"is_active" example:"true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Bulk Operations DTOs

// BulkCreateSchedulesRequest DTO para crear horarios masivamente
type BulkCreateSchedulesRequest struct {
	Schedules []CreateScheduleRequest `json:"schedules" validate:"required,min=1,max=100"`
}

// BulkCreateSchedulesResponse DTO de respuesta para creación masiva
type BulkCreateSchedulesResponse struct {
	Created   []ScheduleResponse `json:"created"`
	Failed    []BulkError        `json:"failed"`
	Total     int                `json:"total"`
	Succeeded int                `json:"succeeded"`
	Errors    int                `json:"errors"`
}

// BulkError información de error en operaciones masivas
type BulkError struct {
	Index   int    `json:"index"`
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}

// CSV Upload DTOs

// CSVUploadRequest DTO para subir CSV
type CSVUploadRequest struct {
	File     []byte `json:"file" validate:"required"`
	Filename string `json:"filename" validate:"required"`
}

// CSVUploadResponse DTO de respuesta para subida de CSV
type CSVUploadResponse struct {
	ProcessedRows int                    `json:"processed_rows"`
	SuccessRows   int                    `json:"success_rows"`
	ErrorRows     int                    `json:"error_rows"`
	Errors        []CSVError             `json:"errors,omitempty"`
	Created       []ScheduleResponse     `json:"created,omitempty"`
	Summary       map[string]interface{} `json:"summary"`
}

// CSVError información de error en procesamiento de CSV
type CSVError struct {
	Row     int    `json:"row"`
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}

// Pagination DTOs

// PaginatedResponse respuesta paginada genérica
type PaginatedResponse[T any] struct {
	Data       []T              `json:"data"`
	Pagination PaginationMeta   `json:"pagination"`
	Links      *PaginationLinks `json:"links,omitempty"`
}

// PaginationMeta metadatos de paginación
type PaginationMeta struct {
	Page     int   `json:"page"`
	PageSize int   `json:"page_size"`
	Total    int64 `json:"total"`
	Pages    int   `json:"pages"`
	HasNext  bool  `json:"has_next"`
	HasPrev  bool  `json:"has_prev"`
}

// PaginationLinks enlaces HATEOAS para paginación
type PaginationLinks struct {
	Self  string  `json:"self"`
	First string  `json:"first"`
	Last  string  `json:"last"`
	Next  *string `json:"next,omitempty"`
	Prev  *string `json:"prev,omitempty"`
}

// Utility methods

// GetDayOfWeekName retorna el nombre del día de la semana
func GetDayOfWeekName(day int) string {
	days := map[int]string{
		1: "Lunes",
		2: "Martes",
		3: "Miércoles",
		4: "Jueves",
		5: "Viernes",
		6: "Sábado",
		7: "Domingo",
	}
	if name, exists := days[day]; exists {
		return name
	}
	return "Desconocido"
}

// CalculatePages calcula el número total de páginas
func CalculatePages(total int64, pageSize int) int {
	if pageSize <= 0 {
		return 0
	}
	pages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		pages++
	}
	return pages
}

// ListSchedulesRequest DTO para listar horarios con filtros
type ListSchedulesRequest struct {
	Page            int        `json:"page" validate:"min=1" example:"1"`
	PageSize        int        `json:"page_size" validate:"min=1,max=100" example:"10"`
	AcademicGroupID *uuid.UUID `json:"academic_group_id,omitempty"`
	InstructorID    *uuid.UUID `json:"instructor_id,omitempty"`
	VenueID         *uuid.UUID `json:"venue_id,omitempty"`
	DayOfWeek       *int       `json:"day_of_week,omitempty" validate:"omitempty,min=1,max=7"`
	Status          string     `json:"status,omitempty" validate:"omitempty,oneof=ACTIVE CANCELLED SUSPENDED"`
	Subject         string     `json:"subject,omitempty"`
}
