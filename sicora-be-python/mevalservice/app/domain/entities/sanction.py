"""
Sanction entity for Monthly Evaluation Committee.

Represents sanctions applied to students according to
Acuerdo OneVision 009/2024 (7 severity levels).
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class SanctionType(str, Enum):
    """Types of sanctions according to Acuerdo 009/2024."""

    VERBAL_WARNING = "verbal_warning"  # Level 1
    WRITTEN_WARNING = "written_warning"  # Level 2
    ACADEMIC_COMMITMENT = "academic_commitment"  # Level 3
    IMPROVEMENT_PLAN = "improvement_plan"  # Level 4
    CONDITIONAL_ENROLLMENT = "conditional_enrollment"  # Level 5
    TEMPORARY_SUSPENSION = "temporary_suspension"  # Level 6
    DEFINITIVE_CANCELLATION = "definitive_cancellation"  # Level 7


class SeverityLevel(int, Enum):
    """Severity levels (1-7)."""

    LEVEL_1 = 1  # Verbal warning
    LEVEL_2 = 2  # Written warning
    LEVEL_3 = 3  # Academic commitment
    LEVEL_4 = 4  # Improvement plan
    LEVEL_5 = 5  # Conditional enrollment
    LEVEL_6 = 6  # Temporary suspension
    LEVEL_7 = 7  # Definitive cancellation


class ComplianceStatus(str, Enum):
    """Status of sanction compliance."""

    PENDING = "pending"  # Not yet started
    IN_PROGRESS = "in_progress"  # Being complied
    COMPLETED = "completed"  # Successfully completed
    FAILED = "failed"  # Failed to comply
    APPEALED = "appealed"  # Under appeal


# Mapping of sanction type to severity level
SANCTION_SEVERITY_MAP = {
    SanctionType.VERBAL_WARNING: SeverityLevel.LEVEL_1,
    SanctionType.WRITTEN_WARNING: SeverityLevel.LEVEL_2,
    SanctionType.ACADEMIC_COMMITMENT: SeverityLevel.LEVEL_3,
    SanctionType.IMPROVEMENT_PLAN: SeverityLevel.LEVEL_4,
    SanctionType.CONDITIONAL_ENROLLMENT: SeverityLevel.LEVEL_5,
    SanctionType.TEMPORARY_SUSPENSION: SeverityLevel.LEVEL_6,
    SanctionType.DEFINITIVE_CANCELLATION: SeverityLevel.LEVEL_7,
}

# Appeal deadlines by severity (in days)
APPEAL_DEADLINE_DAYS = {
    SeverityLevel.LEVEL_1: 3,
    SeverityLevel.LEVEL_2: 5,
    SeverityLevel.LEVEL_3: 5,
    SeverityLevel.LEVEL_4: 5,
    SeverityLevel.LEVEL_5: 10,
    SeverityLevel.LEVEL_6: 10,
    SeverityLevel.LEVEL_7: 15,
}


@dataclass
class Sanction:
    """
    Represents a sanction applied to a student.

    Sanctions follow the 7-level system defined in Acuerdo 009/2024.
    """

    # Required fields first
    student_id: UUID
    student_case_id: UUID
    committee_decision_id: UUID
    sanction_type: SanctionType
    reason: str
    effective_date: date

    # Fields with defaults
    id: UUID = field(default_factory=uuid4)
    severity_level: SeverityLevel = field(default=SeverityLevel.LEVEL_1)
    compliance_status: ComplianceStatus = field(default=ComplianceStatus.PENDING)
    description: str = ""
    duration_days: Optional[int] = None
    end_date: Optional[date] = None
    appeal_deadline: Optional[date] = None
    is_appealable: bool = True
    was_appealed: bool = False
    appeal_id: Optional[UUID] = None
    compliance_notes: str = ""
    applied_by: Optional[UUID] = None
    completed_at: Optional[datetime] = None
    previous_sanction_id: Optional[UUID] = None  # For tracking recidivism
    program_id: Optional[UUID] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self) -> None:
        """Set severity level and appeal deadline based on sanction type."""
        self.severity_level = SANCTION_SEVERITY_MAP.get(
            self.sanction_type, SeverityLevel.LEVEL_1
        )
        self._calculate_appeal_deadline()

    def _calculate_appeal_deadline(self) -> None:
        """Calculate appeal deadline based on severity level."""
        days = APPEAL_DEADLINE_DAYS.get(self.severity_level, 5)
        from datetime import timedelta

        self.appeal_deadline = self.effective_date + timedelta(days=days)

    def is_active(self) -> bool:
        """Check if sanction is currently active."""
        return self.compliance_status in (
            ComplianceStatus.PENDING,
            ComplianceStatus.IN_PROGRESS,
        )

    def is_completed(self) -> bool:
        """Check if sanction has been completed."""
        return self.compliance_status == ComplianceStatus.COMPLETED

    def can_be_appealed(self) -> bool:
        """Check if sanction can still be appealed."""
        if not self.is_appealable or self.was_appealed:
            return False
        if self.appeal_deadline:
            return date.today() <= self.appeal_deadline
        return False

    def get_days_until_appeal_deadline(self) -> int:
        """Get days remaining to appeal."""
        if not self.appeal_deadline:
            return 0
        delta = self.appeal_deadline - date.today()
        return max(delta.days, 0)

    def is_severe(self) -> bool:
        """Check if this is a severe sanction (level 5+)."""
        return self.severity_level.value >= 5

    def is_final(self) -> bool:
        """Check if this is a final/definitive sanction."""
        return self.sanction_type == SanctionType.DEFINITIVE_CANCELLATION

    def get_severity_description(self) -> str:
        """Get human-readable severity description."""
        descriptions = {
            SeverityLevel.LEVEL_1: "Amonestación Verbal",
            SeverityLevel.LEVEL_2: "Amonestación Escrita",
            SeverityLevel.LEVEL_3: "Compromiso Académico",
            SeverityLevel.LEVEL_4: "Plan de Mejoramiento",
            SeverityLevel.LEVEL_5: "Matrícula Condicional",
            SeverityLevel.LEVEL_6: "Suspensión Temporal",
            SeverityLevel.LEVEL_7: "Cancelación Definitiva",
        }
        return descriptions.get(self.severity_level, "Desconocido")

    def mark_as_appealed(self, appeal_id: UUID) -> None:
        """Mark sanction as under appeal."""
        self.was_appealed = True
        self.appeal_id = appeal_id
        self.compliance_status = ComplianceStatus.APPEALED
        self.updated_at = datetime.utcnow()

    def start_compliance(self) -> None:
        """Start the compliance period."""
        self.compliance_status = ComplianceStatus.IN_PROGRESS
        self.updated_at = datetime.utcnow()

    def complete_compliance(self, notes: str = "") -> None:
        """Mark sanction as completed."""
        self.compliance_status = ComplianceStatus.COMPLETED
        self.compliance_notes = notes
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def fail_compliance(self, notes: str = "") -> None:
        """Mark compliance as failed."""
        self.compliance_status = ComplianceStatus.FAILED
        self.compliance_notes = notes
        self.updated_at = datetime.utcnow()

    def calculate_end_date(self) -> Optional[date]:
        """Calculate end date based on duration."""
        if self.duration_days:
            from datetime import timedelta

            self.end_date = self.effective_date + timedelta(days=self.duration_days)
        return self.end_date

    def is_expired(self) -> bool:
        """Check if sanction period has expired."""
        if self.end_date:
            return date.today() > self.end_date
        return False

    @staticmethod
    def get_escalated_sanction_type(
        current_type: SanctionType,
    ) -> Optional[SanctionType]:
        """Get the next severity level sanction type for escalation."""
        escalation_map = {
            SanctionType.VERBAL_WARNING: SanctionType.WRITTEN_WARNING,
            SanctionType.WRITTEN_WARNING: SanctionType.ACADEMIC_COMMITMENT,
            SanctionType.ACADEMIC_COMMITMENT: SanctionType.IMPROVEMENT_PLAN,
            SanctionType.IMPROVEMENT_PLAN: SanctionType.CONDITIONAL_ENROLLMENT,
            SanctionType.CONDITIONAL_ENROLLMENT: SanctionType.TEMPORARY_SUSPENSION,
            SanctionType.TEMPORARY_SUSPENSION: SanctionType.DEFINITIVE_CANCELLATION,
        }
        return escalation_map.get(current_type)
