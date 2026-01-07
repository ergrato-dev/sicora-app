"""
Committee member schemas for MEvalService API.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from .common import BaseSchema


class CommitteeMemberBase(BaseSchema):
    """Base committee member schema."""

    committee_id: UUID
    user_id: UUID
    role: str = Field(
        ...,
        description="Role: COORDINATOR, INSTRUCTOR, REPRESENTATIVE, SECRETARY, PRESIDENT, GUEST",
    )
    has_voting_rights: bool = True


class CommitteeMemberCreate(CommitteeMemberBase):
    """Schema for creating a committee member."""

    pass


class CommitteeMemberUpdate(BaseSchema):
    """Schema for updating a committee member."""

    role: Optional[str] = None
    has_voting_rights: Optional[bool] = None
    justification_for_absence: Optional[str] = None
    delegate_user_id: Optional[UUID] = None


class CommitteeMemberResponse(CommitteeMemberBase):
    """Schema for committee member response."""

    id: UUID
    is_present: bool = False
    attendance_time: Optional[datetime] = None
    vote_recorded: bool = False
    justification_for_absence: Optional[str] = None
    delegate_user_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class CommitteeMemberAttendance(BaseSchema):
    """Schema for recording attendance."""

    is_present: bool
    attendance_time: datetime = Field(default_factory=datetime.now)
    justification_for_absence: Optional[str] = None


__all__ = [
    "CommitteeMemberBase",
    "CommitteeMemberCreate",
    "CommitteeMemberUpdate",
    "CommitteeMemberResponse",
    "CommitteeMemberAttendance",
]
