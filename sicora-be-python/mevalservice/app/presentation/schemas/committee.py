"""
Committee schemas for MEvalService API.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from .common import BaseSchema


class CommitteeBase(BaseSchema):
    """Base committee schema."""

    committee_type: str = Field(
        ..., description="Type: MONTHLY, EXTRAORDINARY, APPEALS, SPECIAL"
    )
    scheduled_date: date
    location: Optional[str] = None
    is_virtual: bool = False
    virtual_meeting_link: Optional[str] = None
    training_center_id: UUID
    agenda: Optional[str] = None


class CommitteeCreate(CommitteeBase):
    """Schema for creating a committee."""

    created_by: UUID


class CommitteeUpdate(BaseSchema):
    """Schema for updating a committee."""

    status: Optional[str] = None
    scheduled_date: Optional[date] = None
    location: Optional[str] = None
    is_virtual: Optional[bool] = None
    virtual_meeting_link: Optional[str] = None
    agenda: Optional[str] = None
    minutes: Optional[str] = None


class CommitteeResponse(CommitteeBase):
    """Schema for committee response."""

    id: UUID
    status: str
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    minutes: Optional[str] = None
    minutes_approved_at: Optional[datetime] = None
    minutes_approved_by: Optional[UUID] = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime


class CommitteeStartSession(BaseSchema):
    """Schema for starting a committee session."""

    actual_start_time: datetime = Field(default_factory=datetime.now)


class CommitteeEndSession(BaseSchema):
    """Schema for ending a committee session."""

    actual_end_time: datetime = Field(default_factory=datetime.now)
    minutes: str


class CommitteeApproveMinutes(BaseSchema):
    """Schema for approving committee minutes."""

    approved_by: UUID


__all__ = [
    "CommitteeBase",
    "CommitteeCreate",
    "CommitteeUpdate",
    "CommitteeResponse",
    "CommitteeStartSession",
    "CommitteeEndSession",
    "CommitteeApproveMinutes",
]
