"""
Pytest Configuration - Fixtures and configuration for ProjectEvalService tests.

Author: SICORA Team
Date: 2025
"""

import pytest
import asyncio
import sys
from pathlib import Path
from typing import AsyncGenerator
from uuid import uuid4
from datetime import datetime, timedelta
from unittest.mock import AsyncMock

# Add the app path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set environment variables before any imports
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test"
)
os.environ.setdefault("SECRET_KEY", "test-secret-key")

from httpx import AsyncClient, ASGITransport

# Import domain entities directly
from app.domain.entities.stakeholder import (
    Stakeholder,
    StakeholderType,
    StakeholderStatus,
)
from app.domain.entities.evaluation_criterion import (
    EvaluationCriterion,
    CriterionStatus,
    CriterionCategory,
    CriterionApproval,
    ApprovalStatus,
    CriterionChangeHistory,
)


# =============================================================================
# Event Loop Configuration
# =============================================================================


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# =============================================================================
# Mock Repository Fixtures
# =============================================================================


@pytest.fixture
def mock_stakeholder_repository():
    """Create a mock stakeholder repository."""
    repo = AsyncMock()
    repo.create = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_email = AsyncMock()
    repo.get_by_status = AsyncMock()
    repo.get_by_type = AsyncMock()
    repo.get_active_stakeholders = AsyncMock()
    repo.get_all = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    repo.search_stakeholders = AsyncMock()
    return repo


@pytest.fixture
def mock_criterion_repository():
    """Create a mock criterion repository."""
    repo = AsyncMock()
    repo.create = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_code = AsyncMock()
    repo.get_active_criteria = AsyncMock()
    repo.get_by_status = AsyncMock()
    repo.get_criteria = AsyncMock()
    repo.update = AsyncMock()
    repo.approve = AsyncMock()
    repo.reject = AsyncMock()
    repo.get_pending_approval = AsyncMock()
    repo.get_versions = AsyncMock()
    repo.get_history = AsyncMock()
    return repo


@pytest.fixture
def mock_project_repository():
    """Create a mock project repository."""
    repo = AsyncMock()
    repo.create = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_group_id = AsyncMock()
    repo.get_by_cohort_id = AsyncMock()
    repo.get_by_stakeholder_id = AsyncMock()
    repo.get_by_status = AsyncMock()
    repo.get_by_academic_period = AsyncMock()
    repo.get_active_projects = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    repo.search_projects = AsyncMock()
    return repo


@pytest.fixture
def mock_evaluation_repository():
    """Create a mock evaluation repository."""
    repo = AsyncMock()
    repo.create = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_project_id = AsyncMock()
    repo.get_scheduled = AsyncMock()
    repo.get_by_period = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    return repo


# =============================================================================
# Sample Entity Fixtures
# =============================================================================


@pytest.fixture
def sample_stakeholder():
    """Create a sample stakeholder entity."""
    return Stakeholder(
        id=uuid4(),
        name="TechCorp Colombia S.A.S",
        stakeholder_type=StakeholderType.COMPANY,
        status=StakeholderStatus.ACTIVE,
        contact_person="María García",
        email="maria.garcia@techcorp.co",
        phone="+57 300 123 4567",
        address="Cra 15 # 100-50, Bogotá",
        organization_size="medium",
        sector="Tecnología",
        website="https://www.techcorp.co",
        previous_collaborations=2,
        expectations_documented=False,
        limitations_acknowledged=False,
        communication_channel_established=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by=uuid4(),
        scope_change_requests=0,
        scope_changes_approved=0,
        scope_changes_rejected=0,
        last_interaction_date=None,
    )


@pytest.fixture
def sample_stakeholder_collaboration_ready():
    """Create a sample stakeholder ready for collaboration."""
    return Stakeholder(
        id=uuid4(),
        name="GovTech Colombia",
        stakeholder_type=StakeholderType.GOVERNMENT,
        status=StakeholderStatus.ACTIVE,
        contact_person="Carlos Rodríguez",
        email="carlos.rodriguez@govtech.gov.co",
        phone="+57 311 987 6543",
        address="Av Principal # 50-30, Medellín",
        organization_size="large",
        sector="Gobierno",
        website="https://www.govtech.gov.co",
        previous_collaborations=5,
        expectations_documented=True,
        limitations_acknowledged=True,
        communication_channel_established=True,
        created_at=datetime.utcnow() - timedelta(days=30),
        updated_at=datetime.utcnow(),
        created_by=uuid4(),
        scope_change_requests=3,
        scope_changes_approved=2,
        scope_changes_rejected=1,
        last_interaction_date=datetime.utcnow() - timedelta(days=7),
    )


