package jobs

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/robfig/cron/v3"

	"mevalservice/internal/application/usecases"
	"mevalservice/internal/domain/entities"
	"mevalservice/internal/domain/repositories"
)

// JobScheduler handles automatic jobs for MEvalService
type JobScheduler struct {
	cron                   *cron.Cron
	committeeUC            usecases.CommitteeUseCases
	studentCaseUC          usecases.StudentCaseUseCases
	improvementPlanUC      usecases.ImprovementPlanUseCases
	sanctionUC             usecases.SanctionUseCases
	appealUC               usecases.AppealUseCases
	committeeRepo          repositories.CommitteeRepository
	studentCaseRepo        repositories.StudentCaseRepository
	improvementPlanRepo    repositories.ImprovementPlanRepository
	sanctionRepo           repositories.SanctionRepository
	appealRepo             repositories.AppealRepository
	notificationService    NotificationService
}

// NotificationService interface for sending notifications
type NotificationService interface {
	SendEmail(to []string, subject, body string) error
	SendAlert(message string, priority string) error
}

// NewJobScheduler creates a new job scheduler
func NewJobScheduler(
	committeeUC usecases.CommitteeUseCases,
	studentCaseUC usecases.StudentCaseUseCases,
	improvementPlanUC usecases.ImprovementPlanUseCases,
	sanctionUC usecases.SanctionUseCases,
	appealUC usecases.AppealUseCases,
	committeeRepo repositories.CommitteeRepository,
	studentCaseRepo repositories.StudentCaseRepository,
	improvementPlanRepo repositories.ImprovementPlanRepository,
	sanctionRepo repositories.SanctionRepository,
	appealRepo repositories.AppealRepository,
	notificationService NotificationService,
) *JobScheduler {
	return &JobScheduler{
		cron:                   cron.New(cron.WithLocation(time.UTC)),
		committeeUC:            committeeUC,
		studentCaseUC:          studentCaseUC,
		improvementPlanUC:      improvementPlanUC,
		sanctionUC:             sanctionUC,
		appealUC:               appealUC,
		committeeRepo:          committeeRepo,
		studentCaseRepo:        studentCaseRepo,
		improvementPlanRepo:    improvementPlanRepo,
		sanctionRepo:           sanctionRepo,
		appealRepo:             appealRepo,
		notificationService:    notificationService,
	}
}

// Start begins the job scheduler
func (js *JobScheduler) Start() error {
	// Monthly committee creation - First Monday of each month at 09:00
	_, err := js.cron.AddFunc("0 9 1-7 * 1", js.createMonthlyCommittees)
	if err != nil {
		return fmt.Errorf("failed to schedule monthly committee creation: %w", err)
	}

	// Daily overdue case alerts - Every day at 08:00
	_, err = js.cron.AddFunc("0 8 * * *", js.checkOverdueCases)
	if err != nil {
		return fmt.Errorf("failed to schedule overdue case alerts: %w", err)
	}

	// Weekly improvement plan progress check - Every Monday at 10:00
	_, err = js.cron.AddFunc("0 10 * * 1", js.checkImprovementPlanProgress)
	if err != nil {
		return fmt.Errorf("failed to schedule improvement plan progress check: %w", err)
	}

	// Daily sanction expiration check - Every day at 07:00
	_, err = js.cron.AddFunc("0 7 * * *", js.checkSanctionExpirations)
	if err != nil {
		return fmt.Errorf("failed to schedule sanction expiration check: %w", err)
	}

	// Daily appeal deadline alerts - Every day at 09:00
	_, err = js.cron.AddFunc("0 9 * * *", js.checkAppealDeadlines)
	if err != nil {
		return fmt.Errorf("failed to schedule appeal deadline check: %w", err)
	}

	// Monthly committee performance report - Last day of month at 17:00
	_, err = js.cron.AddFunc("0 17 28-31 * *", js.generateMonthlyReports)
	if err != nil {
		return fmt.Errorf("failed to schedule monthly reports: %w", err)
	}

	js.cron.Start()
	log.Println("Job scheduler started successfully")
	return nil
}

// Stop stops the job scheduler
func (js *JobScheduler) Stop() {
	js.cron.Stop()
	log.Println("Job scheduler stopped")
}

// createMonthlyCommittees creates monthly committees
func (js *JobScheduler) createMonthlyCommittees() {
	ctx := context.Background()
	currentDate := time.Now()
	
	log.Printf("Creating monthly committees for %s %d", currentDate.Month(), currentDate.Year())

	// Get all existing committees to identify programs
	committees, err := js.committeeRepo.GetAll(ctx, 0, 0)
	if err != nil {
		log.Printf("Error getting committees for monthly creation: %v", err)
		return
	}

	programs := make(map[string]bool)
	for _, committee := range committees {
		if committee.ProgramID != nil {
			programs[committee.ProgramID.String()] = true
		}
	}

	// Create monthly committee for each program
	for programID := range programs {
		js.createCommitteeForProgram(ctx, programID, "MONTHLY")
	}

	// Also create a general monthly committee if no programs exist
	if len(programs) == 0 {
		js.createCommitteeForProgram(ctx, "", "MONTHLY")
	}
}

