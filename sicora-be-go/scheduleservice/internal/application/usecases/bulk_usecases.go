package usecases

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"strconv"
	"strings"
	"time"

	"scheduleservice/internal/application/dtos"
	"scheduleservice/internal/domain/entities"
	"scheduleservice/internal/domain/repositories"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

// BulkScheduleUseCases maneja las operaciones masivas de horarios
type BulkScheduleUseCases struct {
	scheduleRepo repositories.ScheduleRepository
	groupRepo    repositories.AcademicGroupRepository
	venueRepo    repositories.VenueRepository
	validator    *validator.Validate
	logger       *log.Logger
}

// NewBulkScheduleUseCases crea una nueva instancia de BulkScheduleUseCases
func NewBulkScheduleUseCases(
	scheduleRepo repositories.ScheduleRepository,
	groupRepo repositories.AcademicGroupRepository,
	venueRepo repositories.VenueRepository,
	validator *validator.Validate,
	logger *log.Logger,
) *BulkScheduleUseCases {
	return &BulkScheduleUseCases{
		scheduleRepo: scheduleRepo,
		groupRepo:    groupRepo,
		venueRepo:    venueRepo,
		validator:    validator,
		logger:       logger,
	}
}

// BulkCreateSchedules crea múltiples horarios en una operación
func (uc *BulkScheduleUseCases) BulkCreateSchedules(ctx context.Context, request *dtos.BulkCreateSchedulesRequest) (*dtos.BulkCreateSchedulesResponse, error) {
	if err := uc.validator.Struct(request); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	uc.logger.Printf("Iniciando creación masiva de %d horarios", len(request.Schedules))

	response := &dtos.BulkCreateSchedulesResponse{
		Total:     len(request.Schedules),
		Created:   make([]dtos.ScheduleResponse, 0),
		Failed:    make([]dtos.BulkError, 0),
		Succeeded: 0,
		Errors:    0,
	}

	// Procesar cada horario individualmente
	for index, scheduleReq := range request.Schedules {
		result := uc.processScheduleCreation(ctx, &scheduleReq, index)

		if result.Error != nil {
			response.Errors++
			response.Failed = append(response.Failed, dtos.BulkError{
				Index:   index,
				Error:   result.Error.Error(),
				Details: result.Details,
			})
		} else {
			response.Succeeded++
			response.Created = append(response.Created, *result.Schedule)
		}
	}

	uc.logger.Printf("Creación masiva completada: %d exitosos, %d errores", response.Succeeded, response.Errors)
	return response, nil
}

// ScheduleCreationResult resultado del procesamiento individual
type ScheduleCreationResult struct {
	Schedule *dtos.ScheduleResponse
	Error    error
	Details  string
}

