"""
Appeal repository implementation.
"""

from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ...domain.entities import (
    Appeal,
    AdmissibilityStatus,
    AppealDecision,
    SupportingDocument,
)
from ...domain.repositories import AppealRepository
from ..database.models import AppealModel, AdmissibilityStatusDB, AppealDecisionDB


class AppealRepositoryImpl(AppealRepository):
    """SQLAlchemy implementation of AppealRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: AppealModel) -> Appeal:
        documents = []
        if model.supporting_documents:
            for doc in model.supporting_documents:
                documents.append(
                    SupportingDocument(
                        document_id=UUID(doc["document_id"])
                        if doc.get("document_id")
                        else None,
                        document_type=doc.get("document_type", ""),
                        file_path=doc.get("file_path", ""),
                        uploaded_at=doc.get("uploaded_at"),
                        description=doc.get("description"),
                    )
                )

        return Appeal(
            id=model.id,
            sanction_id=model.sanction_id,
            student_id=model.student_id,
            filed_by=model.filed_by,
            filing_date=model.filing_date,
            grounds=model.grounds,
            supporting_documents=documents,
            admissibility_status=AdmissibilityStatus(model.admissibility_status.value),
            admissibility_reviewer=model.admissibility_reviewer,
            admissibility_date=model.admissibility_date,
            admissibility_notes=model.admissibility_notes,
            appeal_committee_id=model.appeal_committee_id,
            hearing_date=model.hearing_date,
            decision=AppealDecision(model.decision.value),
            decision_rationale=model.decision_rationale,
            decision_date=model.decision_date,
            decided_by=model.decided_by,
            new_sanction_id=model.new_sanction_id,
            is_final=model.is_final,
            student_notified=model.student_notified,
            notification_date=model.notification_date,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Appeal) -> AppealModel:
        documents_list = [
            {
                "document_id": str(doc.document_id) if doc.document_id else None,
                "document_type": doc.document_type,
                "file_path": doc.file_path,
                "uploaded_at": str(doc.uploaded_at) if doc.uploaded_at else None,
                "description": doc.description,
            }
            for doc in entity.supporting_documents
        ]

        return AppealModel(
            id=entity.id,
            sanction_id=entity.sanction_id,
            student_id=entity.student_id,
            filed_by=entity.filed_by,
            filing_date=entity.filing_date,
            grounds=entity.grounds,
            supporting_documents=documents_list,
            admissibility_status=AdmissibilityStatusDB(
                entity.admissibility_status.value
            ),
            admissibility_reviewer=entity.admissibility_reviewer,
            admissibility_date=entity.admissibility_date,
            admissibility_notes=entity.admissibility_notes,
            appeal_committee_id=entity.appeal_committee_id,
            hearing_date=entity.hearing_date,
            decision=AppealDecisionDB(entity.decision.value),
            decision_rationale=entity.decision_rationale,
            decision_date=entity.decision_date,
            decided_by=entity.decided_by,
            new_sanction_id=entity.new_sanction_id,
            is_final=entity.is_final,
            student_notified=entity.student_notified,
            notification_date=entity.notification_date,
        )

    async def create(self, appeal: Appeal) -> Appeal:
        model = self._to_model(appeal)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, appeal_id: UUID) -> Optional[Appeal]:
        result = await self.session.execute(
            select(AppealModel).where(AppealModel.id == appeal_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, appeal: Appeal) -> Appeal:
        result = await self.session.execute(
            select(AppealModel).where(AppealModel.id == appeal.id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.admissibility_status = AdmissibilityStatusDB(
                appeal.admissibility_status.value
            )
            model.admissibility_reviewer = appeal.admissibility_reviewer
            model.admissibility_date = appeal.admissibility_date
            model.admissibility_notes = appeal.admissibility_notes
            model.appeal_committee_id = appeal.appeal_committee_id
            model.hearing_date = appeal.hearing_date
            model.decision = AppealDecisionDB(appeal.decision.value)
            model.decision_rationale = appeal.decision_rationale
            model.decision_date = appeal.decision_date
            model.decided_by = appeal.decided_by
            model.new_sanction_id = appeal.new_sanction_id
            model.is_final = appeal.is_final
            model.student_notified = appeal.student_notified
            model.notification_date = appeal.notification_date
            await self.session.commit()
            await self.session.refresh(model)
            return self._to_entity(model)
        raise ValueError(f"Appeal {appeal.id} not found")

    async def delete(self, appeal_id: UUID) -> bool:
        result = await self.session.execute(
            select(AppealModel).where(AppealModel.id == appeal_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Appeal]:
        result = await self.session.execute(
            select(AppealModel).offset(skip).limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_sanction(self, sanction_id: UUID) -> Optional[Appeal]:
        result = await self.session.execute(
            select(AppealModel).where(AppealModel.sanction_id == sanction_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_student(self, student_id: UUID) -> list[Appeal]:
        result = await self.session.execute(
            select(AppealModel).where(AppealModel.student_id == student_id)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_admissibility_status(
        self, status: AdmissibilityStatus
    ) -> list[Appeal]:
        result = await self.session.execute(
            select(AppealModel).where(
                AppealModel.admissibility_status == AdmissibilityStatusDB(status.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_decision(self, decision: AppealDecision) -> list[Appeal]:
        result = await self.session.execute(
            select(AppealModel).where(
                AppealModel.decision == AppealDecisionDB(decision.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_pending_appeals(self) -> list[Appeal]:
        result = await self.session.execute(
            select(AppealModel).where(AppealModel.decision == AppealDecisionDB.PENDING)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_admitted_appeals(self) -> list[Appeal]:
        result = await self.session.execute(
            select(AppealModel).where(
                AppealModel.admissibility_status == AdmissibilityStatusDB.ADMITTED
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_appeals_near_deadline(self, days_threshold: int = 3) -> list[Appeal]:
        threshold_date = date.today() + timedelta(days=days_threshold)
        result = await self.session.execute(
            select(AppealModel).where(
                and_(
                    AppealModel.decision == AppealDecisionDB.PENDING,
                    AppealModel.hearing_date.isnot(None),
                    AppealModel.hearing_date <= threshold_date,
                )
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]
