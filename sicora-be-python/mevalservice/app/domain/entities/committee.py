"""
Committee entity for Monthly Evaluation Committee.

Represents the evaluation committee meetings held monthly at each training center
according to Acuerdo OneVision 009/2024.
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class CommitteeType(str, Enum):
    """Types of committee meetings."""

    MONTHLY = "monthly"
    EXTRAORDINARY = "extraordinary"
    APPEALS = "appeals"
    SPECIAL = "special"


class CommitteeStatus(str, Enum):
    """Status of a committee meeting."""

    SCHEDULED = "scheduled"
    IN_SESSION = "in_session"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"


@dataclass
class Committee:
    """
    Represents a Monthly Evaluation Committee meeting.

    The committee is responsible for reviewing student cases, making decisions
    on recognitions, improvement plans, and sanctions according to the
    institutional regulations (Acuerdo 009/2024).
    """

    # Required fields first
    committee_date: date
    committee_type: CommitteeType
    program_id: UUID
    academic_period: str
    training_center_id: UUID

    # Fields with defaults
    id: UUID = field(default_factory=uuid4)
    status: CommitteeStatus = field(default=CommitteeStatus.SCHEDULED)
    agenda: str = ""
    minutes: str = ""
    quorum_achieved: bool = False
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: str = ""
    virtual_meeting_url: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    created_by: Optional[UUID] = None

    def is_monthly_committee(self) -> bool:
        """Check if this is a regular monthly committee."""
        return self.committee_type == CommitteeType.MONTHLY

    def can_start_session(self) -> bool:
        """Check if the committee session can be started."""
        return self.status == CommitteeStatus.SCHEDULED and self.quorum_achieved

    def is_completed(self) -> bool:
        """Check if the committee has finished its session."""
        return self.status == CommitteeStatus.COMPLETED

    def is_active(self) -> bool:
        """Check if the committee is currently in session."""
        return self.status == CommitteeStatus.IN_SESSION

    def can_make_decisions(self) -> bool:
        """Check if the committee can make decisions."""
        return self.is_active() and self.quorum_achieved

    def start_session(self) -> None:
        """Start the committee session."""
        if not self.can_start_session():
            raise ValueError("Cannot start session without quorum")
        self.status = CommitteeStatus.IN_SESSION
        self.start_time = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def end_session(self) -> None:
        """End the committee session."""
        if self.status != CommitteeStatus.IN_SESSION:
            raise ValueError("Committee is not in session")
        self.status = CommitteeStatus.COMPLETED
        self.end_time = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def cancel(self, reason: str = "") -> None:
        """Cancel the committee meeting."""
        if self.status in (CommitteeStatus.COMPLETED, CommitteeStatus.IN_SESSION):
            raise ValueError("Cannot cancel a completed or in-session committee")
        self.status = CommitteeStatus.CANCELLED
        if reason:
            self.minutes = f"Cancelled: {reason}"
        self.updated_at = datetime.utcnow()

    def postpone(self, new_date: date, reason: str = "") -> None:
        """Postpone the committee to a new date."""
        if self.status not in (CommitteeStatus.SCHEDULED, CommitteeStatus.POSTPONED):
            raise ValueError(
                "Can only postpone scheduled or already postponed committees"
            )
        self.status = CommitteeStatus.POSTPONED
        self.committee_date = new_date
        if reason:
            self.minutes = f"Postponed: {reason}\n{self.minutes}"
        self.updated_at = datetime.utcnow()

    def set_quorum(self, achieved: bool) -> None:
        """Set the quorum status."""
        self.quorum_achieved = achieved
        self.updated_at = datetime.utcnow()

    def update_agenda(self, agenda: str) -> None:
        """Update the meeting agenda."""
        self.agenda = agenda
        self.updated_at = datetime.utcnow()

    def update_minutes(self, minutes: str) -> None:
        """Update the meeting minutes."""
        self.minutes = minutes
        self.updated_at = datetime.utcnow()

    @staticmethod
    def get_first_monday_of_month(year: int, month: int) -> date:
        """Get the first Monday of a given month (typical committee date)."""
        first_day = date(year, month, 1)
        days_until_monday = (7 - first_day.weekday()) % 7
        if first_day.weekday() == 0:  # Already Monday
            return first_day
        return date(year, month, 1 + days_until_monday)
