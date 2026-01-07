"""
StudentCase entity for Monthly Evaluation Committee.

Represents cases of students brought to the committee for review,
including recognitions, improvement needs, and potential sanctions.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class CaseType(str, Enum):
    """Types of student cases."""

    RECOGNITION = "recognition"  # Outstanding achievement
    IMPROVEMENT_PLAN = "improvement_plan"  # Needs improvement
    SANCTION = "sanction"  # Potential sanction
    APPEAL = "appeal"  # Appeal of previous decision
    FOLLOW_UP = "follow_up"  # Follow-up on previous case


class CaseStatus(str, Enum):
    """Status of a student case."""

    DETECTED = "detected"  # Auto-detected by system
    PENDING = "pending"  # Waiting for committee review
    IN_REVIEW = "in_review"  # Being reviewed by committee
    RESOLVED = "resolved"  # Decision made
    CLOSED = "closed"  # Case closed
    REOPENED = "reopened"  # Reopened for reconsideration


@dataclass
class DetectionCriteria:
    """Criteria that triggered case detection."""

    criteria_type: str  # e.g., "attendance", "academic", "behavior"
    threshold_value: float
    actual_value: float
    description: str
    detected_at: datetime = field(default_factory=datetime.utcnow)

    def is_threshold_exceeded(self) -> bool:
        """Check if actual value exceeds threshold."""
        return self.actual_value > self.threshold_value

    def get_deviation_percentage(self) -> float:
        """Calculate deviation from threshold."""
        if self.threshold_value == 0:
            return 0.0
        return ((self.actual_value - self.threshold_value) / self.threshold_value) * 100


@dataclass
class EvidenceDocument:
    """Evidence document attached to a case."""

    document_id: UUID = field(default_factory=uuid4)
    document_type: str = ""  # e.g., "report", "attendance_record", "complaint"
    file_name: str = ""
    file_url: str = ""
    description: str = ""
    uploaded_by: Optional[UUID] = None
    uploaded_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class StudentCase:
    """
    Represents a student case to be reviewed by the committee.

    Cases can be auto-detected by the system based on criteria or
    manually created by coordinators/instructors.
    """

    # Required fields first
    student_id: UUID
    case_type: CaseType
    title: str
    description: str

    # Fields with defaults
    id: UUID = field(default_factory=uuid4)
    committee_id: Optional[UUID] = None
    case_status: CaseStatus = field(default=CaseStatus.PENDING)
    priority: int = 1  # 1=low, 2=medium, 3=high
    is_auto_detected: bool = False
    detection_criteria: list[DetectionCriteria] = field(default_factory=list)
    evidence_documents: list[EvidenceDocument] = field(default_factory=list)
    reporter_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    program_id: Optional[UUID] = None
    academic_period: str = ""
    notes: str = ""
    resolution: str = ""
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[UUID] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def is_recognition_case(self) -> bool:
        """Check if this is a recognition case."""
        return self.case_type == CaseType.RECOGNITION

    def is_sanction_case(self) -> bool:
        """Check if this is a sanction case."""
        return self.case_type == CaseType.SANCTION

    def is_improvement_case(self) -> bool:
        """Check if this is an improvement plan case."""
        return self.case_type == CaseType.IMPROVEMENT_PLAN

    def is_appeal_case(self) -> bool:
        """Check if this is an appeal case."""
        return self.case_type == CaseType.APPEAL

    def is_pending(self) -> bool:
        """Check if case is pending review."""
        return self.case_status == CaseStatus.PENDING

    def is_resolved(self) -> bool:
        """Check if case has been resolved."""
        return self.case_status == CaseStatus.RESOLVED

    def add_evidence_document(self, document: EvidenceDocument) -> None:
        """Add an evidence document to the case."""
        self.evidence_documents.append(document)
        self.updated_at = datetime.utcnow()

    def add_detection_criteria(self, criteria: DetectionCriteria) -> None:
        """Add detection criteria to the case."""
        self.detection_criteria.append(criteria)
        self.is_auto_detected = True
        self.updated_at = datetime.utcnow()

    def assign_to_committee(self, committee_id: UUID) -> None:
        """Assign this case to a committee for review."""
        self.committee_id = committee_id
        self.case_status = CaseStatus.IN_REVIEW
        self.updated_at = datetime.utcnow()

    def start_review(self) -> None:
        """Mark case as being reviewed."""
        self.case_status = CaseStatus.IN_REVIEW
        self.updated_at = datetime.utcnow()

    def resolve(self, resolution: str, resolved_by: UUID) -> None:
        """Resolve the case with a resolution."""
        self.case_status = CaseStatus.RESOLVED
        self.resolution = resolution
        self.resolved_at = datetime.utcnow()
        self.resolved_by = resolved_by
        self.updated_at = datetime.utcnow()

    def close(self) -> None:
        """Close the case."""
        self.case_status = CaseStatus.CLOSED
        self.updated_at = datetime.utcnow()

    def reopen(self, reason: str) -> None:
        """Reopen a closed case."""
        if self.case_status not in (CaseStatus.RESOLVED, CaseStatus.CLOSED):
            raise ValueError("Can only reopen resolved or closed cases")
        self.case_status = CaseStatus.REOPENED
        self.notes = f"Reopened: {reason}\n{self.notes}"
        self.updated_at = datetime.utcnow()

    def set_priority(self, priority: int) -> None:
        """Set case priority (1-3)."""
        if priority not in (1, 2, 3):
            raise ValueError("Priority must be 1, 2, or 3")
        self.priority = priority
        self.updated_at = datetime.utcnow()

    def get_evidence_count(self) -> int:
        """Get the number of evidence documents."""
        return len(self.evidence_documents)

    def has_sufficient_evidence(self, minimum: int = 1) -> bool:
        """Check if case has sufficient evidence."""
        return self.get_evidence_count() >= minimum
