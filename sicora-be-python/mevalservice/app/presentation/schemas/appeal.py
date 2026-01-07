"""
Appeal schemas for MEvalService API.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from .common import BaseSchema


class SupportingDocumentSchema(BaseSchema):
    """Schema for supporting document."""

    document_id: Optional[UUID] = None
    document_type: str
    file_path: str
    uploaded_at: Optional[datetime] = None
    description: Optional[str] = None


class AppealBase(BaseSchema):
    """Base appeal schema."""

    sanction_id: UUID
    student_id: UUID
    filed_by: UUID
    grounds: str = Field(..., description="Legal grounds for the appeal")


class AppealCreate(AppealBase):
    """Schema for creating an appeal."""

    supporting_documents: list[SupportingDocumentSchema] = Field(default_factory=list)


class AppealUpdate(BaseSchema):
    """Schema for updating an appeal."""

    admissibility_status: Optional[str] = None
    admissibility_notes: Optional[str] = None
    appeal_committee_id: Optional[UUID] = None
    hearing_date: Optional[datetime] = None


class AppealResponse(AppealBase):
    """Schema for appeal response."""

    id: UUID
    filing_date: datetime
    supporting_documents: list[SupportingDocumentSchema] = Field(default_factory=list)
    admissibility_status: str
    admissibility_reviewer: Optional[UUID] = None
    admissibility_date: Optional[datetime] = None
    admissibility_notes: Optional[str] = None
    appeal_committee_id: Optional[UUID] = None
    hearing_date: Optional[datetime] = None
    decision: str
    decision_rationale: Optional[str] = None
    decision_date: Optional[datetime] = None
    decided_by: Optional[UUID] = None
    new_sanction_id: Optional[UUID] = None
    is_final: bool
    student_notified: bool
    notification_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AppealAdmissibilityReview(BaseSchema):
    """Schema for admissibility review."""

    admissibility_status: str = Field(
        ..., description="Status: ADMITTED, REJECTED, REQUIRES_ADDITIONAL_INFO"
    )
    reviewer_id: UUID
    notes: Optional[str] = None


class AppealDecisionSchema(BaseSchema):
    """Schema for appeal decision."""

    decision: str = Field(
        ..., description="Decision: UPHELD, MODIFIED, REVOKED, DISMISSED"
    )
    decision_rationale: str
    decided_by: UUID
    new_sanction_id: Optional[UUID] = None


class AppealScheduleHearing(BaseSchema):
    """Schema for scheduling a hearing."""

    appeal_committee_id: UUID
    hearing_date: datetime


class AddSupportingDocument(BaseSchema):
    """Schema for adding supporting document."""

    document_type: str
    file_path: str
    description: Optional[str] = None


__all__ = [
    "SupportingDocumentSchema",
    "AppealBase",
    "AppealCreate",
    "AppealUpdate",
    "AppealResponse",
    "AppealAdmissibilityReview",
    "AppealDecisionSchema",
    "AppealScheduleHearing",
    "AddSupportingDocument",
]
