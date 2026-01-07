"""
Unit Tests for Stakeholder Use Cases

Tests for all stakeholder management use cases including:
- Create, Get, Update, List stakeholders
- Document expectations, acknowledge limitations
- Establish communication channel
- Scope change requests
- Suspend and reactivate stakeholders
- Collaboration readiness check

Author: SICORA Team
Date: 2025
"""

import pytest
from uuid import uuid4
from unittest.mock import AsyncMock

from app.domain.entities.stakeholder import (
    StakeholderType,
    StakeholderStatus,
)
from app.application.use_cases.stakeholder_use_cases import (
    CreateStakeholderUseCase,
    GetStakeholderUseCase,
    UpdateStakeholderUseCase,
    ListStakeholdersUseCase,
    DocumentExpectationsUseCase,
    AcknowledgeLimitationsUseCase,
    EstablishCommunicationChannelUseCase,
    RecordScopeChangeRequestUseCase,
    SuspendStakeholderUseCase,
    ReactivateStakeholderUseCase,
    CheckCollaborationReadinessUseCase,
    GetStakeholderStatsUseCase,
)


class TestCreateStakeholderUseCase:
    """Tests for CreateStakeholderUseCase."""

    @pytest.mark.asyncio
    async def test_create_stakeholder_success(self, mock_stakeholder_repository):
        """Test successful stakeholder creation."""
        # Arrange
        user_id = uuid4()
        mock_stakeholder_repository.create = AsyncMock(
            side_effect=lambda s: s  # Return the same stakeholder
        )
        use_case = CreateStakeholderUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            name="TechCorp Colombia",
            stakeholder_type=StakeholderType.COMPANY,
            contact_person="María García",
            email="maria@techcorp.co",
            created_by=user_id,
            phone="+57 300 123 4567",
            sector="Tecnología",
        )

        # Assert
        assert result is not None
        assert result.name == "TechCorp Colombia"
        assert result.stakeholder_type == StakeholderType.COMPANY
        assert result.status == StakeholderStatus.ACTIVE
        assert result.expectations_documented is False
        assert result.limitations_acknowledged is False
        assert result.communication_channel_established is False
        mock_stakeholder_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_stakeholder_with_all_fields(
        self, mock_stakeholder_repository
    ):
        """Test stakeholder creation with all optional fields."""
        # Arrange
        user_id = uuid4()
        mock_stakeholder_repository.create = AsyncMock(side_effect=lambda s: s)
        use_case = CreateStakeholderUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            name="NGO Colombia",
            stakeholder_type=StakeholderType.NGO,
            contact_person="Juan Pérez",
            email="juan@ngo.org",
            created_by=user_id,
            phone="+57 311 987 6543",
            address="Calle 100 # 15-30, Bogotá",
            organization_size="medium",
            sector="ONG",
            website="https://www.ngo.org",
        )

        # Assert
        assert result.organization_size == "medium"
        assert result.sector == "ONG"
        assert result.website == "https://www.ngo.org"