// processScheduleCreation procesa la creación de un horario individual
func (uc *BulkScheduleUseCases) processScheduleCreation(ctx context.Context, req *dtos.CreateScheduleRequest, index int) *ScheduleCreationResult {
	// Validar request individual
	if err := uc.validator.Struct(req); err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: fmt.Sprintf("validation error for schedule at index %d", index),
		}
	}

	// Validar que el grupo académico existe
	group, err := uc.groupRepo.GetByID(ctx, req.AcademicGroupID)
	if err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: fmt.Sprintf("error finding academic group %s", req.AcademicGroupID),
		}
	}
	if group == nil {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("academic group not found"),
			Details: fmt.Sprintf("academic group %s does not exist", req.AcademicGroupID),
		}
	}

	// Validar que el venue existe
	venue, err := uc.venueRepo.GetByID(ctx, req.VenueID)
	if err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: fmt.Sprintf("error finding venue %s", req.VenueID),
		}
	}
	if venue == nil {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("venue not found"),
			Details: fmt.Sprintf("venue %s does not exist", req.VenueID),
		}
	}

	// Parsear fechas y horas
	startTime, err := time.Parse("15:04", req.StartTime)
	if err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: fmt.Sprintf("invalid start time format: %s", req.StartTime),
		}
	}

	endTime, err := time.Parse("15:04", req.EndTime)
	if err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: fmt.Sprintf("invalid end time format: %s", req.EndTime),
		}
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: fmt.Sprintf("invalid start date format: %s", req.StartDate),
		}
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: fmt.Sprintf("invalid end date format: %s", req.EndDate),
		}
	}

	// Validar lógica de negocio
	if endTime.Before(startTime) || endTime.Equal(startTime) {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("end time must be after start time"),
			Details: fmt.Sprintf("start: %s, end: %s", req.StartTime, req.EndTime),
		}
	}

	if endDate.Before(startDate) {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("end date must be after start date"),
			Details: fmt.Sprintf("start: %s, end: %s", req.StartDate, req.EndDate),
		}
	}

	// Verificar conflictos de horario
	filters := repositories.ScheduleFilter{
		DayOfWeek: &req.DayOfWeek,
		VenueID:   &req.VenueID,
		Status:    "ACTIVO",
	}

	existingSchedules, _, err := uc.scheduleRepo.List(ctx, filters)
	if err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: "error checking schedule conflicts",
		}
	}

	// Verificar conflictos de tiempo
	for _, existing := range existingSchedules {
		if uc.hasTimeConflict(startTime, endTime, existing.StartTime, existing.EndTime) &&
			uc.hasDateOverlap(startDate, endDate, existing.StartDate, existing.EndDate) {
			return &ScheduleCreationResult{
				Error:   fmt.Errorf("schedule conflict detected"),
				Details: fmt.Sprintf("conflicts with existing schedule %s", existing.ID),
			}
		}
	}

	// Crear la entidad de horario
	schedule := &entities.Schedule{
		ID:              uuid.New(),
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

	// Guardar en la base de datos
	savedSchedule, err := uc.scheduleRepo.Create(ctx, schedule)
	if err != nil {
		return &ScheduleCreationResult{
			Error:   err,
			Details: "error saving schedule to database",
		}
	}

	// Crear response DTO
	response := &dtos.ScheduleResponse{
		ID:              savedSchedule.ID,
		AcademicGroupID: savedSchedule.AcademicGroupID,
		InstructorID:    savedSchedule.InstructorID,
		VenueID:         savedSchedule.VenueID,
		Subject:         savedSchedule.Subject,
		DayOfWeek:       savedSchedule.DayOfWeek,
		DayOfWeekName:   dtos.GetDayOfWeekName(savedSchedule.DayOfWeek),
		StartTime:       savedSchedule.StartTime.Format("15:04"),
		EndTime:         savedSchedule.EndTime.Format("15:04"),
		BlockIdentifier: savedSchedule.BlockIdentifier,
		StartDate:       savedSchedule.StartDate.Format("2006-01-02"),
		EndDate:         savedSchedule.EndDate.Format("2006-01-02"),
		Status:          string(savedSchedule.Status),
		CreatedAt:       savedSchedule.CreatedAt,
		UpdatedAt:       savedSchedule.UpdatedAt,
	}

	return &ScheduleCreationResult{
		Schedule: response,
		Error:    nil,
	}
}

// hasTimeConflict verifica si hay conflicto entre dos rangos de tiempo
func (uc *BulkScheduleUseCases) hasTimeConflict(start1, end1, start2, end2 time.Time) bool {
	// Convertir a minutos desde medianoche para comparación
	start1Min := start1.Hour()*60 + start1.Minute()
	end1Min := end1.Hour()*60 + end1.Minute()
	start2Min := start2.Hour()*60 + start2.Minute()
	end2Min := end2.Hour()*60 + end2.Minute()

	// Verificar si hay superposición
	return start1Min < end2Min && start2Min < end1Min
}

// hasDateOverlap verifica si hay superposición entre dos rangos de fechas
func (uc *BulkScheduleUseCases) hasDateOverlap(start1, end1, start2, end2 time.Time) bool {
	return start1.Before(end2) && start2.Before(end1)
}