@pytest.fixture
def sample_criterion():
    """Create a sample evaluation criterion entity."""
    return EvaluationCriterion(
        id=uuid4(),
        code="AR-001",
        title="Arquitectura Clean modular",
        description="El proyecto implementa arquitectura Clean con separación de capas domain, application, infrastructure y presentation",
        category=CriterionCategory.ARCHITECTURE,
        status=CriterionStatus.DRAFT,
        is_required=True,
        points=10,
        version=1,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by=uuid4(),
        approved_by=[],
        rejection_reason=None,
        effective_date=None,
        expiration_date=None,
    )


@pytest.fixture
def sample_criterion_active():
    """Create a sample active evaluation criterion."""
    return EvaluationCriterion(
        id=uuid4(),
        code="BD-001",
        title="Gestión de datos con ORM",
        description="El proyecto utiliza un ORM para la gestión de datos con migraciones controladas",
        category=CriterionCategory.DATA_MANAGEMENT,
        status=CriterionStatus.ACTIVE,
        is_required=True,
        points=15,
        version=1,
        created_at=datetime.utcnow() - timedelta(days=60),
        updated_at=datetime.utcnow() - timedelta(days=30),
        created_by=uuid4(),
        approved_by=[uuid4(), uuid4(), uuid4()],
        rejection_reason=None,
        effective_date=datetime.utcnow() - timedelta(days=30),
        expiration_date=None,
    )


@pytest.fixture
def sample_criterion_pending_approval():
    """Create a sample criterion pending approval."""
    return EvaluationCriterion(
        id=uuid4(),
        code="SEC-001",
        title="Validación de inputs",
        description="El proyecto implementa validación de inputs para prevenir inyecciones",
        category=CriterionCategory.SECURITY,
        status=CriterionStatus.PENDING_APPROVAL,
        is_required=True,
        points=20,
        version=1,
        created_at=datetime.utcnow() - timedelta(days=7),
        updated_at=datetime.utcnow() - timedelta(days=1),
        created_by=uuid4(),
        approved_by=[uuid4()],  # One approval, needs 2 more
        rejection_reason=None,
        effective_date=None,
        expiration_date=None,
    )


@pytest.fixture
def sample_criterion_approval():
    """Create a sample criterion approval."""
    return CriterionApproval(
        id=uuid4(),
        criterion_id=uuid4(),
        pedagogical_member_id=uuid4(),
        approval_status=ApprovalStatus.APPROVED,
        comments="Criterio bien definido y alineado con objetivos pedagógicos",
        created_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_criterion_change_history():
    """Create a sample criterion change history."""
    return CriterionChangeHistory(
        id=uuid4(),
        criterion_id=uuid4(),
        changed_by=uuid4(),
        change_type="CREATE",
        old_version=None,
        new_version={"code": "AR-001", "title": "Arquitectura Clean modular"},
        change_reason="Initial creation",
        created_at=datetime.utcnow(),
    )


# =============================================================================
# Test Data Fixtures
# =============================================================================


@pytest.fixture
def user_id():
    """Generate a sample user ID."""
    return uuid4()


@pytest.fixture
def instructor_id():
    """Generate a sample instructor ID."""
    return uuid4()


@pytest.fixture
def pedagogical_member_ids():
    """Generate sample pedagogical committee member IDs."""
    return [uuid4() for _ in range(3)]


# =============================================================================
# API Client Fixtures (for integration tests)
# =============================================================================


@pytest.fixture
async def test_app():
    """Create test application instance."""
    from app.main import app

    # Override dependencies here if needed
    # app.dependency_overrides[get_stakeholder_repository] = lambda: mock_repo

    yield app


@pytest.fixture
async def async_client(test_app) -> AsyncGenerator:
    """Create async test client."""
    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        yield client
