package usecases

import (
	"context"
	"fmt"
	"log"
	"time"

	"scheduleservice/internal/application/dtos"
	"scheduleservice/internal/domain/entities"
	"scheduleservice/internal/domain/repositories"

	"github.com/google/uuid"
)

// CreateScheduleUseCase caso de uso para crear horarios
type CreateScheduleUseCase struct {
	scheduleRepo repositories.ScheduleRepository
	groupRepo    repositories.AcademicGroupRepository
	venueRepo    repositories.VenueRepository
	logger       *log.Logger
}

// NewCreateScheduleUseCase constructor
func NewCreateScheduleUseCase(
	scheduleRepo repositories.ScheduleRepository,
	groupRepo repositories.AcademicGroupRepository,
	venueRepo repositories.VenueRepository,
	logger *log.Logger,
) *CreateScheduleUseCase {
	return &CreateScheduleUseCase{
		scheduleRepo: scheduleRepo,
		groupRepo:    groupRepo,
		venueRepo:    venueRepo,
		logger:       logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *CreateScheduleUseCase) Execute(ctx context.Context, req *dtos.CreateScheduleRequest) (*dtos.ScheduleResponse, error) {
	// Validar que el grupo académico existe
	group, err := uc.groupRepo.GetByID(ctx, req.AcademicGroupID)
	if err != nil {
		uc.logger.Printf("Error al buscar grupo académico %s: %v", req.AcademicGroupID, err)
		return nil, fmt.Errorf("error al buscar grupo académico: %w", err)
	}
	if group == nil {
		return nil, fmt.Errorf("grupo académico no encontrado: %s", req.AcademicGroupID)
	}

	// Validar que el ambiente existe
	venue, err := uc.venueRepo.GetByID(ctx, req.VenueID)
	if err != nil {
		uc.logger.Printf("Error al buscar ambiente %s: %v", req.VenueID, err)
		return nil, fmt.Errorf("error al buscar ambiente: %w", err)
	}
	if venue == nil {
		return nil, fmt.Errorf("ambiente no encontrado: %s", req.VenueID)
	}

	// Parsear fechas y horas
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, fmt.Errorf("formato de fecha de inicio inválido: %w", err)
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, fmt.Errorf("formato de fecha de fin inválido: %w", err)
	}

	startTime, err := time.Parse("15:04", req.StartTime)
	if err != nil {
		return nil, fmt.Errorf("formato de hora de inicio inválido: %w", err)
	}

	endTime, err := time.Parse("15:04", req.EndTime)
	if err != nil {
		return nil, fmt.Errorf("formato de hora de fin inválido: %w", err)
	}

	// Validaciones de negocio
	if startDate.After(endDate) {
		return nil, fmt.Errorf("la fecha de inicio no puede ser posterior a la fecha de fin")
	}

	if startTime.After(endTime) || startTime.Equal(endTime) {
		return nil, fmt.Errorf("la hora de inicio debe ser anterior a la hora de fin")
	}

	// Verificar conflictos
	if err := uc.checkConflicts(ctx, req, nil); err != nil {
		return nil, err
	}

	// Crear entidad
	schedule := &entities.Schedule{
		AcademicGroupID: req.AcademicGroupID,
		InstructorID:    req.InstructorID,
		VenueID:         req.VenueID,
		Subject:         req.Subject,
		DayOfWeek:       req.DayOfWeek,
		StartTime:       startTime,
		EndTime:         endTime,
		BlockIdentifier: req.BlockIdentifier,
		StartDate:       startDate,
		EndDate:         endDate,
		Status:          "ACTIVO",
		IsActive:        true,
	}

	// Guardar en base de datos
	createdSchedule, err := uc.scheduleRepo.Create(ctx, schedule)
	if err != nil {
		uc.logger.Printf("Error al crear horario: %v", err)
		return nil, fmt.Errorf("error al crear horario: %w", err)
	}

	uc.logger.Printf("Horario creado exitosamente: %s", createdSchedule.ID)

	// Convertir a DTO de respuesta
	return uc.mapToDTO(createdSchedule, group, venue), nil
}