// ProcessCSVUpload procesa la carga de un archivo CSV de horarios
func (uc *BulkScheduleUseCases) ProcessCSVUpload(ctx context.Context, csvReader io.Reader) (*dtos.CSVUploadResponse, error) {
	uc.logger.Println("Iniciando procesamiento de CSV de horarios")

	reader := csv.NewReader(csvReader)
	reader.Comma = ','
	reader.TrimLeadingSpace = true

	// Leer headers
	headers, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("error reading CSV headers: %w", err)
	}

	// Validar headers esperados
	expectedHeaders := []string{
		"academic_group_id", "instructor_id", "venue_id", "subject",
		"day_of_week", "start_time", "end_time", "block_identifier",
		"start_date", "end_date",
	}

	if !uc.validateCSVHeaders(headers, expectedHeaders) {
		return nil, fmt.Errorf("invalid CSV headers. Expected: %v", expectedHeaders)
	}

	response := &dtos.CSVUploadResponse{
		Errors:  make([]dtos.CSVError, 0),
		Created: make([]dtos.ScheduleResponse, 0),
		Summary: make(map[string]interface{}),
	}

	rowNumber := 1 // Contador de filas (sin incluir header)

	// Procesar cada fila
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			response.ErrorRows++
			response.Errors = append(response.Errors, dtos.CSVError{
				Row:     rowNumber,
				Error:   "Error reading CSV row",
				Details: err.Error(),
			})
			rowNumber++
			continue
		}

		response.ProcessedRows++
		result := uc.processCSVRow(ctx, record, rowNumber)

		if result.Error != nil {
			response.ErrorRows++
			response.Errors = append(response.Errors, dtos.CSVError{
				Row:     rowNumber,
				Error:   result.Error.Error(),
				Details: result.Details,
			})
		} else {
			response.SuccessRows++
			response.Created = append(response.Created, *result.Schedule)
		}

		rowNumber++
	}

	// Preparar resumen
	response.Summary = map[string]interface{}{
		"total_processed": response.ProcessedRows,
		"successful":      response.SuccessRows,
		"failed":          response.ErrorRows,
		"success_rate":    float64(response.SuccessRows) / float64(response.ProcessedRows) * 100,
	}

	uc.logger.Printf("CSV procesado: %d filas, %d exitosas, %d errores",
		response.ProcessedRows, response.SuccessRows, response.ErrorRows)

	return response, nil
}

// processCSVRow procesa una fila individual del CSV
func (uc *BulkScheduleUseCases) processCSVRow(ctx context.Context, record []string, rowNumber int) *ScheduleCreationResult {
	if len(record) != 10 {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("invalid number of columns"),
			Details: fmt.Sprintf("expected 10 columns, got %d", len(record)),
		}
	}

	// Parsear UUID fields
	academicGroupID, err := uuid.Parse(strings.TrimSpace(record[0]))
	if err != nil {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("invalid academic_group_id"),
			Details: record[0],
		}
	}

	instructorID, err := uuid.Parse(strings.TrimSpace(record[1]))
	if err != nil {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("invalid instructor_id"),
			Details: record[1],
		}
	}

	venueID, err := uuid.Parse(strings.TrimSpace(record[2]))
	if err != nil {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("invalid venue_id"),
			Details: record[2],
		}
	}

	// Parsear day_of_week
	dayOfWeek, err := strconv.Atoi(strings.TrimSpace(record[4]))
	if err != nil || dayOfWeek < 1 || dayOfWeek > 7 {
		return &ScheduleCreationResult{
			Error:   fmt.Errorf("invalid day_of_week"),
			Details: record[4],
		}
	}

	// Crear request DTO
	scheduleReq := dtos.CreateScheduleRequest{
		AcademicGroupID: academicGroupID,
		InstructorID:    instructorID,
		VenueID:         venueID,
		Subject:         strings.TrimSpace(record[3]),
		DayOfWeek:       dayOfWeek,
		StartTime:       strings.TrimSpace(record[5]),
		EndTime:         strings.TrimSpace(record[6]),
		BlockIdentifier: strings.TrimSpace(record[7]),
		StartDate:       strings.TrimSpace(record[8]),
		EndDate:         strings.TrimSpace(record[9]),
	}

	// Procesar usando la lógica existente
	return uc.processScheduleCreation(ctx, &scheduleReq, rowNumber-1)
}

// validateCSVHeaders valida que los headers del CSV sean correctos
func (uc *BulkScheduleUseCases) validateCSVHeaders(headers, expected []string) bool {
	if len(headers) != len(expected) {
		return false
	}

	headerMap := make(map[string]bool)
	for _, header := range headers {
		headerMap[strings.TrimSpace(strings.ToLower(header))] = true
	}

	for _, expectedHeader := range expected {
		if !headerMap[expectedHeader] {
			return false
		}
	}

	return true
}
