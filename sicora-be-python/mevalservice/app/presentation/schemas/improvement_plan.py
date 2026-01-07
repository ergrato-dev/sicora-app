"""
Improvement plan schemas for MEvalService API.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from .common import BaseSchema


class ObjectiveSchema(BaseSchema):
    """Schema for plan objective."""

    id: Optional[UUID] = None
    description: str
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    is_completed: bool = False


class ActivitySchema(BaseSchema):
    """Schema for plan activity."""

    id: Optional[UUID] = None
    description: str
    due_date: Optional[date] = None
    completed_date: Optional[date] = None
    responsible_id: Optional[UUID] = None
    status: str = "PENDING"
    notes: Optional[str] = None


class SuccessCriteriaSchema(BaseSchema):
    """Schema for success criteria."""

    id: Optional[UUID] = None
    description: str
    measurement_method: str
    target_value: float
    achieved_value: Optional[float] = None
    is_met: bool = False


class ImprovementPlanBase(BaseSchema):
    """Base improvement plan schema."""

    student_case_id: UUID
    student_id: UUID
    plan_type: str = Field(
        ..., description="Type: ACADEMIC, DISCIPLINARY, ATTENDANCE, COMPREHENSIVE"
    )
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    supervisor_id: UUID
    support_instructor_id: Optional[UUID] = None


class ImprovementPlanCreate(ImprovementPlanBase):
    """Schema for creating an improvement plan."""

    objectives: list[ObjectiveSchema] = Field(default_factory=list)
    activities: list[ActivitySchema] = Field(default_factory=list)
    success_criteria: list[SuccessCriteriaSchema] = Field(default_factory=list)


class ImprovementPlanUpdate(BaseSchema):
    """Schema for updating an improvement plan."""

    status: Optional[str] = None
    description: Optional[str] = None
    end_date: Optional[date] = None
    compliance_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    review_notes: Optional[str] = None
    next_review_date: Optional[date] = None


class ImprovementPlanResponse(ImprovementPlanBase):
    """Schema for improvement plan response."""

    id: UUID
    status: str
    objectives: list[ObjectiveSchema] = Field(default_factory=list)
    activities: list[ActivitySchema] = Field(default_factory=list)
    success_criteria: list[SuccessCriteriaSchema] = Field(default_factory=list)
    compliance_percentage: float
    last_review_date: Optional[date] = None
    next_review_date: Optional[date] = None
    review_notes: Optional[str] = None
    student_commitment_signed: bool
    commitment_signed_date: Optional[datetime] = None
    extension_count: int
    max_extensions: int
    created_at: datetime
    updated_at: datetime


class ImprovementPlanReview(BaseSchema):
    """Schema for plan review."""

    compliance_percentage: float = Field(..., ge=0, le=100)
    review_notes: str
    next_review_date: Optional[date] = None


class ImprovementPlanExtend(BaseSchema):
    """Schema for extending plan duration."""

    new_end_date: date
    reason: str


class SignCommitment(BaseSchema):
    """Schema for signing commitment."""

    signed: bool = True


__all__ = [
    "ObjectiveSchema",
    "ActivitySchema",
    "SuccessCriteriaSchema",
    "ImprovementPlanBase",
    "ImprovementPlanCreate",
    "ImprovementPlanUpdate",
    "ImprovementPlanResponse",
    "ImprovementPlanReview",
    "ImprovementPlanExtend",
    "SignCommitment",
]
