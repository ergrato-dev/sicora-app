"""
CommitteeDecision entity for Monthly Evaluation Committee.

Represents decisions made by the committee on student cases.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class DecisionType(str, Enum):
    """Types of committee decisions."""

    RECOGNITION = "recognition"  # Academic recognition
    IMPROVEMENT_PLAN = "improvement_plan"  # Assign improvement plan
    SANCTION = "sanction"  # Apply sanction
    DISMISSAL = "dismissal"  # Case dismissed
    POSTPONED = "postponed"  # Decision postponed
    APPEAL_ACCEPTED = "appeal_accepted"  # Appeal accepted
    APPEAL_REJECTED = "appeal_rejected"  # Appeal rejected


@dataclass
class CommitteeDecision:
    """
    Represents a decision made by the committee for a student case.

    Tracks voting results and the final resolution.
    """

    # Required fields first
    committee_id: UUID
    student_case_id: UUID
    decision_type: DecisionType

    # Fields with defaults
    id: UUID = field(default_factory=uuid4)
    votes_for: int = 0
    votes_against: int = 0
    votes_abstain: int = 0
    is_unanimous: bool = False
    justification: str = ""
    recommendations: str = ""
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    decided_at: datetime = field(default_factory=datetime.utcnow)
    decided_by: Optional[UUID] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def get_total_votes(self) -> int:
        """Get total number of votes cast."""
        return self.votes_for + self.votes_against + self.votes_abstain

    def is_approved(self) -> bool:
        """Check if the decision was approved (more votes for than against)."""
        return self.votes_for > self.votes_against

    def get_approval_percentage(self) -> float:
        """Calculate the approval percentage."""
        total = self.get_total_votes()
        if total == 0:
            return 0.0
        return (self.votes_for / total) * 100

    def get_rejection_percentage(self) -> float:
        """Calculate the rejection percentage."""
        total = self.get_total_votes()
        if total == 0:
            return 0.0
        return (self.votes_against / total) * 100

    def check_unanimity(self) -> None:
        """Check and set if decision was unanimous."""
        self.is_unanimous = self.votes_against == 0 and self.votes_abstain == 0
        self.updated_at = datetime.utcnow()

    def record_votes(
        self, votes_for: int, votes_against: int, votes_abstain: int
    ) -> None:
        """Record the voting results."""
        self.votes_for = votes_for
        self.votes_against = votes_against
        self.votes_abstain = votes_abstain
        self.check_unanimity()
        self.updated_at = datetime.utcnow()

    def set_follow_up(self, follow_up_date: datetime) -> None:
        """Set a follow-up date for the decision."""
        self.follow_up_required = True
        self.follow_up_date = follow_up_date
        self.updated_at = datetime.utcnow()

    def is_sanction_decision(self) -> bool:
        """Check if this is a sanction decision."""
        return self.decision_type == DecisionType.SANCTION

    def is_recognition_decision(self) -> bool:
        """Check if this is a recognition decision."""
        return self.decision_type == DecisionType.RECOGNITION

    def is_appeal_decision(self) -> bool:
        """Check if this is an appeal decision."""
        return self.decision_type in (
            DecisionType.APPEAL_ACCEPTED,
            DecisionType.APPEAL_REJECTED,
        )

    def requires_qualified_majority(self) -> bool:
        """Check if decision type requires qualified majority (>2/3)."""
        return self.decision_type == DecisionType.SANCTION

    def has_qualified_majority(self) -> bool:
        """Check if decision achieved qualified majority (>66.67%)."""
        return self.get_approval_percentage() >= 66.67
