"""
SQLAlchemy Stakeholder Repository - Database implementation for stakeholder persistence.

Author: SICORA Team
Date: 2025
"""

from typing import List, Optional, Tuple
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ...domain.entities.stakeholder import (
    Stakeholder,
    StakeholderStatus,
    StakeholderType,
)
from ...domain.repositories.stakeholder_repository import StakeholderRepository
from ..database.models.stakeholder_model import StakeholderModel


class SQLAlchemyStakeholderRepository(StakeholderRepository):
    """SQLAlchemy implementation of StakeholderRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _model_to_entity(self, model: StakeholderModel) -> Stakeholder:
        """Convert SQLAlchemy model to domain entity."""
        return Stakeholder(
            id=model.id,
            name=model.name,
            stakeholder_type=model.stakeholder_type,
            status=model.status,
            contact_person=model.contact_person,
            email=model.email,
            phone=model.phone,
            address=model.address,
            organization_size=model.organization_size,
            sector=model.sector,
            website=model.website,
            previous_collaborations=model.previous_collaborations,
            expectations_documented=model.expectations_documented,
            limitations_acknowledged=model.limitations_acknowledged,
            communication_channel_established=model.communication_channel_established,
            created_at=model.created_at,
            updated_at=model.updated_at,
            created_by=model.created_by,
            scope_change_requests=model.scope_change_requests,
            scope_changes_approved=model.scope_changes_approved,
            scope_changes_rejected=model.scope_changes_rejected,
            last_interaction_date=model.last_interaction_date,
        )

    def _entity_to_model(self, entity: Stakeholder) -> StakeholderModel:
        """Convert domain entity to SQLAlchemy model."""
        return StakeholderModel(
            id=entity.id,
            name=entity.name,
            stakeholder_type=entity.stakeholder_type,
            status=entity.status,
            contact_person=entity.contact_person,
            email=entity.email,
            phone=entity.phone,
            address=entity.address,
            organization_size=entity.organization_size,
            sector=entity.sector,
            website=entity.website,
            previous_collaborations=entity.previous_collaborations,
            expectations_documented=entity.expectations_documented,
            limitations_acknowledged=entity.limitations_acknowledged,
            communication_channel_established=entity.communication_channel_established,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            created_by=entity.created_by,
            scope_change_requests=entity.scope_change_requests,
            scope_changes_approved=entity.scope_changes_approved,
            scope_changes_rejected=entity.scope_changes_rejected,
            last_interaction_date=entity.last_interaction_date,
        )

    async def create(self, stakeholder: Stakeholder) -> Stakeholder:
        """Create a new stakeholder."""
        model = self._entity_to_model(stakeholder)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._model_to_entity(model)

    async def get_by_id(self, stakeholder_id: UUID) -> Optional[Stakeholder]:
        """Get stakeholder by ID."""
        stmt = select(StakeholderModel).where(StakeholderModel.id == stakeholder_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._model_to_entity(model) if model else None

    async def get_by_email(self, email: str) -> Optional[Stakeholder]:
        """Get stakeholder by email."""
        stmt = select(StakeholderModel).where(StakeholderModel.email == email)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._model_to_entity(model) if model else None

    async def get_by_status(self, status: StakeholderStatus) -> List[Stakeholder]:
        """Get stakeholders by status."""
        stmt = select(StakeholderModel).where(StakeholderModel.status == status)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._model_to_entity(model) for model in models]

    async def get_by_type(self, stakeholder_type: StakeholderType) -> List[Stakeholder]:
        """Get stakeholders by type."""
        stmt = select(StakeholderModel).where(
            StakeholderModel.stakeholder_type == stakeholder_type
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._model_to_entity(model) for model in models]

    async def get_active_stakeholders(self) -> List[Stakeholder]:
        """Get all active stakeholders."""
        stmt = select(StakeholderModel).where(
            StakeholderModel.status == StakeholderStatus.ACTIVE
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._model_to_entity(model) for model in models]

    async def get_all(
        self,
        status: Optional[StakeholderStatus] = None,
        stakeholder_type: Optional[StakeholderType] = None,
        collaboration_ready: Optional[bool] = None,
    ) -> List[Stakeholder]:
        """Get all stakeholders with optional filters."""
        stmt = select(StakeholderModel)

        conditions = []
        if status:
            conditions.append(StakeholderModel.status == status)
        if stakeholder_type:
            conditions.append(StakeholderModel.stakeholder_type == stakeholder_type)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        result = await self.session.execute(stmt)
        models = result.scalars().all()
        entities = [self._model_to_entity(model) for model in models]

        # Filter by collaboration_ready if specified
        if collaboration_ready is not None:
            entities = [
                e for e in entities if e.is_collaboration_ready() == collaboration_ready
            ]

        return entities

    async def update(self, stakeholder: Stakeholder) -> Stakeholder:
        """Update existing stakeholder."""
        stmt = select(StakeholderModel).where(StakeholderModel.id == stakeholder.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            raise ValueError(f"Stakeholder with id {stakeholder.id} not found")

        # Update model fields
        model.name = stakeholder.name
        model.stakeholder_type = stakeholder.stakeholder_type
        model.status = stakeholder.status
        model.contact_person = stakeholder.contact_person
        model.email = stakeholder.email
        model.phone = stakeholder.phone
        model.address = stakeholder.address
        model.organization_size = stakeholder.organization_size
        model.sector = stakeholder.sector
        model.website = stakeholder.website
        model.previous_collaborations = stakeholder.previous_collaborations
        model.expectations_documented = stakeholder.expectations_documented
        model.limitations_acknowledged = stakeholder.limitations_acknowledged
        model.communication_channel_established = (
            stakeholder.communication_channel_established
        )
        model.scope_change_requests = stakeholder.scope_change_requests
        model.scope_changes_approved = stakeholder.scope_changes_approved
        model.scope_changes_rejected = stakeholder.scope_changes_rejected
        model.last_interaction_date = stakeholder.last_interaction_date
        model.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(model)
        return self._model_to_entity(model)

    async def delete(self, stakeholder_id: UUID) -> bool:
        """Delete stakeholder."""
        stmt = select(StakeholderModel).where(StakeholderModel.id == stakeholder_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def search_stakeholders(
        self,
        name: Optional[str] = None,
        stakeholder_type: Optional[StakeholderType] = None,
        status: Optional[StakeholderStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Stakeholder], int]:
        """Search stakeholders with filters and pagination."""
        stmt = select(StakeholderModel)

        conditions = []
        if name:
            conditions.append(StakeholderModel.name.ilike(f"%{name}%"))
        if stakeholder_type:
            conditions.append(StakeholderModel.stakeholder_type == stakeholder_type)
        if status:
            conditions.append(StakeholderModel.status == status)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        # Count total
        count_result = await self.session.execute(stmt)
        total = len(count_result.scalars().all())

        # Apply pagination
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        return [self._model_to_entity(model) for model in models], total
