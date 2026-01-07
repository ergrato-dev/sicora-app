"""
Sanction schemas for MEvalService API.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from .common import BaseSchema


class SanctionBase(BaseSchema):
    """Base sanction schema."""

    student_case_id: UUID
    student_id: UUID
    sanction_type: str = Field(
        ...,
        description="Type: VERBAL_WARNING, WRITTEN_WARNING, CONDITIONAL_ENROLLMENT, "
        "TRAINING_SUSPENSION, CANCELLATION_CURRENT_TRAINING, "
        "CANCELLATION_ALL_TRAININGS, PERMANENT_BAN",
    )
    severity_level: str = Field(
        ..., description="Level: MINOR, MODERATE, SERIOUS, VERY_SERIOUS"
    )
    description: str
    legal_basis: str = Field(
        ..., description="Legal article reference per Acuerdo 009/2024"
    )
    effective_date: date
    end_date: Optional[date] = None
    imposed_by: UUID


class SanctionCreate(SanctionBase):
    """Schema for creating a sanction."""

    conditions: list[str] = Field(default_factory=list)
    is_appealable: bool = True


class SanctionUpdate(BaseSchema):
    """Schema for updating a sanction."""

    compliance_status: Optional[str] = None
    compliance_notes: Optional[str] = None
    is_active: Optional[bool] = None
    end_date: Optional[date] = None


class SanctionResponse(SanctionBase):
    """Schema for sanction response."""

    id: UUID
    compliance_status: str
    is_appealable: bool
    appeal_deadline: Optional[date] = None
    conditions: list[str] = Field(default_factory=list)
    compliance_notes: Optional[str] = None
    notified_to_student: bool
    notification_date: Optional[datetime] = None
    notified_to_parent: bool
    parent_notification_date: Optional[datetime] = None
    recidivism_factor: float
    is_active: bool
    created_at: datetime
    updated_at: datetime


class SanctionNotifyStudent(BaseSchema):
    """Schema for notifying student of sanction."""

    notification_method: str = Field(
        ..., description="Method: EMAIL, SMS, IN_PERSON, CERTIFIED_MAIL"
    )


class SanctionNotifyParent(BaseSchema):
    """Schema for notifying parent of sanction."""

    notification_method: str


class SanctionComplianceUpdate(BaseSchema):
    """Schema for updating compliance status."""

    compliance_status: str = Field(
        ...,
        description="Status: NOT_STARTED, IN_PROGRESS, COMPLETED, PARTIALLY_COMPLETED, FAILED",
    )
    compliance_notes: Optional[str] = None


__all__ = [
    "SanctionBase",
    "SanctionCreate",
    "SanctionUpdate",
    "SanctionResponse",
    "SanctionNotifyStudent",
    "SanctionNotifyParent",
    "SanctionComplianceUpdate",
]
