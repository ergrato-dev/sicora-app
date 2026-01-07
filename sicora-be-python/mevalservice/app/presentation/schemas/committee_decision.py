"""
Committee decision schemas for MEvalService API.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from .common import BaseSchema


class CommitteeDecisionBase(BaseSchema):
    """Base committee decision schema."""

    committee_id: UUID
    student_case_id: UUID
    decision_type: str = Field(
        ...,
        description="Type: IMPROVEMENT_PLAN, SANCTION, CONDITIONAL, DISMISSAL, ACQUITTAL, DEFERRED",
    )
    rationale: Optional[str] = None
    conditions: list[str] = Field(default_factory=list)
    follow_up_date: Optional[date] = None


class CommitteeDecisionCreate(CommitteeDecisionBase):
    """Schema for creating a committee decision."""

    votes_in_favor: int = 0
    votes_against: int = 0
    abstentions: int = 0


class CommitteeDecisionUpdate(BaseSchema):
    """Schema for updating a committee decision."""

    rationale: Optional[str] = None
    conditions: Optional[list[str]] = None
    follow_up_date: Optional[date] = None


class CommitteeDecisionResponse(CommitteeDecisionBase):
    """Schema for committee decision response."""

    id: UUID
    votes_in_favor: int
    votes_against: int
    abstentions: int
    is_unanimous: bool
    notified_to_student: bool
    notification_date: Optional[datetime] = None
    notification_method: Optional[str] = None
    student_acknowledgement: bool
    acknowledgement_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class DecisionNotification(BaseSchema):
    """Schema for notifying student of decision."""

    notification_method: str = Field(
        ..., description="Method: EMAIL, SMS, IN_PERSON, CERTIFIED_MAIL"
    )


class DecisionAcknowledgement(BaseSchema):
    """Schema for student acknowledgement."""

    acknowledged: bool = True


__all__ = [
    "CommitteeDecisionBase",
    "CommitteeDecisionCreate",
    "CommitteeDecisionUpdate",
    "CommitteeDecisionResponse",
    "DecisionNotification",
    "DecisionAcknowledgement",
]