// createCommitteeForProgram creates a committee for a specific program
func (js *JobScheduler) createCommitteeForProgram(ctx context.Context, programID, committeeType string) {
	currentDate := time.Now()

	committee := &entities.Committee{
		CommitteeDate:  currentDate,
		CommitteeType:  entities.CommitteeType(committeeType),
		Status:         entities.CommitteeStatusScheduled,
		AcademicPeriod: fmt.Sprintf("%d-%02d", currentDate.Year(), currentDate.Month()),
		CreatedAt:      currentDate,
		UpdatedAt:      currentDate,
	}

	if err := js.committeeRepo.Create(ctx, committee); err != nil {
		log.Printf("Error creating %s committee: %v", committeeType, err)
		return
	}

	log.Printf("Created %s committee for period %s", committeeType, committee.AcademicPeriod)
}

// checkOverdueCases checks for overdue student cases and sends alerts
func (js *JobScheduler) checkOverdueCases() {
	ctx := context.Background()
	
	log.Println("Checking for overdue student cases")

	// Get pending cases
	pendingCases, err := js.studentCaseRepo.GetPendingCases(ctx)
	if err != nil {
		log.Printf("Error getting pending cases: %v", err)
		return
	}

	if len(pendingCases) == 0 {
		log.Println("No pending cases found")
		return
	}

	// Send notification about pending cases
	body := fmt.Sprintf("There are %d pending student cases that require attention.", len(pendingCases))
	if err := js.notificationService.SendAlert(body, "MEDIUM"); err != nil {
		log.Printf("Error sending pending case alert: %v", err)
	}

	log.Printf("Processed %d pending cases", len(pendingCases))
}

// sendOverdueCaseAlert sends alert for overdue cases
func (js *JobScheduler) sendOverdueCaseAlert(ctx context.Context, committeeID string, cases []*entities.StudentCase) {
	body := fmt.Sprintf("ALERT: %d cases require immediate attention for committee %s", len(cases), committeeID)
	
	for _, studentCase := range cases {
		body += fmt.Sprintf("\n- Case ID: %s, Type: %s, Status: %s", 
			studentCase.ID.String(), studentCase.CaseType, studentCase.CaseStatus)
	}

	if err := js.notificationService.SendAlert(body, "HIGH"); err != nil {
		log.Printf("Error sending overdue case alert: %v", err)
	}
}

// checkImprovementPlanProgress checks improvement plan progress and sends reminders
func (js *JobScheduler) checkImprovementPlanProgress() {
	ctx := context.Background()
	
	log.Println("Checking improvement plan progress")

	// Get all active improvement plans
	plans, err := js.improvementPlanRepo.GetActivePlans(ctx)
	if err != nil {
		log.Printf("Error getting active improvement plans: %v", err)
		return
	}

	stagnantPlans := []*entities.ImprovementPlan{}
	nearDeadlinePlans := []*entities.ImprovementPlan{}

	for _, plan := range plans {
		// Check for stagnant plans (no progress update in 7 days)
		if time.Since(plan.UpdatedAt).Hours() > 168 { // 7 days
			stagnantPlans = append(stagnantPlans, plan)
		}

		// Check for plans nearing deadline (within 7 days)
		if plan.EndDate.Sub(time.Now()).Hours() < 168 && plan.EndDate.Sub(time.Now()).Hours() > 0 {
			nearDeadlinePlans = append(nearDeadlinePlans, plan)
		}
	}

	if len(stagnantPlans) > 0 {
		js.sendStagnantPlanAlert(stagnantPlans)
	}

	if len(nearDeadlinePlans) > 0 {
		js.sendNearDeadlinePlanAlert(nearDeadlinePlans)
	}

	log.Printf("Checked %d improvement plans: %d stagnant, %d near deadline", 
		len(plans), len(stagnantPlans), len(nearDeadlinePlans))
}

// sendStagnantPlanAlert sends alert for stagnant improvement plans
func (js *JobScheduler) sendStagnantPlanAlert(plans []*entities.ImprovementPlan) {
	body := fmt.Sprintf("ALERT: %d improvement plans have not been updated in over 7 days", len(plans))
	
	for _, plan := range plans {
		daysStagnant := int(time.Since(plan.UpdatedAt).Hours() / 24)
		body += fmt.Sprintf("\n- Plan ID: %s, Type: %s (Last updated %d days ago)", 
			plan.ID.String(), plan.PlanType, daysStagnant)
	}

	if err := js.notificationService.SendAlert(body, "MEDIUM"); err != nil {
		log.Printf("Error sending stagnant plan alert: %v", err)
	}
}

