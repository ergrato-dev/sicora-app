"""
Student case repository implementation.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...domain.entities import (
    StudentCase,
    CaseStatus,
    CaseType,
    DetectionCriteria,
    EvidenceDocument,
)
from ...domain.repositories import StudentCaseRepository
from ..database.models import StudentCaseModel, CaseStatusDB, CaseTypeDB


class StudentCaseRepositoryImpl(StudentCaseRepository):
    """SQLAlchemy implementation of StudentCaseRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: StudentCaseModel) -> StudentCase:
        detection = None
        if model.detection_criteria:
            dc = model.detection_criteria
            detection = DetectionCriteria(
                criterion_type=dc.get("criterion_type", ""),
                threshold_value=dc.get("threshold_value", 0.0),
                actual_value=dc.get("actual_value", 0.0),
                period_start=dc.get("period_start"),
                period_end=dc.get("period_end"),
            )

        evidence = []
        if model.evidence_documents:
            for doc in model.evidence_documents:
                evidence.append(
                    EvidenceDocument(
                        document_id=UUID(doc["document_id"])
                        if doc.get("document_id")
                        else None,
                        document_type=doc.get("document_type", ""),
                        file_path=doc.get("file_path", ""),
                        uploaded_by=UUID(doc["uploaded_by"])
                        if doc.get("uploaded_by")
                        else None,
                        uploaded_at=doc.get("uploaded_at"),
                        description=doc.get("description"),
                    )
                )

        return StudentCase(
            id=model.id,
            case_number=model.case_number,
            student_id=model.student_id,
            program_id=model.program_id,
            case_type=CaseType(model.case_type.value),
            status=CaseStatus(model.status.value),
            description=model.description,
            is_auto_detected=model.is_auto_detected,
            detection_criteria=detection,
            detection_date=model.detection_date,
            reported_by=model.reported_by,
            evidence_documents=evidence,
            committee_id=model.committee_id,
            priority_level=model.priority_level,
            previous_cases_count=model.previous_cases_count,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: StudentCase) -> StudentCaseModel:
        detection_dict = None
        if entity.detection_criteria:
            detection_dict = {
                "criterion_type": entity.detection_criteria.criterion_type,
                "threshold_value": entity.detection_criteria.threshold_value,
                "actual_value": entity.detection_criteria.actual_value,
                "period_start": str(entity.detection_criteria.period_start)
                if entity.detection_criteria.period_start
                else None,
                "period_end": str(entity.detection_criteria.period_end)
                if entity.detection_criteria.period_end
                else None,
            }

        evidence_list = []
        for doc in entity.evidence_documents:
            evidence_list.append(
                {
                    "document_id": str(doc.document_id) if doc.document_id else None,
                    "document_type": doc.document_type,
                    "file_path": doc.file_path,
                    "uploaded_by": str(doc.uploaded_by) if doc.uploaded_by else None,
                    "uploaded_at": str(doc.uploaded_at) if doc.uploaded_at else None,
                    "description": doc.description,
                }
            )

        return StudentCaseModel(
            id=entity.id,
            case_number=entity.case_number,
            student_id=entity.student_id,
            program_id=entity.program_id,
            case_type=CaseTypeDB(entity.case_type.value),
            status=CaseStatusDB(entity.status.value),
            description=entity.description,
            is_auto_detected=entity.is_auto_detected,
            detection_criteria=detection_dict,
            detection_date=entity.detection_date,
            reported_by=entity.reported_by,
            evidence_documents=evidence_list,
            committee_id=entity.committee_id,
            priority_level=entity.priority_level,
            previous_cases_count=entity.previous_cases_count,
        )

    async def create(self, case: StudentCase) -> StudentCase:
        model = self._to_model(case)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, case_id: UUID) -> Optional[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).where(StudentCaseModel.id == case_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, case: StudentCase) -> StudentCase:
        result = await self.session.execute(
            select(StudentCaseModel).where(StudentCaseModel.id == case.id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.case_type = CaseTypeDB(case.case_type.value)
            model.status = CaseStatusDB(case.status.value)
            model.description = case.description
            model.committee_id = case.committee_id
            model.priority_level = case.priority_level
            await self.session.commit()
            await self.session.refresh(model)
            return self._to_entity(model)
        raise ValueError(f"StudentCase {case.id} not found")

    async def delete(self, case_id: UUID) -> bool:
        result = await self.session.execute(
            select(StudentCaseModel).where(StudentCaseModel.id == case_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).offset(skip).limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_student(self, student_id: UUID) -> list[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).where(StudentCaseModel.student_id == student_id)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_committee(self, committee_id: UUID) -> list[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).where(
                StudentCaseModel.committee_id == committee_id
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_status(self, status: CaseStatus) -> list[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).where(
                StudentCaseModel.status == CaseStatusDB(status.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_type(self, case_type: CaseType) -> list[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).where(
                StudentCaseModel.case_type == CaseTypeDB(case_type.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_pending_cases(self) -> list[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).where(
                StudentCaseModel.status == CaseStatusDB.PENDING
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_auto_detected_cases(self) -> list[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).where(StudentCaseModel.is_auto_detected.is_(True))
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_program(self, program_id: UUID) -> list[StudentCase]:
        result = await self.session.execute(
            select(StudentCaseModel).where(StudentCaseModel.program_id == program_id)
        )
        return [self._to_entity(m) for m in result.scalars().all()]
