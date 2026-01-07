"""
SQLAlchemy Criterion Repository - Database implementation for criterion persistence.

Author: SICORA Team
Date: 2025
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ...domain.entities.evaluation_criterion import (
    EvaluationCriterion,
    CriterionApproval,
    CriterionChangeHistory,
    CriterionStatus,
    CriterionCategory,
)
from ...domain.repositories.evaluation_criterion_repository import (
    EvaluationCriterionRepository,
)
from ..database.models.criterion_model import (
    CriterionModel,
    CriterionApprovalModel,
    CriterionChangeHistoryModel,
)


class SQLAlchemyCriterionRepository(EvaluationCriterionRepository):
    """SQLAlchemy implementation of EvaluationCriterionRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _model_to_entity(self, model: CriterionModel) -> EvaluationCriterion:
        """Convert SQLAlchemy model to domain entity."""
        return EvaluationCriterion(
            id=model.id,
            code=model.code,
            title=model.title,
            description=model.description,
            category=model.category,
            status=model.status,
            is_required=model.is_required,
            points=model.points,
            version=model.version,
            created_at=model.created_at,
            updated_at=model.updated_at,
            created_by=model.created_by,
            approved_by=model.approved_by or [],
            rejection_reason=model.rejection_reason,
            effective_date=model.effective_date,
            expiration_date=model.expiration_date,
        )

    def _entity_to_model(self, entity: EvaluationCriterion) -> CriterionModel:
        """Convert domain entity to SQLAlchemy model."""
        return CriterionModel(
            id=entity.id,
            code=entity.code,
            title=entity.title,
            description=entity.description,
            category=entity.category,
            status=entity.status,
            is_required=entity.is_required,
            points=entity.points,
            version=entity.version,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            created_by=entity.created_by,
            approved_by=list(entity.approved_by) if entity.approved_by else [],
            rejection_reason=entity.rejection_reason,
            effective_date=entity.effective_date,
            expiration_date=entity.expiration_date,
        )

    def _approval_model_to_entity(
        self, model: CriterionApprovalModel
    ) -> CriterionApproval:
        """Convert approval model to domain entity."""
        return CriterionApproval(
            id=model.id,
            criterion_id=model.criterion_id,
            pedagogical_member_id=model.pedagogical_member_id,
            approval_status=model.approval_status,
            comments=model.comments,
            created_at=model.created_at,
        )

    def _history_model_to_entity(
        self, model: CriterionChangeHistoryModel
    ) -> CriterionChangeHistory:
        """Convert history model to domain entity."""
        return CriterionChangeHistory(
            id=model.id,
            criterion_id=model.criterion_id,
            changed_by=model.changed_by,
            change_type=model.change_type,
            old_version=model.old_version,
            new_version=model.new_version,
            change_reason=model.change_reason,
            created_at=model.created_at,
        )

    async def create(
        self,
        criterion: EvaluationCriterion,
        change_history: Optional[CriterionChangeHistory] = None,
    ) -> EvaluationCriterion:
        """Create a new evaluation criterion."""
        model = self._entity_to_model(criterion)
        self.session.add(model)

        # Create change history if provided
        if change_history:
            history_model = CriterionChangeHistoryModel(
                id=change_history.id,
                criterion_id=criterion.id,
                changed_by=change_history.changed_by,
                change_type=change_history.change_type,
                old_version=change_history.old_version,
                new_version=self._serialize_entity(criterion),
                change_reason=change_history.change_reason,
                created_at=change_history.created_at,
            )
            self.session.add(history_model)

        await self.session.commit()
        await self.session.refresh(model)
        return self._model_to_entity(model)

    async def get_by_id(self, criterion_id: UUID) -> Optional[EvaluationCriterion]:
        """Get criterion by ID."""
        stmt = select(CriterionModel).where(CriterionModel.id == criterion_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._model_to_entity(model) if model else None

    async def get_by_code(self, code: str) -> Optional[EvaluationCriterion]:
        """Get criterion by code."""
        stmt = select(CriterionModel).where(CriterionModel.code == code)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._model_to_entity(model) if model else None

    async def get_active_criteria(
        self, category: Optional[CriterionCategory] = None
    ) -> List[EvaluationCriterion]:
        """Get all active criteria, optionally filtered by category."""
        conditions = [CriterionModel.status == CriterionStatus.ACTIVE]
        if category:
            conditions.append(CriterionModel.category == category)

        stmt = select(CriterionModel).where(and_(*conditions))
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._model_to_entity(model) for model in models]

    async def get_by_status(self, status: CriterionStatus) -> List[EvaluationCriterion]:
        """Get criteria by status."""
        stmt = select(CriterionModel).where(CriterionModel.status == status)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._model_to_entity(model) for model in models]

    async def get_criteria(
        self,
        status: Optional[CriterionStatus] = None,
        category: Optional[CriterionCategory] = None,
        is_required: Optional[bool] = None,
        active_only: bool = False,
    ) -> List[EvaluationCriterion]:
        """Get criteria with optional filters."""
        stmt = select(CriterionModel)

        conditions = []
        if status:
            conditions.append(CriterionModel.status == status)
        if category:
            conditions.append(CriterionModel.category == category)
        if is_required is not None:
            conditions.append(CriterionModel.is_required == is_required)
        if active_only:
            conditions.append(CriterionModel.status == CriterionStatus.ACTIVE)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        result = await self.session.execute(stmt)
        models = result.scalars().all()
        entities = [self._model_to_entity(model) for model in models]

        # Additional filtering for active_only based on dates
        if active_only:
            now = datetime.utcnow()
            entities = [
                e
                for e in entities
                if (e.effective_date is None or e.effective_date <= now)
                and (e.expiration_date is None or e.expiration_date > now)
            ]

        return entities

    async def update(
        self,
        criterion: EvaluationCriterion,
        change_history: Optional[CriterionChangeHistory] = None,
    ) -> EvaluationCriterion:
        """Update an existing criterion."""
        stmt = select(CriterionModel).where(CriterionModel.id == criterion.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            raise ValueError(f"Criterion with id {criterion.id} not found")

        # Update model fields
        model.code = criterion.code
        model.title = criterion.title
        model.description = criterion.description
        model.category = criterion.category
        model.status = criterion.status
        model.is_required = criterion.is_required
        model.points = criterion.points
        model.version = criterion.version
        model.approved_by = list(criterion.approved_by) if criterion.approved_by else []
        model.rejection_reason = criterion.rejection_reason
        model.effective_date = criterion.effective_date
        model.expiration_date = criterion.expiration_date
        model.updated_at = datetime.utcnow()

        # Create change history if provided
        if change_history:
            history_model = CriterionChangeHistoryModel(
                id=change_history.id,
                criterion_id=criterion.id,
                changed_by=change_history.changed_by,
                change_type=change_history.change_type,
                old_version=change_history.old_version,
                new_version=self._serialize_entity(criterion),
                change_reason=change_history.change_reason,
                created_at=change_history.created_at,
            )
            self.session.add(history_model)

        await self.session.commit()
        await self.session.refresh(model)
        return self._model_to_entity(model)

    async def approve(
        self,
        criterion: EvaluationCriterion,
        approval: CriterionApproval,
        change_history: CriterionChangeHistory,
    ) -> EvaluationCriterion:
        """Approve a criterion and record the approval."""
        # Update criterion
        updated_criterion = await self.update(criterion, change_history)

        # Create approval record
        approval_model = CriterionApprovalModel(
            id=approval.id,
            criterion_id=approval.criterion_id,
            pedagogical_member_id=approval.pedagogical_member_id,
            approval_status=approval.approval_status,
            comments=approval.comments,
            created_at=approval.created_at,
        )
        self.session.add(approval_model)
        await self.session.commit()

        return updated_criterion

    async def reject(
        self,
        criterion: EvaluationCriterion,
        rejection: CriterionApproval,
        change_history: CriterionChangeHistory,
    ) -> EvaluationCriterion:
        """Reject a criterion and record the rejection."""
        # Update criterion
        updated_criterion = await self.update(criterion, change_history)

        # Create rejection record
        rejection_model = CriterionApprovalModel(
            id=rejection.id,
            criterion_id=rejection.criterion_id,
            pedagogical_member_id=rejection.pedagogical_member_id,
            approval_status=rejection.approval_status,
            comments=rejection.comments,
            created_at=rejection.created_at,
        )
        self.session.add(rejection_model)
        await self.session.commit()

        return updated_criterion

    async def get_pending_approval(self) -> List[EvaluationCriterion]:
        """Get criteria pending approval."""
        return await self.get_by_status(CriterionStatus.PENDING_APPROVAL)

    async def get_versions(self, code: str) -> List[EvaluationCriterion]:
        """Get all versions of a criterion by code."""
        stmt = (
            select(CriterionModel)
            .where(CriterionModel.code == code)
            .order_by(CriterionModel.version)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._model_to_entity(model) for model in models]

    async def get_history(self, criterion_id: UUID) -> List[CriterionChangeHistory]:
        """Get change history for a criterion."""
        stmt = (
            select(CriterionChangeHistoryModel)
            .where(CriterionChangeHistoryModel.criterion_id == criterion_id)
            .order_by(CriterionChangeHistoryModel.created_at.desc())
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._history_model_to_entity(model) for model in models]

    def _serialize_entity(self, entity: EvaluationCriterion) -> dict:
        """Serialize entity to dict for JSON storage."""
        return {
            "id": str(entity.id),
            "code": entity.code,
            "title": entity.title,
            "description": entity.description,
            "category": entity.category.value,
            "status": entity.status.value,
            "is_required": entity.is_required,
            "points": entity.points,
            "version": entity.version,
            "created_at": entity.created_at.isoformat() if entity.created_at else None,
            "updated_at": entity.updated_at.isoformat() if entity.updated_at else None,
            "created_by": str(entity.created_by),
            "approved_by": [str(u) for u in entity.approved_by]
            if entity.approved_by
            else [],
            "rejection_reason": entity.rejection_reason,
            "effective_date": entity.effective_date.isoformat()
            if entity.effective_date
            else None,
            "expiration_date": entity.expiration_date.isoformat()
            if entity.expiration_date
            else None,
        }
