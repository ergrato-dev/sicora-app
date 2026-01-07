from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum


class StakeholderType(Enum):
    COMPANY = "company"
    GOVERNMENT = "government"
    NGO = "ngo"
    EDUCATIONAL_INSTITUTION = "educational_institution"
    INDIVIDUAL = "individual"
    INTERNAL_SENA = "internal_sena"


class StakeholderStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    BLACKLISTED = "blacklisted"


@dataclass
class Stakeholder:
    # Required fields (no defaults) must come first
    id: UUID
    name: str
    stakeholder_type: StakeholderType
    status: StakeholderStatus

    # Contact information
    contact_person: str
    email: str

    # Metadata - required
    created_at: datetime
    updated_at: datetime
    created_by: UUID

    # Optional fields with defaults
    phone: Optional[str] = None
    address: Optional[str] = None

    # Organization details
    organization_size: Optional[str] = None  # small, medium, large, enterprise
    sector: Optional[str] = None
    website: Optional[str] = None

    # OneVision collaboration
    previous_collaborations: int = 0
    expectations_documented: bool = False
    limitations_acknowledged: bool = False
    communication_channel_established: bool = False

    # Governance and limitations
    scope_change_requests: int = 0
    scope_changes_approved: int = 0
    scope_changes_rejected: int = 0
    last_interaction_date: Optional[datetime] = None

    def document_expectations(self, documented_by: UUID) -> None:
        """Mark stakeholder expectations as documented"""
        self.expectations_documented = True
        self.updated_at = datetime.utcnow()

    def acknowledge_limitations(self) -> None:
        """Mark that stakeholder has acknowledged SENA limitations"""
        self.limitations_acknowledged = True
        self.updated_at = datetime.utcnow()

    def establish_communication_channel(self) -> None:
        """Mark communication channel as established"""
        self.communication_channel_established = True
        self.updated_at = datetime.utcnow()

    def record_scope_change_request(self, approved: bool) -> None:
        """Record a scope change request"""
        self.scope_change_requests += 1
        if approved:
            self.scope_changes_approved += 1
        else:
            self.scope_changes_rejected += 1
        self.last_interaction_date = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def suspend_stakeholder(self, reason: str) -> None:
        """Suspend stakeholder collaboration"""
        self.status = StakeholderStatus.SUSPENDED
        self.updated_at = datetime.utcnow()

    def reactivate_stakeholder(self) -> None:
        """Reactivate stakeholder collaboration"""
        self.status = StakeholderStatus.ACTIVE
        self.updated_at = datetime.utcnow()

    def is_collaboration_ready(self) -> bool:
        """Check if stakeholder is ready for collaboration"""
        return (
            self.status == StakeholderStatus.ACTIVE
            and self.expectations_documented
            and self.limitations_acknowledged
            and self.communication_channel_established
        )

    def get_approval_rate(self) -> float:
        """Calculate scope change approval rate"""
        if self.scope_change_requests == 0:
            return 0.0
        return self.scope_changes_approved / self.scope_change_requests