// sendNearDeadlinePlanAlert sends alert for plans nearing deadline
func (js *JobScheduler) sendNearDeadlinePlanAlert(plans []*entities.ImprovementPlan) {
	body := fmt.Sprintf("REMINDER: %d improvement plans are nearing their deadline", len(plans))
	
	for _, plan := range plans {
		daysRemaining := int(plan.EndDate.Sub(time.Now()).Hours() / 24)
		body += fmt.Sprintf("\n- Plan ID: %s, Type: %s (%d days remaining)", 
			plan.ID.String(), plan.PlanType, daysRemaining)
	}

	if err := js.notificationService.SendAlert(body, "MEDIUM"); err != nil {
		log.Printf("Error sending near deadline plan alert: %v", err)
	}
}

// checkSanctionExpirations checks for sanctions that are expiring or have expired
func (js *JobScheduler) checkSanctionExpirations() {
	ctx := context.Background()
	
	log.Println("Checking sanction expirations")

	// Get all active sanctions
	sanctions, err := js.sanctionRepo.GetActiveSanctions(ctx)
	if err != nil {
		log.Printf("Error getting active sanctions: %v", err)
		return
	}

	expiredSanctions := []*entities.Sanction{}
	expiringSanctions := []*entities.Sanction{}

	for _, sanction := range sanctions {
		now := time.Now()
		
		// Check for expired sanctions
		if sanction.EndDate != nil && sanction.EndDate.Before(now) {
			expiredSanctions = append(expiredSanctions, sanction)
			
			// Auto-complete expired sanctions
			sanction.ComplianceStatus = entities.ComplianceStatusCompleted
			sanction.UpdatedAt = now
			if err := js.sanctionRepo.Update(ctx, sanction); err != nil {
				log.Printf("Error auto-completing expired sanction %s: %v", sanction.ID.String(), err)
			}
		} else if sanction.EndDate != nil && sanction.EndDate.Sub(now).Hours() < 72 { // Within 3 days
			expiringSanctions = append(expiringSanctions, sanction)
		}
	}

	if len(expiredSanctions) > 0 {
		js.sendExpiredSanctionAlert(expiredSanctions)
	}

	if len(expiringSanctions) > 0 {
		js.sendExpiringSanctionAlert(expiringSanctions)
	}

	log.Printf("Processed sanctions: %d expired (auto-completed), %d expiring soon", 
		len(expiredSanctions), len(expiringSanctions))
}

// sendExpiredSanctionAlert sends alert for expired sanctions
func (js *JobScheduler) sendExpiredSanctionAlert(sanctions []*entities.Sanction) {
	body := fmt.Sprintf("INFO: %d sanctions have expired and were automatically completed", len(sanctions))
	
	for _, sanction := range sanctions {
		endDate := "N/A"
		if sanction.EndDate != nil {
			endDate = sanction.EndDate.Format("2006-01-02")
		}
		body += fmt.Sprintf("\n- Sanction ID: %s, Type: %s (Expired on %s)", 
			sanction.ID.String(), sanction.SanctionType, endDate)
	}

	if err := js.notificationService.SendAlert(body, "LOW"); err != nil {
		log.Printf("Error sending expired sanction alert: %v", err)
	}
}

// sendExpiringSanctionAlert sends alert for sanctions expiring soon
func (js *JobScheduler) sendExpiringSanctionAlert(sanctions []*entities.Sanction) {
	body := fmt.Sprintf("REMINDER: %d sanctions will expire within 3 days", len(sanctions))
	
	for _, sanction := range sanctions {
		daysRemaining := 0
		if sanction.EndDate != nil {
			daysRemaining = int(sanction.EndDate.Sub(time.Now()).Hours() / 24)
		}
		body += fmt.Sprintf("\n- Sanction ID: %s, Type: %s (%d days remaining)", 
			sanction.ID.String(), sanction.SanctionType, daysRemaining)
	}

	if err := js.notificationService.SendAlert(body, "LOW"); err != nil {
		log.Printf("Error sending expiring sanction alert: %v", err)
	}
}

