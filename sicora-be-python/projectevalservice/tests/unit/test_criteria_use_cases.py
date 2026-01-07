"""
Unit Tests for Criteria Use Cases

Tests for all criteria management use cases including:
- Create, Get, List criteria
- Submit for approval
- Approve and reject criteria
- Deactivate criteria
- Get change history

Author: SICORA Team
Date: 2025
"""

import pytest
from uuid import uuid4
from datetime import datetime
from unittest.mock import AsyncMock

from app.domain.entities.evaluation_criterion import (
    EvaluationCriterion,
    CriterionStatus,
    CriterionCategory,
)
from app.application.use_cases.criteria_use_cases import (
    CreateCriterionUseCase,
    SubmitCriterionForApprovalUseCase,
    ApproveCriterionUseCase,
    RejectCriterionUseCase,
    GetCriterionUseCase,
    GetCriteriaUseCase,
    GetCriterionHistoryUseCase,
    DeactivateCriterionUseCase,
)


class TestCreateCriterionUseCase:
    """Tests for CreateCriterionUseCase."""

    @pytest.mark.asyncio
    async def test_create_criterion_success(self, mock_criterion_repository):
        """Test successful criterion creation."""
        # Arrange
        user_id = uuid4()
        mock_criterion_repository.create = AsyncMock(side_effect=lambda c, h: c)
        use_case = CreateCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            code="AR-001",
            title="Arquitectura Clean modular",
            description="El proyecto implementa arquitectura Clean...",
            category=CriterionCategory.ARCHITECTURE,
            is_required=True,
            points=10,
            created_by=user_id,
        )

        # Assert
        assert result is not None
        assert result.code == "AR-001"
        assert result.status == CriterionStatus.DRAFT
        assert result.version == 1
        assert result.approved_by == []
        mock_criterion_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_criterion_with_dates(self, mock_criterion_repository):
        """Test criterion creation with effective and expiration dates."""
        # Arrange
        user_id = uuid4()
        effective_date = datetime.utcnow()
        expiration_date = datetime(2025, 12, 31)
        mock_criterion_repository.create = AsyncMock(side_effect=lambda c, h: c)
        use_case = CreateCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            code="BD-001",
            title="Gestión de datos",
            description="El proyecto utiliza ORM...",
            category=CriterionCategory.DATA_MANAGEMENT,
            is_required=False,
            points=15,
            created_by=user_id,
            effective_date=effective_date,
            expiration_date=expiration_date,
        )

        # Assert
        assert result.effective_date == effective_date
        assert result.expiration_date == expiration_date