// checkConflicts verifica conflictos de horario
func (uc *CreateScheduleUseCase) checkConflicts(ctx context.Context, req *dtos.CreateScheduleRequest, excludeID *uuid.UUID) error {
	startTime, _ := time.Parse("15:04", req.StartTime)
	endTime, _ := time.Parse("15:04", req.EndTime)

	// Verificar conflicto de instructor
	hasInstructorConflict, err := uc.scheduleRepo.CheckInstructorConflict(
		ctx, req.InstructorID, req.DayOfWeek, startTime, endTime, excludeID,
	)
	if err != nil {
		return fmt.Errorf("error al verificar conflicto de instructor: %w", err)
	}
	if hasInstructorConflict {
		return fmt.Errorf("el instructor ya tiene un horario asignado en este horario")
	}

	// Verificar conflicto de ambiente
	hasVenueConflict, err := uc.scheduleRepo.CheckVenueConflict(
		ctx, req.VenueID, req.DayOfWeek, startTime, endTime, excludeID,
	)
	if err != nil {
		return fmt.Errorf("error al verificar conflicto de ambiente: %w", err)
	}
	if hasVenueConflict {
		return fmt.Errorf("el ambiente ya está ocupado en este horario")
	}

	// Verificar conflicto de grupo
	hasGroupConflict, err := uc.scheduleRepo.CheckGroupConflict(
		ctx, req.AcademicGroupID, req.DayOfWeek, startTime, endTime, excludeID,
	)
	if err != nil {
		return fmt.Errorf("error al verificar conflicto de grupo: %w", err)
	}
	if hasGroupConflict {
		return fmt.Errorf("el grupo ya tiene un horario asignado en este horario")
	}

	return nil
}

// mapToDTO convierte entidad a DTO
func (uc *CreateScheduleUseCase) mapToDTO(schedule *entities.Schedule, group *entities.AcademicGroup, venue *entities.Venue) *dtos.ScheduleResponse {
	return &dtos.ScheduleResponse{
		ID:              schedule.ID,
		AcademicGroupID: schedule.AcademicGroupID,
		InstructorID:    schedule.InstructorID,
		VenueID:         schedule.VenueID,
		Subject:         schedule.Subject,
		DayOfWeek:       schedule.DayOfWeek,
		DayOfWeekName:   dtos.GetDayOfWeekName(schedule.DayOfWeek),
		StartTime:       schedule.StartTime.Format("15:04"),
		EndTime:         schedule.EndTime.Format("15:04"),
		BlockIdentifier: schedule.BlockIdentifier,
		StartDate:       schedule.StartDate.Format("2006-01-02"),
		EndDate:         schedule.EndDate.Format("2006-01-02"),
		Status:          string(schedule.Status),
		IsActive:        schedule.IsActive,
		CreatedAt:       schedule.CreatedAt,
		UpdatedAt:       schedule.UpdatedAt,
		AcademicGroup: &dtos.AcademicGroupResponse{
			ID:       group.ID,
			Number:   group.Number,
			Quarter:  group.Quarter,
			Year:     group.Year,
			Shift:    string(group.Shift),
			IsActive: group.IsActive,
		},
		Venue: &dtos.VenueResponse{
			ID:       venue.ID,
			Name:     venue.Name,
			Code:     venue.Code,
			Type:     string(venue.Type),
			Capacity: venue.Capacity,
			Floor:    venue.Floor,
			IsActive: venue.IsActive,
		},
	}
}

// GetScheduleUseCase caso de uso para obtener un horario por ID
type GetScheduleUseCase struct {
	scheduleRepo repositories.ScheduleRepository
	logger       *log.Logger
}

