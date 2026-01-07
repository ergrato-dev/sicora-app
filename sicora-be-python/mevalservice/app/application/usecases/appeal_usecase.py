"""
Appeal use case - business logic for appeal management.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from ...domain.entities import (
    Appeal,
    AdmissibilityStatus,
    AppealDecision,
    SupportingDocument,
)
from ...domain.repositories import AppealRepository, SanctionRepository


class AppealUseCase:
    """Use case for appeal operations."""

    def __init__(
        self,
        appeal_repo: AppealRepository,
        sanction_repo: SanctionRepository,
    ):
        self.appeal_repo = appeal_repo
        self.sanction_repo = sanction_repo

    async def file_appeal(
        self,
        sanction_id: UUID,
        student_id: UUID,
        filed_by: UUID,
        grounds: str,
        supporting_documents: Optional[list[SupportingDocument]] = None,
    ) -> Appeal:
        """File a new appeal against a sanction."""
        # Verify sanction exists and is appealable
        sanction = await self.sanction_repo.get_by_id(sanction_id)
        if not sanction:
            raise ValueError(f"Sanction {sanction_id} not found")

        if not sanction.can_appeal():
            raise ValueError("Sanction is not appealable or deadline has passed")

        # Check if appeal already exists
        existing = await self.appeal_repo.get_by_sanction(sanction_id)
        if existing:
            raise ValueError("An appeal already exists for this sanction")

        appeal = Appeal(
            id=uuid4(),
            sanction_id=sanction_id,
            student_id=student_id,
            filed_by=filed_by,
            filing_date=datetime.now(),
            grounds=grounds,
            supporting_documents=supporting_documents or [],
            admissibility_status=AdmissibilityStatus.PENDING,
            decision=AppealDecision.PENDING,
        )
        return await self.appeal_repo.create(appeal)

    async def get_appeal(self, appeal_id: UUID) -> Optional[Appeal]:
        """Get appeal by ID."""
        return await self.appeal_repo.get_by_id(appeal_id)

    async def list_appeals(self, skip: int = 0, limit: int = 100) -> list[Appeal]:
        """List all appeals with pagination."""
        return await self.appeal_repo.get_all(skip, limit)

    async def get_student_appeals(self, student_id: UUID) -> list[Appeal]:
        """Get all appeals for a student."""
        return await self.appeal_repo.get_by_student(student_id)

    async def review_admissibility(
        self,
        appeal_id: UUID,
        status: str,
        reviewer_id: UUID,
        notes: Optional[str] = None,
    ) -> Appeal:
        """Review appeal admissibility."""
        appeal = await self.appeal_repo.get_by_id(appeal_id)
        if not appeal:
            raise ValueError(f"Appeal {appeal_id} not found")

        appeal.review_admissibility(
            AdmissibilityStatus(status),
            reviewer_id,
            notes,
        )
        return await self.appeal_repo.update(appeal)

    async def schedule_hearing(
        self,
        appeal_id: UUID,
        committee_id: UUID,
        hearing_date: datetime,
    ) -> Appeal:
        """Schedule appeal hearing with appeals committee."""
        appeal = await self.appeal_repo.get_by_id(appeal_id)
        if not appeal:
            raise ValueError(f"Appeal {appeal_id} not found")

        if appeal.admissibility_status != AdmissibilityStatus.ADMITTED:
            raise ValueError("Can only schedule hearing for admitted appeals")

        appeal.schedule_hearing(committee_id, hearing_date)
        return await self.appeal_repo.update(appeal)

    async def decide_appeal(
        self,
        appeal_id: UUID,
        decision: str,
        rationale: str,
        decided_by: UUID,
        new_sanction_id: Optional[UUID] = None,
    ) -> Appeal:
        """Record appeal decision."""
        appeal = await self.appeal_repo.get_by_id(appeal_id)
        if not appeal:
            raise ValueError(f"Appeal {appeal_id} not found")

        appeal.decide(
            AppealDecision(decision),
            rationale,
            decided_by,
            new_sanction_id,
        )

        # If appeal is upheld or revoked, deactivate original sanction
        if decision in [AppealDecision.UPHELD.value, AppealDecision.REVOKED.value]:
            sanction = await self.sanction_repo.get_by_id(appeal.sanction_id)
            if sanction:
                sanction.deactivate()
                await self.sanction_repo.update(sanction)

        return await self.appeal_repo.update(appeal)

    async def notify_student(self, appeal_id: UUID) -> Appeal:
        """Mark appeal decision as notified to student."""
        appeal = await self.appeal_repo.get_by_id(appeal_id)
        if not appeal:
            raise ValueError(f"Appeal {appeal_id} not found")

        appeal.notify_student()
        return await self.appeal_repo.update(appeal)

    async def add_supporting_document(
        self,
        appeal_id: UUID,
        document_type: str,
        file_path: str,
        description: Optional[str] = None,
    ) -> Appeal:
        """Add supporting document to appeal."""
        appeal = await self.appeal_repo.get_by_id(appeal_id)
        if not appeal:
            raise ValueError(f"Appeal {appeal_id} not found")

        if appeal.is_final:
            raise ValueError("Cannot add documents to finalized appeal")

        document = SupportingDocument(
            document_id=uuid4(),
            document_type=document_type,
            file_path=file_path,
            uploaded_at=datetime.now(),
            description=description,
        )
        appeal.add_document(document)
        return await self.appeal_repo.update(appeal)

    async def get_pending_appeals(self) -> list[Appeal]:
        """Get all pending appeals."""
        return await self.appeal_repo.get_pending_appeals()

    async def get_admitted_appeals(self) -> list[Appeal]:
        """Get all admitted appeals awaiting hearing."""
        return await self.appeal_repo.get_admitted_appeals()

    async def get_appeals_near_deadline(self, days: int = 3) -> list[Appeal]:
        """Get appeals near processing deadline."""
        return await self.appeal_repo.get_appeals_near_deadline(days)
