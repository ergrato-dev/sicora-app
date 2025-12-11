package usecases

import (
	"context"
	"fmt"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/exceptions"
	"evalinservice/internal/domain/repositories"
	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

type ReportUseCase struct {
	reportRepo     repositories.ReportRepository
	periodRepo     repositories.EvaluationPeriodRepository
	evaluationRepo repositories.EvaluationRepository
}

func NewReportUseCase(
	reportRepo repositories.ReportRepository,
	periodRepo repositories.EvaluationPeriodRepository,
	evaluationRepo repositories.EvaluationRepository,
) *ReportUseCase {
	return &ReportUseCase{
		reportRepo:     reportRepo,
		periodRepo:     periodRepo,
		evaluationRepo: evaluationRepo,
	}
}

func (uc *ReportUseCase) CreateReport(ctx context.Context, req *dtos.ReportCreateRequest, generatedBy uuid.UUID) (*dtos.ReportResponse, error) {
	period, err := uc.periodRepo.GetByID(ctx, req.PeriodID)
	if err != nil {
		return nil, fmt.Errorf("period not found: %w", err)
	}

	reportType := valueobjects.ReportType(req.Type)
	if !reportType.IsValid() {
		return nil, exceptions.NewValidationError("type", "invalid report type")
	}

	report := entities.NewReport(
		req.PeriodID,
		generatedBy,
		reportType,
		req.Title,
		req.Description,
		req.Parameters,
	)

	if err := uc.reportRepo.Create(ctx, report); err != nil {
		return nil, fmt.Errorf("failed to create report: %w", err)
	}

	return uc.mapToReportResponse(report), nil
}

func (uc *ReportUseCase) GetReportByID(ctx context.Context, id uuid.UUID) (*dtos.ReportResponse, error) {
	report, err := uc.reportRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("report not found: %w", err)
	}

	return uc.mapToReportResponse(report), nil
}

func (uc *ReportUseCase) GetReportsByPeriod(ctx context.Context, periodID uuid.UUID) ([]*dtos.ReportResponse, error) {
	reports, err := uc.reportRepo.GetByPeriodID(ctx, periodID)
	if err != nil {
		return nil, fmt.Errorf("failed to get reports: %w", err)
	}

	responses := make([]*dtos.ReportResponse, len(reports))
	for i, report := range reports {
		responses[i] = uc.mapToReportResponse(report)
	}

	return responses, nil
}

func (uc *ReportUseCase) GenerateReport(ctx context.Context, id uuid.UUID) error {
	report, err := uc.reportRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("report not found: %w", err)
	}

	if report.Status != valueobjects.ReportStatusPending {
		return exceptions.NewValidationError("status", "report is not in pending status")
	}

	report.SetGenerating()
	if err := uc.reportRepo.Update(ctx, report); err != nil {
		return fmt.Errorf("failed to update report status: %w", err)
	}

	go uc.processReportGeneration(context.Background(), report)

	return nil
}

func (uc *ReportUseCase) processReportGeneration(ctx context.Context, report *entities.Report) {
	results := make(map[string]interface{})

	switch report.Type {
	case valueobjects.ReportTypeInstructorPerformance:
		results = uc.generateInstructorPerformanceReport(ctx, report)
	case valueobjects.ReportTypePeriodSummary:
		results = uc.generatePeriodSummaryReport(ctx, report)
	default:
		report.SetFailed("unsupported report type")
		uc.reportRepo.Update(ctx, report)
		return
	}

	filePath := fmt.Sprintf("/reports/%s.pdf", report.ID.String())
	report.SetCompleted(filePath, results)
	uc.reportRepo.Update(ctx, report)
}

func (uc *ReportUseCase) generateInstructorPerformanceReport(ctx context.Context, report *entities.Report) map[string]interface{} {
	results := make(map[string]interface{})
	results["type"] = "instructor_performance"
	results["period_id"] = report.PeriodID
	results["generated_at"] = report.UpdatedAt
	return results
}

func (uc *ReportUseCase) generatePeriodSummaryReport(ctx context.Context, report *entities.Report) map[string]interface{} {
	results := make(map[string]interface{})
	results["type"] = "period_summary"
	results["period_id"] = report.PeriodID
	results["generated_at"] = report.UpdatedAt
	return results
}

func (uc *ReportUseCase) GetPendingReports(ctx context.Context) ([]*dtos.ReportResponse, error) {
	reports, err := uc.reportRepo.GetPendingReports(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get pending reports: %w", err)
	}

	responses := make([]*dtos.ReportResponse, len(reports))
	for i, report := range reports {
		responses[i] = uc.mapToReportResponse(report)
	}

	return responses, nil
}

func (uc *ReportUseCase) DeleteReport(ctx context.Context, id uuid.UUID) error {
	report, err := uc.reportRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("report not found: %w", err)
	}

	if report.Status == valueobjects.ReportStatusGenerating {
		return exceptions.NewValidationError("status", "cannot delete report that is being generated")
	}

	if err := uc.reportRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete report: %w", err)
	}

	return nil
}

func (uc *ReportUseCase) mapToReportResponse(report *entities.Report) *dtos.ReportResponse {
	return &dtos.ReportResponse{
		ID:           report.ID,
		PeriodID:     report.PeriodID,
		Type:         string(report.Type),
		Status:       string(report.Status),
		Title:        report.Title,
		Description:  report.Description,
		Parameters:   report.Parameters,
		Results:      report.Results,
		FilePath:     report.FilePath,
		GeneratedBy:  report.GeneratedBy,
		GeneratedAt:  report.GeneratedAt,
		ErrorMessage: report.ErrorMessage,
		CreatedAt:    report.CreatedAt,
		UpdatedAt:    report.UpdatedAt,
	}
}