// NewGetScheduleUseCase constructor
func NewGetScheduleUseCase(scheduleRepo repositories.ScheduleRepository, logger *log.Logger) *GetScheduleUseCase {
	return &GetScheduleUseCase{
		scheduleRepo: scheduleRepo,
		logger:       logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *GetScheduleUseCase) Execute(ctx context.Context, id uuid.UUID) (*dtos.ScheduleResponse, error) {
	schedule, err := uc.scheduleRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar horario %s: %v", id, err)
		return nil, fmt.Errorf("error al buscar horario: %w", err)
	}

	if schedule == nil {
		return nil, fmt.Errorf("horario no encontrado: %s", id)
	}

	// Convertir a DTO
	response := &dtos.ScheduleResponse{
		ID:              schedule.ID,
		AcademicGroupID: schedule.AcademicGroupID,
		InstructorID:    schedule.InstructorID,
		VenueID:         schedule.VenueID,
		Subject:         schedule.Subject,
		DayOfWeek:       schedule.DayOfWeek,
		DayOfWeekName:   dtos.GetDayOfWeekName(schedule.DayOfWeek),
		StartTime:       schedule.StartTime.Format("15:04"),
		EndTime:         schedule.EndTime.Format("15:04"),
		BlockIdentifier: schedule.BlockIdentifier,
		StartDate:       schedule.StartDate.Format("2006-01-02"),
		EndDate:         schedule.EndDate.Format("2006-01-02"),
		Status:          string(schedule.Status),
		IsActive:        schedule.IsActive,
		CreatedAt:       schedule.CreatedAt,
		UpdatedAt:       schedule.UpdatedAt,
	}

	// Incluir relaciones si están cargadas
	if schedule.AcademicGroup != nil {
		response.AcademicGroup = &dtos.AcademicGroupResponse{
			ID:       schedule.AcademicGroup.ID,
			Number:   schedule.AcademicGroup.Number,
			Quarter:  schedule.AcademicGroup.Quarter,
			Year:     schedule.AcademicGroup.Year,
			Shift:    string(schedule.AcademicGroup.Shift),
			IsActive: schedule.AcademicGroup.IsActive,
		}
	}

	if schedule.Venue != nil {
		response.Venue = &dtos.VenueResponse{
			ID:       schedule.Venue.ID,
			Name:     schedule.Venue.Name,
			Code:     schedule.Venue.Code,
			Type:     string(schedule.Venue.Type),
			Capacity: schedule.Venue.Capacity,
			Floor:    schedule.Venue.Floor,
			IsActive: schedule.Venue.IsActive,
		}
	}

	return response, nil
}

// ListSchedulesUseCase caso de uso para listar horarios con filtros
type ListSchedulesUseCase struct {
	scheduleRepo repositories.ScheduleRepository
	logger       *log.Logger
}

