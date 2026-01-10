package tests

import (
	"testing"

	"projectevalservice/internal/domain/entities"
	"projectevalservice/internal/infrastructure/database/models"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

func TestStakeholderArrayMigration(t *testing.T) {
	t.Run("should convert domain entity to GORM model with pq.StringArray", func(t *testing.T) {
		// Create domain entity with expertise array
		stakeholder := &entities.Stakeholder{
			ID:        uuid.New(),
			ProjectID: uuid.New(),
			UserID:    uuid.New(),
			Role:      entities.StakeholderRoleExterno,
			Type:      entities.StakeholderTypeExterno,
			Status:    entities.StakeholderStatusActivo,
			Expertise: []string{"software_engineering", "database_design", "project_management"},
		}

		// Convert to GORM model
		model := models.StakeholderFromEntity(stakeholder)

		// Verify the conversion
		assert.Equal(t, stakeholder.ID, model.ID)
		assert.Equal(t, stakeholder.ProjectID, model.ProjectID)
		assert.Equal(t, stakeholder.UserID, model.UserID)
		assert.Equal(t, stakeholder.Role, model.Role)
		assert.Equal(t, stakeholder.Type, model.Type)
		assert.Equal(t, stakeholder.Status, model.Status)

		// Verify array conversion to pq.StringArray
		expectedArray := pq.StringArray{"software_engineering", "database_design", "project_management"}
		assert.Equal(t, expectedArray, model.Expertise)
		assert.IsType(t, models.StringArray{}, model.Expertise)
	})

	t.Run("should convert GORM model back to domain entity", func(t *testing.T) {
		// Create GORM model with pq.StringArray
		model := &models.Stakeholder{
			ID:        uuid.New(),
			ProjectID: uuid.New(),
			UserID:    uuid.New(),
			Role:      entities.StakeholderRoleExterno,
			Type:      entities.StakeholderTypeExterno,
			Status:    entities.StakeholderStatusActivo,
			Expertise: pq.StringArray{"software_engineering", "database_design"},
		}

		// Convert to domain entity
		entity := model.ToEntity()

		// Verify the conversion
		assert.Equal(t, model.ID, entity.ID)
		assert.Equal(t, model.ProjectID, entity.ProjectID)
		assert.Equal(t, model.UserID, entity.UserID)
		assert.Equal(t, model.Role, entity.Role)
		assert.Equal(t, model.Type, entity.Type)
		assert.Equal(t, model.Status, entity.Status)

		// Verify array conversion back to []string
		expectedSlice := []string{"software_engineering", "database_design"}
		assert.Equal(t, expectedSlice, entity.Expertise)
		assert.IsType(t, []string{}, entity.Expertise)
	})
}

func TestProjectDocumentArrayMigration(t *testing.T) {
	t.Run("should convert domain entity to GORM model with pq.StringArray", func(t *testing.T) {
		// Create domain entity with tags array
		doc := &entities.ProjectDocument{
			ID:           uuid.New(),
			ProjectID:    uuid.New(),
			UploadedByID: uuid.New(),
			Title:        "Test Document",
			Type:         entities.DocumentTypeRequirement,
			Status:       entities.DocumentStatusDraft,
			Visibility:   entities.DocumentVisibilityPrivate,
			FileName:     "test.pdf",
			FilePath:     "/uploads/test.pdf",
			FileSize:     1024,
			Tags:         []string{"proposal", "research", "documentation"},
		}

		// Convert to GORM model
		model := models.ProjectDocumentFromEntity(doc)

		// Verify the conversion
		assert.Equal(t, doc.ID, model.ID)
		assert.Equal(t, doc.ProjectID, model.ProjectID)
		assert.Equal(t, doc.Title, model.Title)
		assert.Equal(t, doc.Type, model.Type)
		assert.Equal(t, doc.Status, model.Status)
		assert.Equal(t, doc.Visibility, model.Visibility)
		assert.Equal(t, doc.FileName, model.FileName)
		assert.Equal(t, doc.FilePath, model.FilePath)
		assert.Equal(t, doc.FileSize, model.FileSize)

		// Verify array conversion to pq.StringArray
		expectedArray := pq.StringArray{"proposal", "research", "documentation"}
		assert.Equal(t, expectedArray, model.Tags)
		assert.IsType(t, models.StringArray{}, model.Tags)
	})

	t.Run("should convert GORM model back to domain entity", func(t *testing.T) {
		// Create GORM model with pq.StringArray
		model := &models.ProjectDocument{
			ID:           uuid.New(),
			ProjectID:    uuid.New(),
			UploadedByID: uuid.New(),
			Title:        "Test Document",
			Type:         entities.DocumentTypeRequirement,
			Status:       entities.DocumentStatusDraft,
			Visibility:   entities.DocumentVisibilityPrivate,
			FileName:     "test.pdf",
			FilePath:     "/uploads/test.pdf",
			FileSize:     1024,
			Tags:         pq.StringArray{"proposal", "research"},
		}

		// Convert to domain entity
		entity := model.ToEntity()

		// Verify the conversion
		assert.Equal(t, model.ID, entity.ID)
		assert.Equal(t, model.ProjectID, entity.ProjectID)
		assert.Equal(t, model.Title, entity.Title)
		assert.Equal(t, model.Type, entity.Type)
		assert.Equal(t, model.Status, entity.Status)
		assert.Equal(t, model.Visibility, entity.Visibility)
		assert.Equal(t, model.FileName, entity.FileName)
		assert.Equal(t, model.FilePath, entity.FilePath)
		assert.Equal(t, model.FileSize, entity.FileSize)

		// Verify array conversion back to []string
		expectedSlice := []string{"proposal", "research"}
		assert.Equal(t, expectedSlice, entity.Tags)
		assert.IsType(t, []string{}, entity.Tags)
	})
}

func TestStringArrayType(t *testing.T) {
	t.Run("should verify StringArray is pq.StringArray", func(t *testing.T) {
		var arr models.StringArray
		arr = pq.StringArray{"test1", "test2", "test3"}

		// Verify type equivalence
		assert.IsType(t, pq.StringArray{}, arr)
		assert.Equal(t, 3, len(arr))
		assert.Equal(t, "test1", arr[0])
		assert.Equal(t, "test2", arr[1])
		assert.Equal(t, "test3", arr[2])

		// Test conversion to []string
		stringSlice := []string(arr)
		assert.Equal(t, []string{"test1", "test2", "test3"}, stringSlice)
	})
}
