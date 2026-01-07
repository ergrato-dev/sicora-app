"""
Infrastructure Dependencies - Dependency injection for ProjectEvalService.

Author: SICORA Team
Date: 2025
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_async_db
from .repositories.sqlalchemy_project_repository import SQLAlchemyProjectRepository
from .repositories.sqlalchemy_stakeholder_repository import (
    SQLAlchemyStakeholderRepository,
)
from .repositories.sqlalchemy_criterion_repository import SQLAlchemyCriterionRepository


async def get_project_repository(
    db: AsyncSession = Depends(get_async_db),
) -> SQLAlchemyProjectRepository:
    """Dependency for project repository."""
    return SQLAlchemyProjectRepository(db)


async def get_stakeholder_repository(
    db: AsyncSession = Depends(get_async_db),
) -> SQLAlchemyStakeholderRepository:
    """Dependency for stakeholder repository."""
    return SQLAlchemyStakeholderRepository(db)


async def get_criterion_repository(
    db: AsyncSession = Depends(get_async_db),
) -> SQLAlchemyCriterionRepository:
    """Dependency for criterion repository."""
    return SQLAlchemyCriterionRepository(db)


# Alias for backwards compatibility with existing code
async def get_evaluation_repository(
    db: AsyncSession = Depends(get_async_db),
):
    """Dependency for evaluation repository."""
    # TODO: Implement SQLAlchemyEvaluationRepository
    from .repositories.sqlalchemy_project_repository import SQLAlchemyProjectRepository

    return SQLAlchemyProjectRepository(db)