class TestGetStakeholderUseCase:
    """Tests for GetStakeholderUseCase."""

    @pytest.mark.asyncio
    async def test_get_stakeholder_success(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test successful stakeholder retrieval."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        use_case = GetStakeholderUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(stakeholder_id=sample_stakeholder.id)

        # Assert
        assert result is not None
        assert result.id == sample_stakeholder.id
        mock_stakeholder_repository.get_by_id.assert_called_once_with(
            sample_stakeholder.id
        )

    @pytest.mark.asyncio
    async def test_get_stakeholder_not_found(self, mock_stakeholder_repository):
        """Test stakeholder not found."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(return_value=None)
        use_case = GetStakeholderUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(stakeholder_id=uuid4())

        # Assert
        assert result is None


class TestUpdateStakeholderUseCase:
    """Tests for UpdateStakeholderUseCase."""

    @pytest.mark.asyncio
    async def test_update_stakeholder_success(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test successful stakeholder update."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        mock_stakeholder_repository.update = AsyncMock(side_effect=lambda s: s)
        use_case = UpdateStakeholderUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=sample_stakeholder.id,
            name="TechCorp Colombia Updated",
            sector="Fintech",
        )

        # Assert
        assert result is not None
        assert result.name == "TechCorp Colombia Updated"
        assert result.sector == "Fintech"

    @pytest.mark.asyncio
    async def test_update_stakeholder_not_found(self, mock_stakeholder_repository):
        """Test update non-existent stakeholder."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(return_value=None)
        use_case = UpdateStakeholderUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(stakeholder_id=uuid4(), name="New Name")

        # Assert
        assert result is None


class TestListStakeholdersUseCase:
    """Tests for ListStakeholdersUseCase."""

    @pytest.mark.asyncio
    async def test_list_all_stakeholders(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test listing all stakeholders."""
        # Arrange
        mock_stakeholder_repository.get_all = AsyncMock(
            return_value=[sample_stakeholder]
        )
        use_case = ListStakeholdersUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute()

        # Assert
        assert len(result) == 1
        assert result[0].id == sample_stakeholder.id

    @pytest.mark.asyncio
    async def test_list_stakeholders_by_status(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test listing stakeholders filtered by status."""
        # Arrange
        mock_stakeholder_repository.get_all = AsyncMock(
            return_value=[sample_stakeholder]
        )
        use_case = ListStakeholdersUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(status=StakeholderStatus.ACTIVE)

        # Assert
        assert result is not None
        mock_stakeholder_repository.get_all.assert_called_once_with(
            status=StakeholderStatus.ACTIVE,
            stakeholder_type=None,
            collaboration_ready=None,
        )


class TestDocumentExpectationsUseCase:
    """Tests for DocumentExpectationsUseCase."""

    @pytest.mark.asyncio
    async def test_document_expectations_success(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test documenting stakeholder expectations."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        mock_stakeholder_repository.update = AsyncMock(side_effect=lambda s: s)
        use_case = DocumentExpectationsUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=sample_stakeholder.id,
            documented_by=uuid4(),
            expectations_summary="El stakeholder espera un sistema de gestión...",
        )

        # Assert
        assert result is not None
        assert result.expectations_documented is True

    @pytest.mark.asyncio
    async def test_document_expectations_not_found(self, mock_stakeholder_repository):
        """Test documenting expectations for non-existent stakeholder."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(return_value=None)
        use_case = DocumentExpectationsUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=uuid4(),
            documented_by=uuid4(),
            expectations_summary="Test",
        )

        # Assert
        assert result is None


class TestAcknowledgeLimitationsUseCase:
    """Tests for AcknowledgeLimitationsUseCase."""

    @pytest.mark.asyncio
    async def test_acknowledge_limitations_success(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test acknowledging limitations."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        mock_stakeholder_repository.update = AsyncMock(side_effect=lambda s: s)
        use_case = AcknowledgeLimitationsUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=sample_stakeholder.id,
            confirmation_text="Confirmo que entiendo las limitaciones...",
        )

        # Assert
        assert result is not None
        assert result.limitations_acknowledged is True


class TestEstablishCommunicationChannelUseCase:
    """Tests for EstablishCommunicationChannelUseCase."""

    @pytest.mark.asyncio
    async def test_establish_communication_success(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test establishing communication channel."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        mock_stakeholder_repository.update = AsyncMock(side_effect=lambda s: s)
        use_case = EstablishCommunicationChannelUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=sample_stakeholder.id,
            primary_channel="email",
            meeting_frequency="quincenal",
        )

        # Assert
        assert result is not None
        assert result.communication_channel_established is True


class TestRecordScopeChangeRequestUseCase:
    """Tests for RecordScopeChangeRequestUseCase."""

    @pytest.mark.asyncio
    async def test_record_approved_scope_change(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test recording approved scope change."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        mock_stakeholder_repository.update = AsyncMock(side_effect=lambda s: s)
        use_case = RecordScopeChangeRequestUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=sample_stakeholder.id,
            change_description="Agregar módulo de facturación",
            justification="Requerimiento legal",
            approved=True,
        )

        # Assert
        assert result is not None
        assert result.scope_change_requests == 1
        assert result.scope_changes_approved == 1
        assert result.scope_changes_rejected == 0

    @pytest.mark.asyncio
    async def test_record_rejected_scope_change(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test recording rejected scope change."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        mock_stakeholder_repository.update = AsyncMock(side_effect=lambda s: s)
        use_case = RecordScopeChangeRequestUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=sample_stakeholder.id,
            change_description="Cambio fuera del alcance",
            justification="Sería conveniente",
            approved=False,
        )

        # Assert
        assert result.scope_change_requests == 1
        assert result.scope_changes_rejected == 1


class TestSuspendStakeholderUseCase:
    """Tests for SuspendStakeholderUseCase."""

    @pytest.mark.asyncio
    async def test_suspend_stakeholder_success(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test suspending an active stakeholder."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        mock_stakeholder_repository.update = AsyncMock(side_effect=lambda s: s)
        use_case = SuspendStakeholderUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=sample_stakeholder.id,
            reason="Incumplimiento de compromisos",
        )

        # Assert
        assert result is not None
        assert result.status == StakeholderStatus.SUSPENDED

    @pytest.mark.asyncio
    async def test_suspend_already_suspended_stakeholder(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test suspending an already suspended stakeholder raises error."""
        # Arrange
        sample_stakeholder.status = StakeholderStatus.SUSPENDED
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        use_case = SuspendStakeholderUseCase(mock_stakeholder_repository)

        # Act & Assert
        with pytest.raises(
            ValueError, match="Only active stakeholders can be suspended"
        ):
            await use_case.execute(
                stakeholder_id=sample_stakeholder.id,
                reason="Test",
            )


class TestReactivateStakeholderUseCase:
    """Tests for ReactivateStakeholderUseCase."""

    @pytest.mark.asyncio
    async def test_reactivate_suspended_stakeholder(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test reactivating a suspended stakeholder."""
        # Arrange
        sample_stakeholder.status = StakeholderStatus.SUSPENDED
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        mock_stakeholder_repository.update = AsyncMock(side_effect=lambda s: s)
        use_case = ReactivateStakeholderUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(stakeholder_id=sample_stakeholder.id)

        # Assert
        assert result is not None
        assert result.status == StakeholderStatus.ACTIVE

    @pytest.mark.asyncio
    async def test_reactivate_active_stakeholder_raises_error(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test reactivating an already active stakeholder raises error."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        use_case = ReactivateStakeholderUseCase(mock_stakeholder_repository)

        # Act & Assert
        with pytest.raises(ValueError):
            await use_case.execute(stakeholder_id=sample_stakeholder.id)


class TestCheckCollaborationReadinessUseCase:
    """Tests for CheckCollaborationReadinessUseCase."""

    @pytest.mark.asyncio
    async def test_check_readiness_not_ready(
        self, mock_stakeholder_repository, sample_stakeholder
    ):
        """Test checking readiness for unprepared stakeholder."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder
        )
        use_case = CheckCollaborationReadinessUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(stakeholder_id=sample_stakeholder.id)

        # Assert
        assert result["is_ready"] is False
        assert len(result["missing_requirements"]) > 0
        assert len(result["recommendations"]) > 0

    @pytest.mark.asyncio
    async def test_check_readiness_ready(
        self, mock_stakeholder_repository, sample_stakeholder_collaboration_ready
    ):
        """Test checking readiness for prepared stakeholder."""
        # Arrange
        mock_stakeholder_repository.get_by_id = AsyncMock(
            return_value=sample_stakeholder_collaboration_ready
        )
        use_case = CheckCollaborationReadinessUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute(
            stakeholder_id=sample_stakeholder_collaboration_ready.id
        )

        # Assert
        assert result["is_ready"] is True
        assert len(result["missing_requirements"]) == 0


class TestGetStakeholderStatsUseCase:
    """Tests for GetStakeholderStatsUseCase."""

    @pytest.mark.asyncio
    async def test_get_stats(
        self,
        mock_stakeholder_repository,
        sample_stakeholder,
        sample_stakeholder_collaboration_ready,
    ):
        """Test getting stakeholder statistics."""
        # Arrange
        mock_stakeholder_repository.get_all = AsyncMock(
            return_value=[sample_stakeholder, sample_stakeholder_collaboration_ready]
        )
        use_case = GetStakeholderStatsUseCase(mock_stakeholder_repository)

        # Act
        result = await use_case.execute()

        # Assert
        assert result["total_stakeholders"] == 2
        assert result["active_stakeholders"] == 2
        assert result["collaboration_ready"] == 1
        assert "by_type" in result
        assert "by_status" in result
