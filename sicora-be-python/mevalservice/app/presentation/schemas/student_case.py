"""
Student case schemas for MEvalService API.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from .common import BaseSchema


class DetectionCriteriaSchema(BaseSchema):
    """Schema for detection criteria."""

    criterion_type: str
    threshold_value: float
    actual_value: float
    period_start: Optional[str] = None
    period_end: Optional[str] = None


class EvidenceDocumentSchema(BaseSchema):
    """Schema for evidence document."""

    document_id: Optional[UUID] = None
    document_type: str
    file_path: str
    uploaded_by: Optional[UUID] = None
    uploaded_at: Optional[datetime] = None
    description: Optional[str] = None


class StudentCaseBase(BaseSchema):
    """Base student case schema."""

    student_id: UUID
    program_id: UUID
    case_type: str = Field(
        ..., description="Type: ACADEMIC, DISCIPLINARY, ATTENDANCE, COMBINED"
    )
    description: str
    priority_level: int = Field(default=3, ge=1, le=5)


class StudentCaseCreate(StudentCaseBase):
    """Schema for creating a student case."""

    reported_by: Optional[UUID] = None
    is_auto_detected: bool = False
    detection_criteria: Optional[DetectionCriteriaSchema] = None


class StudentCaseUpdate(BaseSchema):
    """Schema for updating a student case."""

    status: Optional[str] = None
    description: Optional[str] = None
    committee_id: Optional[UUID] = None
    priority_level: Optional[int] = Field(default=None, ge=1, le=5)


class StudentCaseResponse(StudentCaseBase):
    """Schema for student case response."""

    id: UUID
    case_number: str
    status: str
    is_auto_detected: bool
    detection_criteria: Optional[DetectionCriteriaSchema] = None
    detection_date: Optional[datetime] = None
    reported_by: Optional[UUID] = None
    evidence_documents: list[EvidenceDocumentSchema] = Field(default_factory=list)
    committee_id: Optional[UUID] = None
    previous_cases_count: int
    created_at: datetime
    updated_at: datetime


class StudentCaseAssignToCommittee(BaseSchema):
    """Schema for assigning case to committee."""

    committee_id: UUID


class AddEvidenceDocument(BaseSchema):
    """Schema for adding evidence document."""

    document_type: str
    file_path: str
    uploaded_by: UUID
    description: Optional[str] = None


__all__ = [
    "DetectionCriteriaSchema",
    "EvidenceDocumentSchema",
    "StudentCaseBase",
    "StudentCaseCreate",
    "StudentCaseUpdate",
    "StudentCaseResponse",
    "StudentCaseAssignToCommittee",
    "AddEvidenceDocument",
]
