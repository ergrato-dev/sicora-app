"""
Committee decision repository implementation.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ...domain.entities import CommitteeDecision, DecisionType
from ...domain.repositories import CommitteeDecisionRepository
from ..database.models import CommitteeDecisionModel, DecisionTypeDB


class CommitteeDecisionRepositoryImpl(CommitteeDecisionRepository):
    """SQLAlchemy implementation of CommitteeDecisionRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: CommitteeDecisionModel) -> CommitteeDecision:
        return CommitteeDecision(
            id=model.id,
            committee_id=model.committee_id,
            student_case_id=model.student_case_id,
            decision_type=DecisionType(model.decision_type.value),
            votes_in_favor=model.votes_in_favor,
            votes_against=model.votes_against,
            abstentions=model.abstentions,
            is_unanimous=model.is_unanimous,
            rationale=model.rationale,
            conditions=model.conditions or [],
            follow_up_date=model.follow_up_date,
            notified_to_student=model.notified_to_student,
            notification_date=model.notification_date,
            notification_method=model.notification_method,
            student_acknowledgement=model.student_acknowledgement,
            acknowledgement_date=model.acknowledgement_date,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: CommitteeDecision) -> CommitteeDecisionModel:
        return CommitteeDecisionModel(
            id=entity.id,
            committee_id=entity.committee_id,
            student_case_id=entity.student_case_id,
            decision_type=DecisionTypeDB(entity.decision_type.value),
            votes_in_favor=entity.votes_in_favor,
            votes_against=entity.votes_against,
            abstentions=entity.abstentions,
            is_unanimous=entity.is_unanimous,
            rationale=entity.rationale,
            conditions=entity.conditions,
            follow_up_date=entity.follow_up_date,
            notified_to_student=entity.notified_to_student,
            notification_date=entity.notification_date,
            notification_method=entity.notification_method,
            student_acknowledgement=entity.student_acknowledgement,
            acknowledgement_date=entity.acknowledgement_date,
        )

    async def create(self, decision: CommitteeDecision) -> CommitteeDecision:
        model = self._to_model(decision)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, decision_id: UUID) -> Optional[CommitteeDecision]:
        result = await self.session.execute(
            select(CommitteeDecisionModel).where(
                CommitteeDecisionModel.id == decision_id
            )
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, decision: CommitteeDecision) -> CommitteeDecision:
        result = await self.session.execute(
            select(CommitteeDecisionModel).where(
                CommitteeDecisionModel.id == decision.id
            )
        )
        model = result.scalar_one_or_none()
        if model:
            model.decision_type = DecisionTypeDB(decision.decision_type.value)
            model.votes_in_favor = decision.votes_in_favor
            model.votes_against = decision.votes_against
            model.abstentions = decision.abstentions
            model.is_unanimous = decision.is_unanimous
            model.rationale = decision.rationale
            model.conditions = decision.conditions
            model.follow_up_date = decision.follow_up_date
            model.notified_to_student = decision.notified_to_student
            model.notification_date = decision.notification_date
            model.notification_method = decision.notification_method
            model.student_acknowledgement = decision.student_acknowledgement
            model.acknowledgement_date = decision.acknowledgement_date
            await self.session.commit()
            await self.session.refresh(model)
            return self._to_entity(model)
        raise ValueError(f"CommitteeDecision {decision.id} not found")

    async def delete(self, decision_id: UUID) -> bool:
        result = await self.session.execute(
            select(CommitteeDecisionModel).where(
                CommitteeDecisionModel.id == decision_id
            )
        )
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_by_committee(self, committee_id: UUID) -> list[CommitteeDecision]:
        result = await self.session.execute(
            select(CommitteeDecisionModel).where(
                CommitteeDecisionModel.committee_id == committee_id
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_student_case(
        self, student_case_id: UUID
    ) -> Optional[CommitteeDecision]:
        result = await self.session.execute(
            select(CommitteeDecisionModel).where(
                CommitteeDecisionModel.student_case_id == student_case_id
            )
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_unanimous_decisions(
        self, committee_id: UUID
    ) -> list[CommitteeDecision]:
        result = await self.session.execute(
            select(CommitteeDecisionModel).where(
                CommitteeDecisionModel.committee_id == committee_id,
                CommitteeDecisionModel.is_unanimous.is_(True),
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_approval_rate(self, committee_id: UUID) -> float:
        total = await self.session.execute(
            select(func.count(CommitteeDecisionModel.id)).where(
                CommitteeDecisionModel.committee_id == committee_id
            )
        )
        approved = await self.session.execute(
            select(func.count(CommitteeDecisionModel.id)).where(
                CommitteeDecisionModel.committee_id == committee_id,
                CommitteeDecisionModel.decision_type.in_(
                    [
                        DecisionTypeDB.IMPROVEMENT_PLAN,
                        DecisionTypeDB.CONDITIONAL,
                        DecisionTypeDB.ACQUITTAL,
                    ]
                ),
            )
        )
        total_count = total.scalar() or 0
        approved_count = approved.scalar() or 0
        return (approved_count / total_count * 100) if total_count > 0 else 0.0
