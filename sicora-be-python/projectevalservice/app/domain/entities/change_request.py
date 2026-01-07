from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum


class ChangeRequestType(Enum):
    SCOPE_CHANGE = "scope_change"
    TIMELINE_CHANGE = "timeline_change"
    TECHNOLOGY_CHANGE = "technology_change"
    TEAM_CHANGE = "team_change"
    REQUIREMENT_CHANGE = "requirement_change"


class ChangeRequestStatus(Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class ChangeRequestPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class ChangeRequest:
    # Required fields first
    id: UUID
    project_id: UUID
    requester_id: UUID  # Could be stakeholder, instructor, or student
    requester_type: str  # "stakeholder", "instructor", "student"

    # Request details - required
    change_type: ChangeRequestType
    title: str
    description: str
    justification: str
    priority: ChangeRequestPriority
    status: ChangeRequestStatus

    # Metadata - required
    created_at: datetime
    updated_at: datetime

    # Optional fields with defaults
    # Impact analysis
    estimated_effort_hours: Optional[int] = None
    impact_on_timeline: Optional[str] = None
    impact_on_scope: Optional[str] = None
    impact_on_learning_objectives: Optional[str] = None

    # Academic governance
    requires_academic_approval: bool = True
    academic_reviewer_id: Optional[UUID] = None
    academic_review_date: Optional[datetime] = None
    academic_review_comments: Optional[str] = None

    # Decision
    decision_maker_id: Optional[UUID] = None
    decision_date: Optional[datetime] = None
    decision_reason: Optional[str] = None

    def submit_for_review(self, reviewer_id: UUID) -> None:
        """Submit change request for academic review"""
        self.status = ChangeRequestStatus.UNDER_REVIEW
        self.academic_reviewer_id = reviewer_id
        self.updated_at = datetime.utcnow()

    def approve_request(self, decision_maker_id: UUID, reason: str) -> None:
        """Approve the change request"""
        self.status = ChangeRequestStatus.APPROVED
        self.decision_maker_id = decision_maker_id
        self.decision_date = datetime.utcnow()
        self.decision_reason = reason
        self.updated_at = datetime.utcnow()

    def reject_request(self, decision_maker_id: UUID, reason: str) -> None:
        """Reject the change request"""
        self.status = ChangeRequestStatus.REJECTED
        self.decision_maker_id = decision_maker_id
        self.decision_date = datetime.utcnow()
        self.decision_reason = reason
        self.updated_at = datetime.utcnow()

    def cancel_request(self, reason: str) -> None:
        """Cancel the change request"""
        self.status = ChangeRequestStatus.CANCELLED
        self.decision_reason = reason
        self.updated_at = datetime.utcnow()

    def add_academic_review(self, reviewer_id: UUID, comments: str) -> None:
        """Add academic review comments"""
        self.academic_reviewer_id = reviewer_id
        self.academic_review_date = datetime.utcnow()
        self.academic_review_comments = comments
        self.updated_at = datetime.utcnow()

    def is_from_stakeholder(self) -> bool:
        """Check if request is from stakeholder"""
        return self.requester_type == "stakeholder"

    def is_pending(self) -> bool:
        """Check if request is pending decision"""
        return self.status in [
            ChangeRequestStatus.SUBMITTED,
            ChangeRequestStatus.UNDER_REVIEW,
        ]

    def is_resolved(self) -> bool:
        """Check if request has been resolved"""
        return self.status in [
            ChangeRequestStatus.APPROVED,
            ChangeRequestStatus.REJECTED,
            ChangeRequestStatus.CANCELLED,
        ]