// NewListSchedulesUseCase constructor
func NewListSchedulesUseCase(scheduleRepo repositories.ScheduleRepository, logger *log.Logger) *ListSchedulesUseCase {
	return &ListSchedulesUseCase{
		scheduleRepo: scheduleRepo,
		logger:       logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *ListSchedulesUseCase) Execute(ctx context.Context, filter repositories.ScheduleFilter) (*dtos.PaginatedResponse[*dtos.ScheduleResponse], error) {
	// Establecer valores por defecto
	filter.SetDefaults()

	// Obtener horarios y total
	schedules, total, err := uc.scheduleRepo.List(ctx, filter)
	if err != nil {
		uc.logger.Printf("Error al listar horarios: %v", err)
		return nil, fmt.Errorf("error al listar horarios: %w", err)
	}

	// Convertir a DTOs
	scheduleResponses := make([]*dtos.ScheduleResponse, len(schedules))
	for i, schedule := range schedules {
		scheduleResponses[i] = &dtos.ScheduleResponse{
			ID:              schedule.ID,
			AcademicGroupID: schedule.AcademicGroupID,
			InstructorID:    schedule.InstructorID,
			VenueID:         schedule.VenueID,
			Subject:         schedule.Subject,
			DayOfWeek:       schedule.DayOfWeek,
			DayOfWeekName:   dtos.GetDayOfWeekName(schedule.DayOfWeek),
			StartTime:       schedule.StartTime.Format("15:04"),
			EndTime:         schedule.EndTime.Format("15:04"),
			BlockIdentifier: schedule.BlockIdentifier,
			StartDate:       schedule.StartDate.Format("2006-01-02"),
			EndDate:         schedule.EndDate.Format("2006-01-02"),
			Status:          string(schedule.Status),
			IsActive:        schedule.IsActive,
			CreatedAt:       schedule.CreatedAt,
			UpdatedAt:       schedule.UpdatedAt,
		}

		// Incluir relaciones si están cargadas
		if schedule.AcademicGroup != nil {
			scheduleResponses[i].AcademicGroup = &dtos.AcademicGroupResponse{
				ID:       schedule.AcademicGroup.ID,
				Number:   schedule.AcademicGroup.Number,
				Quarter:  schedule.AcademicGroup.Quarter,
				Year:     schedule.AcademicGroup.Year,
				Shift:    string(schedule.AcademicGroup.Shift),
				IsActive: schedule.AcademicGroup.IsActive,
			}
		}

		if schedule.Venue != nil {
			scheduleResponses[i].Venue = &dtos.VenueResponse{
				ID:       schedule.Venue.ID,
				Name:     schedule.Venue.Name,
				Code:     schedule.Venue.Code,
				Type:     string(schedule.Venue.Type),
				Capacity: schedule.Venue.Capacity,
				Floor:    schedule.Venue.Floor,
				IsActive: schedule.Venue.IsActive,
			}
		}
	}

	// Crear metadatos de paginación
	pages := dtos.CalculatePages(total, filter.PageSize)
	pagination := dtos.PaginationMeta{
		Page:     filter.Page,
		PageSize: filter.PageSize,
		Total:    total,
		Pages:    pages,
		HasNext:  filter.Page < pages,
		HasPrev:  filter.Page > 1,
	}

	return &dtos.PaginatedResponse[*dtos.ScheduleResponse]{
		Data:       scheduleResponses,
		Pagination: pagination,
	}, nil
}

// UpdateScheduleUseCase caso de uso para actualizar horarios
type UpdateScheduleUseCase struct {
	scheduleRepo repositories.ScheduleRepository
	groupRepo    repositories.AcademicGroupRepository
	venueRepo    repositories.VenueRepository
	logger       *log.Logger
}

// NewUpdateScheduleUseCase constructor
func NewUpdateScheduleUseCase(
	scheduleRepo repositories.ScheduleRepository,
	groupRepo repositories.AcademicGroupRepository,
	venueRepo repositories.VenueRepository,
	logger *log.Logger,
) *UpdateScheduleUseCase {
	return &UpdateScheduleUseCase{
		scheduleRepo: scheduleRepo,
		groupRepo:    groupRepo,
		venueRepo:    venueRepo,
		logger:       logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *UpdateScheduleUseCase) Execute(ctx context.Context, id uuid.UUID, req *dtos.UpdateScheduleRequest) (*dtos.ScheduleResponse, error) {
	// Buscar horario existente
	schedule, err := uc.scheduleRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar horario %s: %v", id, err)
		return nil, fmt.Errorf("error al buscar horario: %w", err)
	}
	if schedule == nil {
		return nil, fmt.Errorf("horario no encontrado: %s", id)
	}

	// Aplicar actualizaciones parciales
	if req.AcademicGroupID != nil {
		schedule.AcademicGroupID = *req.AcademicGroupID
	}
	if req.InstructorID != nil {
		schedule.InstructorID = *req.InstructorID
	}
	if req.VenueID != nil {
		schedule.VenueID = *req.VenueID
	}
	if req.Subject != nil {
		schedule.Subject = *req.Subject
	}
	if req.DayOfWeek != nil {
		schedule.DayOfWeek = *req.DayOfWeek
	}
	if req.StartTime != nil {
		startTime, err := time.Parse("15:04", *req.StartTime)
		if err != nil {
			return nil, fmt.Errorf("formato de hora de inicio inválido: %w", err)
		}
		schedule.StartTime = startTime
	}
	if req.EndTime != nil {
		endTime, err := time.Parse("15:04", *req.EndTime)
		if err != nil {
			return nil, fmt.Errorf("formato de hora de fin inválido: %w", err)
		}
		schedule.EndTime = endTime
	}
	if req.BlockIdentifier != nil {
		schedule.BlockIdentifier = *req.BlockIdentifier
	}
	if req.StartDate != nil {
		startDate, err := time.Parse("2006-01-02", *req.StartDate)
		if err != nil {
			return nil, fmt.Errorf("formato de fecha de inicio inválido: %w", err)
		}
		schedule.StartDate = startDate
	}
	if req.EndDate != nil {
		endDate, err := time.Parse("2006-01-02", *req.EndDate)
		if err != nil {
			return nil, fmt.Errorf("formato de fecha de fin inválido: %w", err)
		}
		schedule.EndDate = endDate
	}
	if req.Status != nil {
		schedule.Status = entities.EstadoHorario(*req.Status)
	}

	// Validaciones de negocio
	if !schedule.IsValidTimeRange() {
		return nil, fmt.Errorf("la hora de inicio debe ser anterior a la hora de fin")
	}
	if !schedule.IsValidDateRange() {
		return nil, fmt.Errorf("la fecha de inicio no puede ser posterior a la fecha de fin")
	}

	// Verificar conflictos (excluyendo el horario actual)
	createReq := &dtos.CreateScheduleRequest{
		AcademicGroupID: schedule.AcademicGroupID,
		InstructorID:    schedule.InstructorID,
		VenueID:         schedule.VenueID,
		DayOfWeek:       schedule.DayOfWeek,
		StartTime:       schedule.StartTime.Format("15:04"),
		EndTime:         schedule.EndTime.Format("15:04"),
	}

	createUseCase := &CreateScheduleUseCase{
		scheduleRepo: uc.scheduleRepo,
		groupRepo:    uc.groupRepo,
		venueRepo:    uc.venueRepo,
		logger:       uc.logger,
	}

	if err := createUseCase.checkConflicts(ctx, createReq, &id); err != nil {
		return nil, err
	}

	// Actualizar en base de datos
	updatedSchedule, err := uc.scheduleRepo.Update(ctx, schedule)
	if err != nil {
		uc.logger.Printf("Error al actualizar horario %s: %v", id, err)
		return nil, fmt.Errorf("error al actualizar horario: %w", err)
	}

	uc.logger.Printf("Horario actualizado exitosamente: %s", id)

	// Convertir a DTO de respuesta
	return &dtos.ScheduleResponse{
		ID:              updatedSchedule.ID,
		AcademicGroupID: updatedSchedule.AcademicGroupID,
		InstructorID:    updatedSchedule.InstructorID,
		VenueID:         updatedSchedule.VenueID,
		Subject:         updatedSchedule.Subject,
		DayOfWeek:       updatedSchedule.DayOfWeek,
		DayOfWeekName:   dtos.GetDayOfWeekName(updatedSchedule.DayOfWeek),
		StartTime:       updatedSchedule.StartTime.Format("15:04"),
		EndTime:         updatedSchedule.EndTime.Format("15:04"),
		BlockIdentifier: updatedSchedule.BlockIdentifier,
		StartDate:       updatedSchedule.StartDate.Format("2006-01-02"),
		EndDate:         updatedSchedule.EndDate.Format("2006-01-02"),
		Status:          string(updatedSchedule.Status),
		IsActive:        updatedSchedule.IsActive,
		CreatedAt:       updatedSchedule.CreatedAt,
		UpdatedAt:       updatedSchedule.UpdatedAt,
	}, nil
}

// DeleteScheduleUseCase caso de uso para eliminar horarios
type DeleteScheduleUseCase struct {
	scheduleRepo repositories.ScheduleRepository
	logger       *log.Logger
}

// NewDeleteScheduleUseCase constructor
func NewDeleteScheduleUseCase(scheduleRepo repositories.ScheduleRepository, logger *log.Logger) *DeleteScheduleUseCase {
	return &DeleteScheduleUseCase{
		scheduleRepo: scheduleRepo,
		logger:       logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *DeleteScheduleUseCase) Execute(ctx context.Context, id uuid.UUID) error {
	// Verificar que el horario existe
	schedule, err := uc.scheduleRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar horario %s: %v", id, err)
		return fmt.Errorf("error al buscar horario: %w", err)
	}
	if schedule == nil {
		return fmt.Errorf("horario no encontrado: %s", id)
	}

	// Eliminar
	if err := uc.scheduleRepo.Delete(ctx, id); err != nil {
		uc.logger.Printf("Error al eliminar horario %s: %v", id, err)
		return fmt.Errorf("error al eliminar horario: %w", err)
	}

	uc.logger.Printf("Horario eliminado exitosamente: %s", id)
	return nil
}
