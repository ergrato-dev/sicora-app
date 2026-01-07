"""
Student case use case - business logic for student case management.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from ...domain.entities import (
    StudentCase,
    CaseStatus,
    CaseType,
    DetectionCriteria,
    EvidenceDocument,
)
from ...domain.repositories import StudentCaseRepository


class StudentCaseUseCase:
    """Use case for student case operations."""

    def __init__(self, case_repo: StudentCaseRepository):
        self.case_repo = case_repo

    def _generate_case_number(self) -> str:
        """Generate a unique case number."""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"CASE-{timestamp}-{uuid4().hex[:6].upper()}"

    async def create_case(
        self,
        student_id: UUID,
        program_id: UUID,
        case_type: str,
        description: str,
        reported_by: Optional[UUID] = None,
        is_auto_detected: bool = False,
        detection_criteria: Optional[DetectionCriteria] = None,
        priority_level: int = 3,
    ) -> StudentCase:
        """Create a new student case."""
        # Count previous cases for this student
        previous_cases = await self.case_repo.get_by_student(student_id)

        case = StudentCase(
            id=uuid4(),
            case_number=self._generate_case_number(),
            student_id=student_id,
            program_id=program_id,
            case_type=CaseType(case_type),
            status=CaseStatus.PENDING,
            description=description,
            is_auto_detected=is_auto_detected,
            detection_criteria=detection_criteria,
            detection_date=datetime.now() if is_auto_detected else None,
            reported_by=reported_by,
            priority_level=priority_level,
            previous_cases_count=len(previous_cases),
        )
        return await self.case_repo.create(case)

    async def get_case(self, case_id: UUID) -> Optional[StudentCase]:
        """Get case by ID."""
        return await self.case_repo.get_by_id(case_id)

    async def list_cases(self, skip: int = 0, limit: int = 100) -> list[StudentCase]:
        """List all cases with pagination."""
        return await self.case_repo.get_all(skip, limit)

    async def get_student_cases(self, student_id: UUID) -> list[StudentCase]:
        """Get all cases for a student."""
        return await self.case_repo.get_by_student(student_id)

    async def get_pending_cases(self) -> list[StudentCase]:
        """Get all pending cases."""
        return await self.case_repo.get_pending_cases()

    async def assign_to_committee(
        self, case_id: UUID, committee_id: UUID
    ) -> StudentCase:
        """Assign a case to a committee."""
        case = await self.case_repo.get_by_id(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        case.assign_to_committee(committee_id)
        return await self.case_repo.update(case)

    async def start_review(self, case_id: UUID) -> StudentCase:
        """Start reviewing a case."""
        case = await self.case_repo.get_by_id(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        if case.status != CaseStatus.PENDING:
            raise ValueError("Case must be PENDING to start review")

        case.status = CaseStatus.UNDER_REVIEW
        return await self.case_repo.update(case)

    async def start_deliberation(self, case_id: UUID) -> StudentCase:
        """Start deliberation on a case."""
        case = await self.case_repo.get_by_id(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        if case.status != CaseStatus.ASSIGNED_TO_COMMITTEE:
            raise ValueError("Case must be ASSIGNED_TO_COMMITTEE for deliberation")

        case.status = CaseStatus.IN_DELIBERATION
        return await self.case_repo.update(case)

    async def mark_decided(self, case_id: UUID) -> StudentCase:
        """Mark a case as decided."""
        case = await self.case_repo.get_by_id(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        case.status = CaseStatus.DECIDED
        return await self.case_repo.update(case)

    async def mark_appealed(self, case_id: UUID) -> StudentCase:
        """Mark a case as appealed."""
        case = await self.case_repo.get_by_id(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        case.status = CaseStatus.APPEALED
        return await self.case_repo.update(case)

    async def close_case(self, case_id: UUID) -> StudentCase:
        """Close a case."""
        case = await self.case_repo.get_by_id(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        case.close()
        return await self.case_repo.update(case)

    async def archive_case(self, case_id: UUID) -> StudentCase:
        """Archive a closed case."""
        case = await self.case_repo.get_by_id(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        if case.status != CaseStatus.CLOSED:
            raise ValueError("Can only archive closed cases")

        case.status = CaseStatus.ARCHIVED
        return await self.case_repo.update(case)

    async def add_evidence(
        self,
        case_id: UUID,
        document_type: str,
        file_path: str,
        uploaded_by: UUID,
        description: Optional[str] = None,
    ) -> StudentCase:
        """Add evidence document to a case."""
        case = await self.case_repo.get_by_id(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        evidence = EvidenceDocument(
            document_id=uuid4(),
            document_type=document_type,
            file_path=file_path,
            uploaded_by=uploaded_by,
            uploaded_at=datetime.now(),
            description=description,
        )
        case.add_evidence(evidence)
        return await self.case_repo.update(case)

    async def get_auto_detected_cases(self) -> list[StudentCase]:
        """Get all auto-detected cases."""
        return await self.case_repo.get_auto_detected_cases()

    async def get_cases_by_program(self, program_id: UUID) -> list[StudentCase]:
        """Get cases by program."""
        return await self.case_repo.get_by_program(program_id)
