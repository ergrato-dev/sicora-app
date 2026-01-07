"""
Sanction use case - business logic for sanction management.
"""

from datetime import date, timedelta
from typing import Optional
from uuid import UUID, uuid4

from ...domain.entities import Sanction, SanctionType, SeverityLevel, ComplianceStatus
from ...domain.repositories import SanctionRepository


class SanctionUseCase:
    """Use case for sanction operations."""

    # Appeal deadline in business days per regulation
    APPEAL_DEADLINE_DAYS = 5

    def __init__(self, sanction_repo: SanctionRepository):
        self.sanction_repo = sanction_repo

    def _calculate_appeal_deadline(self, effective_date: date) -> date:
        """Calculate appeal deadline (5 business days)."""
        deadline = effective_date
        days_added = 0
        while days_added < self.APPEAL_DEADLINE_DAYS:
            deadline += timedelta(days=1)
            # Skip weekends
            if deadline.weekday() < 5:
                days_added += 1
        return deadline

    async def create_sanction(
        self,
        student_case_id: UUID,
        student_id: UUID,
        sanction_type: str,
        severity_level: str,
        description: str,
        legal_basis: str,
        effective_date: date,
        imposed_by: UUID,
        end_date: Optional[date] = None,
        conditions: Optional[list[str]] = None,
        is_appealable: bool = True,
    ) -> Sanction:
        """Create a new sanction."""
        # Calculate recidivism factor
        previous_count = await self.sanction_repo.get_recidivism_count(student_id)
        recidivism_factor = 1.0 + (previous_count * 0.25)  # +25% per previous sanction

        sanction = Sanction(
            id=uuid4(),
            student_case_id=student_case_id,
            student_id=student_id,
            sanction_type=SanctionType(sanction_type),
            severity_level=SeverityLevel(severity_level),
            compliance_status=ComplianceStatus.NOT_STARTED,
            description=description,
            legal_basis=legal_basis,
            effective_date=effective_date,
            end_date=end_date,
            is_appealable=is_appealable,
            appeal_deadline=self._calculate_appeal_deadline(effective_date)
            if is_appealable
            else None,
            imposed_by=imposed_by,
            conditions=conditions or [],
            recidivism_factor=recidivism_factor,
        )
        return await self.sanction_repo.create(sanction)

    async def get_sanction(self, sanction_id: UUID) -> Optional[Sanction]:
        """Get sanction by ID."""
        return await self.sanction_repo.get_by_id(sanction_id)

    async def list_sanctions(self, skip: int = 0, limit: int = 100) -> list[Sanction]:
        """List all sanctions with pagination."""
        return await self.sanction_repo.get_all(skip, limit)

    async def get_student_sanctions(self, student_id: UUID) -> list[Sanction]:
        """Get all sanctions for a student."""
        return await self.sanction_repo.get_by_student(student_id)

    async def notify_student(self, sanction_id: UUID) -> Sanction:
        """Mark sanction as notified to student."""
        sanction = await self.sanction_repo.get_by_id(sanction_id)
        if not sanction:
            raise ValueError(f"Sanction {sanction_id} not found")

        sanction.notify_student()
        return await self.sanction_repo.update(sanction)

    async def notify_parent(self, sanction_id: UUID) -> Sanction:
        """Mark sanction as notified to parent."""
        sanction = await self.sanction_repo.get_by_id(sanction_id)
        if not sanction:
            raise ValueError(f"Sanction {sanction_id} not found")

        sanction.notify_parent()
        return await self.sanction_repo.update(sanction)

    async def update_compliance(
        self,
        sanction_id: UUID,
        status: str,
        notes: Optional[str] = None,
    ) -> Sanction:
        """Update compliance status."""
        sanction = await self.sanction_repo.get_by_id(sanction_id)
        if not sanction:
            raise ValueError(f"Sanction {sanction_id} not found")

        sanction.update_compliance(ComplianceStatus(status), notes)
        return await self.sanction_repo.update(sanction)

    async def deactivate_sanction(self, sanction_id: UUID) -> Sanction:
        """Deactivate a sanction."""
        sanction = await self.sanction_repo.get_by_id(sanction_id)
        if not sanction:
            raise ValueError(f"Sanction {sanction_id} not found")

        sanction.deactivate()
        return await self.sanction_repo.update(sanction)

    async def get_active_sanctions(self) -> list[Sanction]:
        """Get all active sanctions."""
        return await self.sanction_repo.get_active_sanctions()

    async def get_appealable_sanctions(self) -> list[Sanction]:
        """Get sanctions that can still be appealed."""
        return await self.sanction_repo.get_appealable_sanctions()

    async def get_expiring_soon(self, days: int = 7) -> list[Sanction]:
        """Get sanctions expiring within specified days."""
        return await self.sanction_repo.get_expiring_soon(days)

    async def check_can_appeal(self, sanction_id: UUID) -> bool:
        """Check if a sanction can still be appealed."""
        sanction = await self.sanction_repo.get_by_id(sanction_id)
        if not sanction:
            return False
        return sanction.can_appeal()

    async def get_recidivism_count(self, student_id: UUID) -> int:
        """Get number of previous sanctions for a student."""
        return await self.sanction_repo.get_recidivism_count(student_id)
