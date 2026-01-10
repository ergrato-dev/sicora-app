package tests

import (
	"testing"
	"time"

	"projectevalservice/internal/domain/entities"

	"github.com/stretchr/testify/assert"
)

func TestProject_IsActive(t *testing.T) {
	project := &entities.Project{
		Status: entities.ProjectStatusActivo,
	}

	assert.True(t, project.IsActive())

	project.Status = entities.ProjectStatusInactivo
	assert.False(t, project.IsActive())
}

func TestProject_IsDeliveryDatePassed(t *testing.T) {
	project := &entities.Project{
		DeliveryDate: time.Now().Add(-24 * time.Hour), // Yesterday
	}

	assert.True(t, project.IsDeliveryDatePassed())

	project.DeliveryDate = time.Now().Add(24 * time.Hour) // Tomorrow
	assert.False(t, project.IsDeliveryDatePassed())
}

func TestProject_CanReceiveSubmissions(t *testing.T) {
	project := &entities.Project{
		Status:       entities.ProjectStatusActivo,
		DeliveryDate: time.Now().Add(24 * time.Hour), // Tomorrow
	}

	assert.True(t, project.CanReceiveSubmissions())

	// Test inactive project
	project.Status = entities.ProjectStatusInactivo
	assert.False(t, project.CanReceiveSubmissions())

	// Test past delivery date
	project.Status = entities.ProjectStatusActivo
	project.DeliveryDate = time.Now().Add(-24 * time.Hour) // Yesterday
	assert.False(t, project.CanReceiveSubmissions())
}

func TestProjectStatus_IsValid(t *testing.T) {
	assert.True(t, entities.ProjectStatusActivo.IsValid())
	assert.True(t, entities.ProjectStatusInactivo.IsValid())
	assert.True(t, entities.ProjectStatusArchivado.IsValid())

	invalidStatus := entities.ProjectStatus("invalid")
	assert.False(t, invalidStatus.IsValid())
}

func TestSubmission_CanBeEvaluated(t *testing.T) {
	submission := &entities.Submission{
		Status: entities.SubmissionStatusEnviada,
	}

	assert.True(t, submission.CanBeEvaluated())

	submission.Status = entities.SubmissionStatusEnEvaluacion
	assert.True(t, submission.CanBeEvaluated())

	submission.Status = entities.SubmissionStatusEvaluada
	assert.False(t, submission.CanBeEvaluated())

	submission.Status = entities.SubmissionStatusRechazada
	assert.False(t, submission.CanBeEvaluated())
}

func TestEvaluation_CalculateTotalScore(t *testing.T) {
	evaluation := &entities.Evaluation{
		FunctionalityScore: 90.0,
		CodeQualityScore:   85.0,
		ArchitectureScore:  80.0,
		DocumentationScore: 75.0,
		TestingScore:       70.0,
		DeploymentScore:    65.0,
		SecurityScore:      60.0,
		PerformanceScore:   55.0,
	}

	evaluation.CalculateTotalScore()

	// Expected: 90*0.20 + 85*0.15 + 80*0.15 + 75*0.10 + 70*0.15 + 65*0.10 + 60*0.10 + 55*0.05
	expected := 18.0 + 12.75 + 12.0 + 7.5 + 10.5 + 6.5 + 6.0 + 2.75
	assert.Equal(t, expected, evaluation.TotalScore)
}

func TestEvaluation_CalculateGrade(t *testing.T) {
	evaluation := &entities.Evaluation{}

	evaluation.TotalScore = 95.0
	evaluation.CalculateGrade()
	assert.Equal(t, "A", evaluation.Grade)

	evaluation.TotalScore = 85.0
	evaluation.CalculateGrade()
	assert.Equal(t, "B", evaluation.Grade)

	evaluation.TotalScore = 75.0
	evaluation.CalculateGrade()
	assert.Equal(t, "C", evaluation.Grade)

	evaluation.TotalScore = 65.0
	evaluation.CalculateGrade()
	assert.Equal(t, "D", evaluation.Grade)

	evaluation.TotalScore = 55.0
	evaluation.CalculateGrade()
	assert.Equal(t, "F", evaluation.Grade)
}

func TestEvaluation_Complete(t *testing.T) {
	evaluation := &entities.Evaluation{
		FunctionalityScore: 80.0,
		CodeQualityScore:   85.0,
		ArchitectureScore:  90.0,
		DocumentationScore: 75.0,
		TestingScore:       80.0,
		DeploymentScore:    70.0,
		SecurityScore:      85.0,
		PerformanceScore:   90.0,
		Status:             entities.EvaluationStatusBorrador,
	}

	evaluation.Complete()

	assert.Equal(t, entities.EvaluationStatusCompletada, evaluation.Status)
	assert.NotZero(t, evaluation.TotalScore)
	assert.NotEmpty(t, evaluation.Grade)
	assert.NotNil(t, evaluation.EvaluatedAt)
}
