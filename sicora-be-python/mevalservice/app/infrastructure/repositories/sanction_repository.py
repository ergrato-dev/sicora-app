"""
Sanction repository implementation.
"""

from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from ...domain.entities import Sanction, SanctionType, SeverityLevel, ComplianceStatus
from ...domain.repositories import SanctionRepository
from ..database.models import (
    SanctionModel,
    SanctionTypeDB,
    SeverityLevelDB,
    ComplianceStatusDB,
)


class SanctionRepositoryImpl(SanctionRepository):
    """SQLAlchemy implementation of SanctionRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: SanctionModel) -> Sanction:
        return Sanction(
            id=model.id,
            student_case_id=model.student_case_id,
            student_id=model.student_id,
            sanction_type=SanctionType(model.sanction_type.value),
            severity_level=SeverityLevel(model.severity_level.value),
            compliance_status=ComplianceStatus(model.compliance_status.value),
            description=model.description,
            legal_basis=model.legal_basis,
            effective_date=model.effective_date,
            end_date=model.end_date,
            is_appealable=model.is_appealable,
            appeal_deadline=model.appeal_deadline,
            imposed_by=model.imposed_by,
            conditions=model.conditions or [],
            compliance_notes=model.compliance_notes,
            notified_to_student=model.notified_to_student,
            notification_date=model.notification_date,
            notified_to_parent=model.notified_to_parent,
            parent_notification_date=model.parent_notification_date,
            recidivism_factor=model.recidivism_factor,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Sanction) -> SanctionModel:
        return SanctionModel(
            id=entity.id,
            student_case_id=entity.student_case_id,
            student_id=entity.student_id,
            sanction_type=SanctionTypeDB(entity.sanction_type.value),
            severity_level=SeverityLevelDB(entity.severity_level.value),
            compliance_status=ComplianceStatusDB(entity.compliance_status.value),
            description=entity.description,
            legal_basis=entity.legal_basis,
            effective_date=entity.effective_date,
            end_date=entity.end_date,
            is_appealable=entity.is_appealable,
            appeal_deadline=entity.appeal_deadline,
            imposed_by=entity.imposed_by,
            conditions=entity.conditions,
            compliance_notes=entity.compliance_notes,
            notified_to_student=entity.notified_to_student,
            notification_date=entity.notification_date,
            notified_to_parent=entity.notified_to_parent,
            parent_notification_date=entity.parent_notification_date,
            recidivism_factor=entity.recidivism_factor,
            is_active=entity.is_active,
        )

    async def create(self, sanction: Sanction) -> Sanction:
        model = self._to_model(sanction)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, sanction_id: UUID) -> Optional[Sanction]:
        result = await self.session.execute(
            select(SanctionModel).where(SanctionModel.id == sanction_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, sanction: Sanction) -> Sanction:
        result = await self.session.execute(
            select(SanctionModel).where(SanctionModel.id == sanction.id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.compliance_status = ComplianceStatusDB(
                sanction.compliance_status.value
            )
            model.compliance_notes = sanction.compliance_notes
            model.is_active = sanction.is_active
            model.notified_to_student = sanction.notified_to_student
            model.notification_date = sanction.notification_date
            model.notified_to_parent = sanction.notified_to_parent
            model.parent_notification_date = sanction.parent_notification_date
            await self.session.commit()
            await self.session.refresh(model)
            return self._to_entity(model)
        raise ValueError(f"Sanction {sanction.id} not found")

    async def delete(self, sanction_id: UUID) -> bool:
        result = await self.session.execute(
            select(SanctionModel).where(SanctionModel.id == sanction_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Sanction]:
        result = await self.session.execute(
            select(SanctionModel).offset(skip).limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_student(self, student_id: UUID) -> list[Sanction]:
        result = await self.session.execute(
            select(SanctionModel).where(SanctionModel.student_id == student_id)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_type(self, sanction_type: SanctionType) -> list[Sanction]:
        result = await self.session.execute(
            select(SanctionModel).where(
                SanctionModel.sanction_type == SanctionTypeDB(sanction_type.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_compliance_status(
        self, status: ComplianceStatus
    ) -> list[Sanction]:
        result = await self.session.execute(
            select(SanctionModel).where(
                SanctionModel.compliance_status == ComplianceStatusDB(status.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_active_sanctions(self) -> list[Sanction]:
        result = await self.session.execute(
            select(SanctionModel).where(SanctionModel.is_active.is_(True))
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_appealable_sanctions(self) -> list[Sanction]:
        result = await self.session.execute(
            select(SanctionModel).where(
                and_(
                    SanctionModel.is_appealable.is_(True),
                    SanctionModel.appeal_deadline >= date.today(),
                )
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_recidivism_count(self, student_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(SanctionModel.id)).where(
                SanctionModel.student_id == student_id
            )
        )
        return result.scalar() or 0

    async def get_expiring_soon(self, days_threshold: int = 7) -> list[Sanction]:
        threshold_date = date.today() + timedelta(days=days_threshold)
        result = await self.session.execute(
            select(SanctionModel).where(
                and_(
                    SanctionModel.is_active.is_(True),
                    SanctionModel.end_date.isnot(None),
                    SanctionModel.end_date <= threshold_date,
                    SanctionModel.end_date >= date.today(),
                )
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]
