"""
CommitteeMember entity for Monthly Evaluation Committee.

Represents members participating in committee meetings with their roles
and voting rights.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class MemberRole(str, Enum):
    """Roles of committee members."""

    COORDINATOR = "coordinator"  # Academic Coordinator (President by default)
    INSTRUCTOR = "instructor"  # Training Instructor
    REPRESENTATIVE = "representative"  # Student Representative
    SECRETARY = "secretary"  # Committee Secretary
    PRESIDENT = "president"  # Meeting President
    GUEST = "guest"  # Guest without voting rights


@dataclass
class CommitteeMember:
    """
    Represents a member of the evaluation committee.

    Members have different roles and voting rights according to the
    committee regulations.
    """

    # Required fields first
    committee_id: UUID
    user_id: UUID
    role: MemberRole

    # Fields with defaults
    id: UUID = field(default_factory=uuid4)
    is_present: bool = False
    attendance_confirmed_at: Optional[datetime] = None
    vote_power: float = 1.0
    can_vote: bool = True
    notes: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self) -> None:
        """Set voting rights based on role."""
        if self.role == MemberRole.GUEST:
            self.can_vote = False
            self.vote_power = 0.0
        elif self.role == MemberRole.SECRETARY:
            self.can_vote = False
            self.vote_power = 0.0

    def is_decision_maker(self) -> bool:
        """Check if member can participate in decisions."""
        return self.role in (
            MemberRole.COORDINATOR,
            MemberRole.INSTRUCTOR,
            MemberRole.REPRESENTATIVE,
            MemberRole.PRESIDENT,
        )

    def has_voting_rights(self) -> bool:
        """Check if member has voting rights."""
        return self.can_vote and self.is_present

    def confirm_attendance(self) -> None:
        """Confirm member attendance at the meeting."""
        self.is_present = True
        self.attendance_confirmed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def mark_absent(self) -> None:
        """Mark member as absent."""
        self.is_present = False
        self.attendance_confirmed_at = None
        self.updated_at = datetime.utcnow()

    def is_president(self) -> bool:
        """Check if member is the president of the meeting."""
        return self.role == MemberRole.PRESIDENT

    def is_secretary(self) -> bool:
        """Check if member is the secretary."""
        return self.role == MemberRole.SECRETARY

    def get_effective_vote_power(self) -> float:
        """Get the effective voting power considering presence."""
        if self.has_voting_rights():
            return self.vote_power
        return 0.0
