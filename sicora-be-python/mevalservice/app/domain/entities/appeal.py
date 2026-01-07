"""
Appeal entity for Monthly Evaluation Committee.

Represents appeals submitted by students against sanctions.
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class AdmissibilityStatus(str, Enum):
    """Status of appeal admissibility evaluation."""

    PENDING = "pending"  # Not yet evaluated
    ADMITTED = "admitted"  # Appeal admitted for review
    REJECTED = "rejected"  # Appeal rejected (not admissible)


class AppealDecision(str, Enum):
    """Final decision on the appeal."""

    PENDING = "pending"  # Not yet decided
    UPHELD = "upheld"  # Original sanction upheld
    MODIFIED = "modified"  # Sanction modified
    REVOKED = "revoked"  # Sanction revoked
    DISMISSED = "dismissed"  # Appeal dismissed


@dataclass
class SupportingDocument:
    """Supporting document for an appeal."""

    document_id: UUID = field(default_factory=uuid4)
    document_type: str = ""  # e.g., "evidence", "testimony", "certificate"
    file_name: str = ""
    file_url: str = ""
    description: str = ""
    uploaded_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Appeal:
    """
    Represents an appeal submitted against a sanction.

    Students can appeal sanctions within the deadline period.
    Appeals go through admissibility evaluation before final decision.
    """

    # Required fields first
    sanction_id: UUID
    student_id: UUID
    grounds: str  # Reasons for the appeal
    submission_date: date

    # Fields with defaults
    id: UUID = field(default_factory=uuid4)
    admissibility_status: AdmissibilityStatus = field(
        default=AdmissibilityStatus.PENDING
    )
    final_decision: AppealDecision = field(default=AppealDecision.PENDING)
    admissibility_notes: str = ""
    decision_justification: str = ""
    supporting_documents: list[SupportingDocument] = field(default_factory=list)
    committee_id: Optional[UUID] = None  # Appeals committee
    reviewed_by: Optional[UUID] = None
    admissibility_evaluated_at: Optional[datetime] = None
    decision_date: Optional[datetime] = None
    modified_sanction_details: str = ""  # If sanction is modified
    is_within_deadline: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def is_pending(self) -> bool:
        """Check if appeal is still pending."""
        return (
            self.admissibility_status == AdmissibilityStatus.PENDING
            or self.final_decision == AppealDecision.PENDING
        )

    def is_admitted(self) -> bool:
        """Check if appeal was admitted."""
        return self.admissibility_status == AdmissibilityStatus.ADMITTED

    def is_resolved(self) -> bool:
        """Check if appeal has a final decision."""
        return self.final_decision != AppealDecision.PENDING

    def was_successful(self) -> bool:
        """Check if appeal resulted in favorable outcome for student."""
        return self.final_decision in (AppealDecision.MODIFIED, AppealDecision.REVOKED)

    def admit(self, notes: str = "", reviewed_by: Optional[UUID] = None) -> None:
        """Admit the appeal for review."""
        self.admissibility_status = AdmissibilityStatus.ADMITTED
        self.admissibility_notes = notes
        self.admissibility_evaluated_at = datetime.utcnow()
        self.reviewed_by = reviewed_by
        self.updated_at = datetime.utcnow()

    def reject_admissibility(
        self, notes: str, reviewed_by: Optional[UUID] = None
    ) -> None:
        """Reject the appeal as inadmissible."""
        self.admissibility_status = AdmissibilityStatus.REJECTED
        self.admissibility_notes = notes
        self.admissibility_evaluated_at = datetime.utcnow()
        self.reviewed_by = reviewed_by
        self.final_decision = AppealDecision.DISMISSED
        self.decision_date = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def set_final_decision(
        self,
        decision: AppealDecision,
        justification: str,
        modified_details: str = "",
    ) -> None:
        """Set the final decision on the appeal."""
        if self.admissibility_status != AdmissibilityStatus.ADMITTED:
            raise ValueError("Can only decide on admitted appeals")

        self.final_decision = decision
        self.decision_justification = justification
        self.decision_date = datetime.utcnow()

        if decision == AppealDecision.MODIFIED:
            self.modified_sanction_details = modified_details

        self.updated_at = datetime.utcnow()

    def uphold_sanction(self, justification: str) -> None:
        """Uphold the original sanction."""
        self.set_final_decision(AppealDecision.UPHELD, justification)

    def modify_sanction(self, justification: str, modified_details: str) -> None:
        """Modify the original sanction."""
        self.set_final_decision(
            AppealDecision.MODIFIED, justification, modified_details
        )

    def revoke_sanction(self, justification: str) -> None:
        """Revoke the original sanction."""
        self.set_final_decision(AppealDecision.REVOKED, justification)

    def dismiss(self, justification: str) -> None:
        """Dismiss the appeal."""
        self.set_final_decision(AppealDecision.DISMISSED, justification)

    def add_supporting_document(self, document: SupportingDocument) -> None:
        """Add a supporting document to the appeal."""
        self.supporting_documents.append(document)
        self.updated_at = datetime.utcnow()

    def assign_to_committee(self, committee_id: UUID) -> None:
        """Assign appeal to an appeals committee."""
        self.committee_id = committee_id
        self.updated_at = datetime.utcnow()

    def get_document_count(self) -> int:
        """Get the number of supporting documents."""
        return len(self.supporting_documents)

    def get_days_since_submission(self) -> int:
        """Get days since appeal was submitted."""
        delta = date.today() - self.submission_date
        return delta.days

    def get_processing_days(self) -> Optional[int]:
        """Get days it took to process the appeal."""
        if self.decision_date:
            delta = self.decision_date.date() - self.submission_date
            return delta.days
        return None
