package tests

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"mevalservice/internal/domain/entities"
)

func TestCommitteeCreation(t *testing.T) {
	committee := &entities.Committee{
		CommitteeDate: time.Now(),
		CommitteeType: entities.CommitteeTypeSeguimientoEvaluacion,
		Status:        entities.CommitteeStatusProgramado,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	assert.NotNil(t, committee)
	assert.Equal(t, entities.CommitteeTypeSeguimientoEvaluacion, committee.CommitteeType)
	assert.Equal(t, entities.CommitteeStatusProgramado, committee.Status)
	assert.False(t, committee.AgendaGenerated)
	assert.False(t, committee.QuorumAchieved)
}

func TestStudentCaseCreation(t *testing.T) {
	studentCase := &entities.StudentCase{
		CaseType:   entities.CaseTypeAcademico,
		CaseStatus: entities.CaseStatusRegistrado,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	assert.NotNil(t, studentCase)
	assert.Equal(t, entities.CaseTypeAcademico, studentCase.CaseType)
	assert.Equal(t, entities.CaseStatusRegistrado, studentCase.CaseStatus)
}