// checkAppealDeadlines checks for appeals approaching deadline
func (js *JobScheduler) checkAppealDeadlines() {
	ctx := context.Background()
	
	log.Println("Checking appeal deadlines")

	// Get all pending appeals
	appeals, err := js.appealRepo.GetPendingAppeals(ctx)
	if err != nil {
		log.Printf("Error getting pending appeals: %v", err)
		return
	}

	urgentAppeals := []*entities.Appeal{}

	for _, appeal := range appeals {
		// Appeals should be reviewed within 15 days of submission
		daysSinceSubmission := int(time.Since(appeal.SubmissionDate).Hours() / 24)
		
		if daysSinceSubmission >= 12 { // 3 days before deadline
			urgentAppeals = append(urgentAppeals, appeal)
		}
	}

	if len(urgentAppeals) > 0 {
		js.sendUrgentAppealAlert(urgentAppeals)
	}

	log.Printf("Checked %d appeals: %d urgent", len(appeals), len(urgentAppeals))
}

// sendUrgentAppealAlert sends alert for urgent appeals
func (js *JobScheduler) sendUrgentAppealAlert(appeals []*entities.Appeal) {
	body := fmt.Sprintf("URGENT: %d appeals require immediate review", len(appeals))
	
	for _, appeal := range appeals {
		daysSinceSubmission := int(time.Since(appeal.SubmissionDate).Hours() / 24)
		daysRemaining := 15 - daysSinceSubmission
		groundsPreview := appeal.AppealGrounds
		if len(groundsPreview) > 50 {
			groundsPreview = groundsPreview[:50] + "..."
		}
		body += fmt.Sprintf("\n- Appeal ID: %s, Grounds: %s (%d days remaining)", 
			appeal.ID.String(), groundsPreview, daysRemaining)
	}

	if err := js.notificationService.SendAlert(body, "HIGH"); err != nil {
		log.Printf("Error sending urgent appeal alert: %v", err)
	}
}

// generateMonthlyReports generates performance reports for committees
func (js *JobScheduler) generateMonthlyReports() {
	ctx := context.Background()
	
	log.Println("Generating monthly performance reports")

	// Check if it's actually the last day of the month
	now := time.Now()
	tomorrow := now.AddDate(0, 0, 1)
	if now.Month() == tomorrow.Month() {
		// Not the last day of month
		return
	}

	// Get all committees for this month
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)

	committees, err := js.committeeRepo.GetByDateRange(ctx, startOfMonth, endOfMonth)
	if err != nil {
		log.Printf("Error getting committees for monthly report: %v", err)
		return
	}

	for _, committee := range committees {
		js.generateCommitteeReport(ctx, committee, startOfMonth, endOfMonth)
	}

	log.Printf("Generated monthly reports for %d committees", len(committees))
}

// generateCommitteeReport generates a performance report for a specific committee
func (js *JobScheduler) generateCommitteeReport(ctx context.Context, committee *entities.Committee, startDate, endDate time.Time) {
	// Get cases handled by this committee
	cases, err := js.studentCaseRepo.GetByCommitteeID(ctx, committee.ID)
	if err != nil {
		log.Printf("Error getting cases for committee %s report: %v", committee.ID.String(), err)
		return
	}

	// Calculate metrics
	totalCases := len(cases)
	resolvedCases := 0
	pendingCases := 0
	
	for _, studentCase := range cases {
		if studentCase.CaseStatus == entities.CaseStatusResolved {
			resolvedCases++
		} else if studentCase.CaseStatus == entities.CaseStatusPending || studentCase.CaseStatus == entities.CaseStatusInReview {
			pendingCases++
		}
	}

	resolutionRate := float64(0)
	if totalCases > 0 {
		resolutionRate = float64(resolvedCases) / float64(totalCases) * 100
	}

	// Generate report
	subject := fmt.Sprintf("Monthly Report - Committee %s (%s %d)", 
		committee.ID.String()[:8], endDate.Month(), endDate.Year())
	
	body := fmt.Sprintf(`Monthly Performance Report

Committee ID: %s
Committee Type: %s
Period: %s to %s

METRICS:
- Total Cases Handled: %d
- Cases Resolved: %d
- Cases Pending: %d
- Resolution Rate: %.1f%%

`, committee.ID.String(), committee.CommitteeType, 
		startDate.Format("2006-01-02"), endDate.Format("2006-01-02"), 
		totalCases, resolvedCases, pendingCases, resolutionRate)

	// Add case status breakdown
	statusCount := make(map[entities.CaseStatus]int)
	for _, studentCase := range cases {
		statusCount[studentCase.CaseStatus]++
	}

	body += "STATUS SUMMARY:\n"
	for status, count := range statusCount {
		body += fmt.Sprintf("- %s: %d\n", status, count)
	}

	body += "\nThis is an automated monthly report from MEvalService."

	if err := js.notificationService.SendEmail([]string{"admin@sicora.edu"}, subject, body); err != nil {
		log.Printf("Error sending monthly report for committee %s: %v", committee.ID.String(), err)
	}
}
