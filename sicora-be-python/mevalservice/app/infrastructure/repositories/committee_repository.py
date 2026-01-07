"""
Committee repository implementation.
"""

from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy import and_, extract, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...domain.entities import Committee, CommitteeStatus, CommitteeType
from ...domain.repositories import CommitteeRepository
from ..database.models import CommitteeModel, CommitteeStatusDB, CommitteeTypeDB


class CommitteeRepositoryImpl(CommitteeRepository):
    """SQLAlchemy implementation of CommitteeRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: CommitteeModel) -> Committee:
        """Convert database model to domain entity."""
        return Committee(
            id=model.id,
            committee_type=CommitteeType(model.committee_type.value),
            status=CommitteeStatus(model.status.value),
            scheduled_date=model.scheduled_date,
            actual_start_time=model.actual_start_time,
            actual_end_time=model.actual_end_time,
            location=model.location,
            is_virtual=model.is_virtual,
            virtual_meeting_link=model.virtual_meeting_link,
            training_center_id=model.training_center_id,
            agenda=model.agenda,
            minutes=model.minutes,
            minutes_approved_at=model.minutes_approved_at,
            minutes_approved_by=model.minutes_approved_by,
            created_by=model.created_by,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Committee) -> CommitteeModel:
        """Convert domain entity to database model."""
        return CommitteeModel(
            id=entity.id,
            committee_type=CommitteeTypeDB(entity.committee_type.value),
            status=CommitteeStatusDB(entity.status.value),
            scheduled_date=entity.scheduled_date,
            actual_start_time=entity.actual_start_time,
            actual_end_time=entity.actual_end_time,
            location=entity.location,
            is_virtual=entity.is_virtual,
            virtual_meeting_link=entity.virtual_meeting_link,
            training_center_id=entity.training_center_id,
            agenda=entity.agenda,
            minutes=entity.minutes,
            minutes_approved_at=entity.minutes_approved_at,
            minutes_approved_by=entity.minutes_approved_by,
            created_by=entity.created_by,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    async def create(self, committee: Committee) -> Committee:
        model = self._to_model(committee)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, committee_id: UUID) -> Optional[Committee]:
        result = await self.session.execute(
            select(CommitteeModel).where(CommitteeModel.id == committee_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, committee: Committee) -> Committee:
        result = await self.session.execute(
            select(CommitteeModel).where(CommitteeModel.id == committee.id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.committee_type = CommitteeTypeDB(committee.committee_type.value)
            model.status = CommitteeStatusDB(committee.status.value)
            model.scheduled_date = committee.scheduled_date
            model.actual_start_time = committee.actual_start_time
            model.actual_end_time = committee.actual_end_time
            model.location = committee.location
            model.is_virtual = committee.is_virtual
            model.virtual_meeting_link = committee.virtual_meeting_link
            model.agenda = committee.agenda
            model.minutes = committee.minutes
            model.minutes_approved_at = committee.minutes_approved_at
            model.minutes_approved_by = committee.minutes_approved_by
            await self.session.commit()
            await self.session.refresh(model)
            return self._to_entity(model)
        raise ValueError(f"Committee {committee.id} not found")

    async def delete(self, committee_id: UUID) -> bool:
        result = await self.session.execute(
            select(CommitteeModel).where(CommitteeModel.id == committee_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Committee]:
        result = await self.session.execute(
            select(CommitteeModel).offset(skip).limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_date_range(
        self, start_date: date, end_date: date
    ) -> list[Committee]:
        result = await self.session.execute(
            select(CommitteeModel).where(
                and_(
                    CommitteeModel.scheduled_date >= start_date,
                    CommitteeModel.scheduled_date <= end_date,
                )
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_type(self, committee_type: CommitteeType) -> list[Committee]:
        result = await self.session.execute(
            select(CommitteeModel).where(
                CommitteeModel.committee_type == CommitteeTypeDB(committee_type.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_status(self, status: CommitteeStatus) -> list[Committee]:
        result = await self.session.execute(
            select(CommitteeModel).where(
                CommitteeModel.status == CommitteeStatusDB(status.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_training_center(self, training_center_id: UUID) -> list[Committee]:
        result = await self.session.execute(
            select(CommitteeModel).where(
                CommitteeModel.training_center_id == training_center_id
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_monthly_for_date(
        self, year: int, month: int, training_center_id: UUID
    ) -> Optional[Committee]:
        result = await self.session.execute(
            select(CommitteeModel).where(
                and_(
                    extract("year", CommitteeModel.scheduled_date) == year,
                    extract("month", CommitteeModel.scheduled_date) == month,
                    CommitteeModel.training_center_id == training_center_id,
                    CommitteeModel.committee_type == CommitteeTypeDB.MONTHLY,
                )
            )
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_next_scheduled(self, training_center_id: UUID) -> Optional[Committee]:
        result = await self.session.execute(
            select(CommitteeModel)
            .where(
                and_(
                    CommitteeModel.training_center_id == training_center_id,
                    CommitteeModel.status == CommitteeStatusDB.SCHEDULED,
                    CommitteeModel.scheduled_date >= date.today(),
                )
            )
            .order_by(CommitteeModel.scheduled_date.asc())
            .limit(1)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None
