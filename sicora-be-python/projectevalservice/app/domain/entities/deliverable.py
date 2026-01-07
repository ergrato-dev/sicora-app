from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum


class DeliverableType(Enum):
    DOCUMENTATION = "documentation"
    SOURCE_CODE = "source_code"
    PRESENTATION = "presentation"
    DEMO_VIDEO = "demo_video"
    DATABASE_SCRIPT = "database_script"
    DEPLOYMENT_GUIDE = "deployment_guide"
    USER_MANUAL = "user_manual"
    TECHNICAL_SPECIFICATION = "technical_specification"
    OTHER = "other"


class DeliverableStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUIRED = "revision_required"


@dataclass
class Deliverable:
    # Required fields first
    id: UUID
    project_id: UUID

    # Deliverable details - required
    name: str
    description: str
    deliverable_type: DeliverableType
    status: DeliverableStatus

    # Timing - required
    due_date: datetime

    # Metadata - required
    created_at: datetime
    updated_at: datetime
    created_by: UUID

    # Optional fields with defaults
    evaluation_id: Optional[UUID] = None

    # Timing - optional
    submitted_date: Optional[datetime] = None
    reviewed_date: Optional[datetime] = None

    # File information
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None

    # Review information
    reviewed_by: Optional[UUID] = None
    review_comments: Optional[str] = None
    review_score: Optional[float] = None

    # Version control
    version: int = 1
    previous_version_id: Optional[UUID] = None

    def submit_deliverable(
        self, file_path: str, file_name: str, file_size: int, file_type: str
    ) -> None:
        """Submit the deliverable with file information"""
        self.status = DeliverableStatus.SUBMITTED
        self.submitted_date = datetime.utcnow()
        self.file_path = file_path
        self.file_name = file_name
        self.file_size = file_size
        self.file_type = file_type
        self.updated_at = datetime.utcnow()

    def start_review(self, reviewer_id: UUID) -> None:
        """Start reviewing the deliverable"""
        self.status = DeliverableStatus.UNDER_REVIEW
        self.reviewed_by = reviewer_id
        self.updated_at = datetime.utcnow()

    def approve_deliverable(
        self, reviewer_id: UUID, score: float, comments: str
    ) -> None:
        """Approve the deliverable"""
        self.status = DeliverableStatus.APPROVED
        self.reviewed_by = reviewer_id
        self.reviewed_date = datetime.utcnow()
        self.review_score = score
        self.review_comments = comments
        self.updated_at = datetime.utcnow()

    def reject_deliverable(self, reviewer_id: UUID, comments: str) -> None:
        """Reject the deliverable"""
        self.status = DeliverableStatus.REJECTED
        self.reviewed_by = reviewer_id
        self.reviewed_date = datetime.utcnow()
        self.review_comments = comments
        self.updated_at = datetime.utcnow()

    def require_revision(self, reviewer_id: UUID, comments: str) -> None:
        """Require revision of the deliverable"""
        self.status = DeliverableStatus.REVISION_REQUIRED
        self.reviewed_by = reviewer_id
        self.reviewed_date = datetime.utcnow()
        self.review_comments = comments
        self.updated_at = datetime.utcnow()

    def create_new_version(self) -> "Deliverable":
        """Create a new version of this deliverable"""
        new_deliverable = Deliverable(
            id=UUID(),
            project_id=self.project_id,
            evaluation_id=self.evaluation_id,
            name=self.name,
            description=self.description,
            deliverable_type=self.deliverable_type,
            status=DeliverableStatus.PENDING,
            due_date=self.due_date,
            version=self.version + 1,
            previous_version_id=self.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            created_by=self.created_by,
        )
        return new_deliverable

    def is_overdue(self) -> bool:
        """Check if deliverable is overdue"""
        return datetime.utcnow() > self.due_date and self.status not in [
            DeliverableStatus.SUBMITTED,
            DeliverableStatus.APPROVED,
        ]

    def is_submitted(self) -> bool:
        """Check if deliverable has been submitted"""
        return self.status in [
            DeliverableStatus.SUBMITTED,
            DeliverableStatus.UNDER_REVIEW,
            DeliverableStatus.APPROVED,
            DeliverableStatus.REJECTED,
            DeliverableStatus.REVISION_REQUIRED,
        ]
