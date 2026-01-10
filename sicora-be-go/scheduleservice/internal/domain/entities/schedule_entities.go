package entities

import (
	"time"

	"github.com/google/uuid"
)

// Campus representa una sede educativa
type Campus struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name      string    `json:"name" gorm:"column:name;type:varchar(100);not null" validate:"required,min=2,max=100"`
	Code      string    `json:"code" gorm:"column:code;type:varchar(20);uniqueIndex;not null" validate:"required,min=2,max=20"`
	Address   string    `json:"address" gorm:"column:address;type:text"`
	City      string    `json:"city" gorm:"column:city;type:varchar(50)" validate:"max=50"`
	IsActive  bool      `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// AcademicProgram representa un programa académico (Técnico, Tecnólogo, etc.)
type AcademicProgram struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"column:name;type:varchar(200);not null" validate:"required,min=5,max=200"`
	Code        string    `json:"code" gorm:"column:code;type:varchar(20);uniqueIndex;not null" validate:"required,min=2,max=20"`
	Type        string    `json:"type" gorm:"column:type;type:varchar(50);not null" validate:"required,oneof=TECNICO TECNOLOGO ESPECIALIZACION CURSO_CORTO"`
	Duration    int       `json:"duration" gorm:"column:duration;not null" validate:"required,min=1,max=60"` // Duración en meses
	IsActive    bool      `json:"is_active" gorm:"column:is_active;default:true"`
	Description string    `json:"description" gorm:"column:description;type:text"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// AcademicGroup representa una ficha/grupo de estudiantes
type AcademicGroup struct {
	ID                uuid.UUID        `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Number            string           `json:"number" gorm:"column:number;type:varchar(20);uniqueIndex;not null" validate:"required,min=4,max=20"`
	AcademicProgramID uuid.UUID        `json:"academic_program_id" gorm:"column:academic_program_id;type:uuid;not null" validate:"required"`
	AcademicProgram   *AcademicProgram `json:"academic_program,omitempty" gorm:"foreignKey:AcademicProgramID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Quarter           int              `json:"quarter" gorm:"column:quarter;not null" validate:"required,min=1,max=10"`
	Year              int              `json:"year" gorm:"column:year;not null" validate:"required,min=2020,max=2030"`
	Shift             string           `json:"shift" gorm:"column:shift;type:varchar(20);not null" validate:"required,oneof=MANANA TARDE NOCHE"`
	IsActive          bool             `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt         time.Time        `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt         time.Time        `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// Venue representa un ambiente/aula/laboratorio
type Venue struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name      string    `json:"name" gorm:"column:name;type:varchar(100);not null" validate:"required,min=2,max=100"`
	Code      string    `json:"code" gorm:"column:code;type:varchar(20);uniqueIndex;not null" validate:"required,min=2,max=20"`
	Type      string    `json:"type" gorm:"column:type;type:varchar(50);not null" validate:"required,oneof=AULA LABORATORIO TALLER AUDITORIO BIBLIOTECA"`
	Capacity  int       `json:"capacity" gorm:"column:capacity;not null" validate:"required,min=1,max=100"`
	CampusID  uuid.UUID `json:"campus_id" gorm:"column:campus_id;type:uuid;not null" validate:"required"`
	Campus    *Campus   `json:"campus,omitempty" gorm:"foreignKey:CampusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Floor     string    `json:"floor" gorm:"column:floor;type:varchar(10)" validate:"max=10"`
	IsActive  bool      `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// Schedule representa un horario específico
type Schedule struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	AcademicGroupID uuid.UUID      `json:"academic_group_id" gorm:"column:academic_group_id;type:uuid;not null" validate:"required"`
	AcademicGroup   *AcademicGroup `json:"academic_group,omitempty" gorm:"foreignKey:AcademicGroupID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	InstructorID    uuid.UUID      `json:"instructor_id" gorm:"column:instructor_id;type:uuid;not null" validate:"required"`
	VenueID         uuid.UUID      `json:"venue_id" gorm:"column:venue_id;type:uuid;not null" validate:"required"`
	Venue           *Venue         `json:"venue,omitempty" gorm:"foreignKey:VenueID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Subject         string         `json:"subject" gorm:"column:subject;type:varchar(200);not null" validate:"required,min=3,max=200"`
	DayOfWeek       int            `json:"day_of_week" gorm:"column:day_of_week;not null" validate:"required,min=1,max=7"` // 1=Lunes, 7=Domingo
	StartTime       time.Time      `json:"start_time" gorm:"column:start_time;type:time;not null" validate:"required"`
	EndTime         time.Time      `json:"end_time" gorm:"column:end_time;type:time;not null" validate:"required"`
	BlockIdentifier string         `json:"block_identifier" gorm:"column:block_identifier;type:varchar(10);not null" validate:"required,min=4,max=10"` // MLUN1, TMAR2, etc.
	StartDate       time.Time      `json:"start_date" gorm:"column:start_date;type:date;not null" validate:"required"`
	EndDate         time.Time      `json:"end_date" gorm:"column:end_date;type:date;not null" validate:"required"`
	Status          string         `json:"status" gorm:"column:status;type:varchar(20);default:ACTIVO" validate:"oneof=ACTIVO CANCELADO SUSPENDIDO"`
	IsActive        bool           `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt       time.Time      `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt       time.Time      `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// TableName especifica el nombre de la tabla para cada entidad
func (Campus) TableName() string          { return "campuses" }
func (AcademicProgram) TableName() string { return "academic_programs" }
func (AcademicGroup) TableName() string   { return "academic_groups" }
func (Venue) TableName() string           { return "venues" }
func (Schedule) TableName() string        { return "schedules" }

// Métodos de validación de negocio

// IsValidTimeRange verifica si el rango de tiempo es válido
func (s *Schedule) IsValidTimeRange() bool {
	return s.StartTime.Before(s.EndTime)
}

// IsValidDateRange verifica si el rango de fechas es válido
func (s *Schedule) IsValidDateRange() bool {
	return s.StartDate.Before(s.EndDate) || s.StartDate.Equal(s.EndDate)
}

// GetShiftFromTime determina la jornada basada en la hora de inicio
func (s *Schedule) GetShiftFromTime() string {
	hour := s.StartTime.Hour()
	switch {
	case hour >= 6 && hour < 12:
		return "MANANA"
	case hour >= 12 && hour < 18:
		return "TARDE"
	case hour >= 18 && hour <= 22:
		return "NOCHE"
	default:
		return "UNKNOWN"
	}
}

// IsWeekday verifica si el día es entre semana
func (s *Schedule) IsWeekday() bool {
	return s.DayOfWeek >= 1 && s.DayOfWeek <= 5 // Lunes a Viernes
}

// IsWeekend verifica si el día es fin de semana
func (s *Schedule) IsWeekend() bool {
	return s.DayOfWeek == 6 || s.DayOfWeek == 7 // Sábado y Domingo
}