class TestSubmitCriterionForApprovalUseCase:
    """Tests for SubmitCriterionForApprovalUseCase."""

    @pytest.mark.asyncio
    async def test_submit_for_approval_success(
        self, mock_criterion_repository, sample_criterion
    ):
        """Test successful submission for approval."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(return_value=sample_criterion)
        mock_criterion_repository.update = AsyncMock(side_effect=lambda c, h: c)
        use_case = SubmitCriterionForApprovalUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            criterion_id=sample_criterion.id,
            submitted_by=uuid4(),
        )

        # Assert
        assert result is not None
        assert result.status == CriterionStatus.PENDING_APPROVAL

    @pytest.mark.asyncio
    async def test_submit_non_draft_raises_error(
        self, mock_criterion_repository, sample_criterion_active
    ):
        """Test submitting non-draft criterion raises error."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(
            return_value=sample_criterion_active
        )
        use_case = SubmitCriterionForApprovalUseCase(mock_criterion_repository)

        # Act & Assert
        with pytest.raises(ValueError, match="Only criteria in draft status"):
            await use_case.execute(
                criterion_id=sample_criterion_active.id,
                submitted_by=uuid4(),
            )

    @pytest.mark.asyncio
    async def test_submit_not_found(self, mock_criterion_repository):
        """Test submitting non-existent criterion."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(return_value=None)
        use_case = SubmitCriterionForApprovalUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            criterion_id=uuid4(),
            submitted_by=uuid4(),
        )

        # Assert
        assert result is None


class TestApproveCriterionUseCase:
    """Tests for ApproveCriterionUseCase."""

    @pytest.mark.asyncio
    async def test_approve_criterion_success(
        self, mock_criterion_repository, sample_criterion_pending_approval
    ):
        """Test successful criterion approval."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(
            return_value=sample_criterion_pending_approval
        )
        mock_criterion_repository.approve = AsyncMock(side_effect=lambda c, a, h: c)
        use_case = ApproveCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            criterion_id=sample_criterion_pending_approval.id,
            approver_id=uuid4(),
            comments="Bien definido",
        )

        # Assert
        assert result is not None
        mock_criterion_repository.approve.assert_called_once()

    @pytest.mark.asyncio
    async def test_approve_non_pending_raises_error(
        self, mock_criterion_repository, sample_criterion
    ):
        """Test approving non-pending criterion raises error."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(return_value=sample_criterion)
        use_case = ApproveCriterionUseCase(mock_criterion_repository)

        # Act & Assert
        with pytest.raises(
            ValueError, match="Only criteria in pending approval status"
        ):
            await use_case.execute(
                criterion_id=sample_criterion.id,
                approver_id=uuid4(),
            )

    @pytest.mark.asyncio
    async def test_approve_with_enough_approvals_activates(
        self, mock_criterion_repository
    ):
        """Test criterion becomes active with enough approvals."""
        # Arrange
        criterion = EvaluationCriterion(
            id=uuid4(),
            code="TEST-001",
            title="Test",
            description="Test criterion",
            category=CriterionCategory.TESTING,
            status=CriterionStatus.PENDING_APPROVAL,
            is_required=True,
            points=10,
            version=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            created_by=uuid4(),
            approved_by=[uuid4(), uuid4()],  # 2 approvals already
            rejection_reason=None,
            effective_date=None,
            expiration_date=None,
        )
        mock_criterion_repository.get_by_id = AsyncMock(return_value=criterion)

        def mock_approve(c, a, h):
            # Simulate the criterion being activated
            return EvaluationCriterion(
                **{**c.__dict__, "status": CriterionStatus.ACTIVE}
            )

        mock_criterion_repository.approve = AsyncMock(side_effect=mock_approve)
        use_case = ApproveCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            criterion_id=criterion.id,
            approver_id=uuid4(),  # Third approval
        )

        # Assert
        assert result.status == CriterionStatus.ACTIVE


class TestRejectCriterionUseCase:
    """Tests for RejectCriterionUseCase."""

    @pytest.mark.asyncio
    async def test_reject_criterion_success(
        self, mock_criterion_repository, sample_criterion_pending_approval
    ):
        """Test successful criterion rejection."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(
            return_value=sample_criterion_pending_approval
        )
        mock_criterion_repository.reject = AsyncMock(side_effect=lambda c, r, h: c)
        use_case = RejectCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            criterion_id=sample_criterion_pending_approval.id,
            rejector_id=uuid4(),
            rejection_reason="Criterio necesita mayor especificidad",
        )

        # Assert
        assert result is not None
        assert result.status == CriterionStatus.DRAFT
        mock_criterion_repository.reject.assert_called_once()

    @pytest.mark.asyncio
    async def test_reject_non_pending_raises_error(
        self, mock_criterion_repository, sample_criterion
    ):
        """Test rejecting non-pending criterion raises error."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(return_value=sample_criterion)
        use_case = RejectCriterionUseCase(mock_criterion_repository)

        # Act & Assert
        with pytest.raises(
            ValueError, match="Only criteria in pending approval status"
        ):
            await use_case.execute(
                criterion_id=sample_criterion.id,
                rejector_id=uuid4(),
                rejection_reason="Test",
            )


class TestGetCriterionUseCase:
    """Tests for GetCriterionUseCase."""

    @pytest.mark.asyncio
    async def test_get_criterion_success(
        self, mock_criterion_repository, sample_criterion
    ):
        """Test successful criterion retrieval."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(return_value=sample_criterion)
        use_case = GetCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(criterion_id=sample_criterion.id)

        # Assert
        assert result is not None
        assert result.id == sample_criterion.id

    @pytest.mark.asyncio
    async def test_get_criterion_not_found(self, mock_criterion_repository):
        """Test criterion not found."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(return_value=None)
        use_case = GetCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(criterion_id=uuid4())

        # Assert
        assert result is None


class TestGetCriteriaUseCase:
    """Tests for GetCriteriaUseCase."""

    @pytest.mark.asyncio
    async def test_get_all_criteria(
        self, mock_criterion_repository, sample_criterion, sample_criterion_active
    ):
        """Test listing all criteria."""
        # Arrange
        mock_criterion_repository.get_criteria = AsyncMock(
            return_value=[sample_criterion, sample_criterion_active]
        )
        use_case = GetCriteriaUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute()

        # Assert
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_get_criteria_with_filters(
        self, mock_criterion_repository, sample_criterion_active
    ):
        """Test listing criteria with filters."""
        # Arrange
        mock_criterion_repository.get_criteria = AsyncMock(
            return_value=[sample_criterion_active]
        )
        use_case = GetCriteriaUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            status=CriterionStatus.ACTIVE,
            category=CriterionCategory.DATA_MANAGEMENT,
            active_only=True,
        )

        # Assert
        assert result is not None
        mock_criterion_repository.get_criteria.assert_called_once_with(
            status=CriterionStatus.ACTIVE,
            category=CriterionCategory.DATA_MANAGEMENT,
            is_required=None,
            active_only=True,
        )


class TestGetCriterionHistoryUseCase:
    """Tests for GetCriterionHistoryUseCase."""

    @pytest.mark.asyncio
    async def test_get_history_success(
        self, mock_criterion_repository, sample_criterion_change_history
    ):
        """Test getting criterion history."""
        # Arrange
        mock_criterion_repository.get_history = AsyncMock(
            return_value=[sample_criterion_change_history]
        )
        use_case = GetCriterionHistoryUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(criterion_id=uuid4())

        # Assert
        assert len(result) == 1
        assert result[0].change_type == "CREATE"


class TestDeactivateCriterionUseCase:
    """Tests for DeactivateCriterionUseCase."""

    @pytest.mark.asyncio
    async def test_deactivate_criterion_success(
        self, mock_criterion_repository, sample_criterion_active
    ):
        """Test successful criterion deactivation."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(
            return_value=sample_criterion_active
        )
        mock_criterion_repository.update = AsyncMock(side_effect=lambda c, h: c)
        use_case = DeactivateCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            criterion_id=sample_criterion_active.id,
            deactivated_by=uuid4(),
            reason="Criterio obsoleto",
        )

        # Assert
        assert result is not None
        assert result.status == CriterionStatus.INACTIVE

    @pytest.mark.asyncio
    async def test_deactivate_non_active_raises_error(
        self, mock_criterion_repository, sample_criterion
    ):
        """Test deactivating non-active criterion raises error."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(return_value=sample_criterion)
        use_case = DeactivateCriterionUseCase(mock_criterion_repository)

        # Act & Assert
        with pytest.raises(ValueError, match="Only active criteria can be deactivated"):
            await use_case.execute(
                criterion_id=sample_criterion.id,
                deactivated_by=uuid4(),
                reason="Test",
            )

    @pytest.mark.asyncio
    async def test_deactivate_not_found(self, mock_criterion_repository):
        """Test deactivating non-existent criterion."""
        # Arrange
        mock_criterion_repository.get_by_id = AsyncMock(return_value=None)
        use_case = DeactivateCriterionUseCase(mock_criterion_repository)

        # Act
        result = await use_case.execute(
            criterion_id=uuid4(),
            deactivated_by=uuid4(),
            reason="Test",
        )

        # Assert
        assert result is None
