"""
Stakeholder Use Cases - Application layer for stakeholder management.

Author: SICORA Team
Date: 2025
"""

from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime

from ...domain.entities.stakeholder import (
    Stakeholder,
    StakeholderType,
    StakeholderStatus,
)
from ...domain.repositories import StakeholderRepository


class CreateStakeholderUseCase:
    """Create a new stakeholder."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(
        self,
        name: str,
        stakeholder_type: StakeholderType,
        contact_person: str,
        email: str,
        created_by: UUID,
        phone: Optional[str] = None,
        address: Optional[str] = None,
        organization_size: Optional[str] = None,
        sector: Optional[str] = None,
        website: Optional[str] = None,
    ) -> Stakeholder:
        """Create a new stakeholder."""
        stakeholder = Stakeholder(
            id=uuid4(),
            name=name,
            stakeholder_type=stakeholder_type,
            status=StakeholderStatus.ACTIVE,
            contact_person=contact_person,
            email=email,
            phone=phone,
            address=address,
            organization_size=organization_size,
            sector=sector,
            website=website,
            previous_collaborations=0,
            expectations_documented=False,
            limitations_acknowledged=False,
            communication_channel_established=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            created_by=created_by,
            scope_change_requests=0,
            scope_changes_approved=0,
            scope_changes_rejected=0,
            last_interaction_date=None,
        )
        return await self.stakeholder_repository.create(stakeholder)


class GetStakeholderUseCase:
    """Get stakeholder by ID."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(self, stakeholder_id: UUID) -> Optional[Stakeholder]:
        """Get stakeholder by ID."""
        return await self.stakeholder_repository.get_by_id(stakeholder_id)


class UpdateStakeholderUseCase:
    """Update stakeholder information."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(
        self,
        stakeholder_id: UUID,
        name: Optional[str] = None,
        contact_person: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
        organization_size: Optional[str] = None,
        sector: Optional[str] = None,
        website: Optional[str] = None,
    ) -> Optional[Stakeholder]:
        """Update stakeholder information."""
        stakeholder = await self.stakeholder_repository.get_by_id(stakeholder_id)
        if not stakeholder:
            return None

        # Update fields if provided
        if name:
            stakeholder.name = name
        if contact_person:
            stakeholder.contact_person = contact_person
        if email:
            stakeholder.email = email
        if phone is not None:
            stakeholder.phone = phone
        if address is not None:
            stakeholder.address = address
        if organization_size is not None:
            stakeholder.organization_size = organization_size
        if sector is not None:
            stakeholder.sector = sector
        if website is not None:
            stakeholder.website = website

        stakeholder.updated_at = datetime.utcnow()
        return await self.stakeholder_repository.update(stakeholder)


class ListStakeholdersUseCase:
    """List stakeholders with filters."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(
        self,
        status: Optional[StakeholderStatus] = None,
        stakeholder_type: Optional[StakeholderType] = None,
        collaboration_ready: Optional[bool] = None,
    ) -> List[Stakeholder]:
        """List stakeholders with optional filters."""
        return await self.stakeholder_repository.get_all(
            status=status,
            stakeholder_type=stakeholder_type,
            collaboration_ready=collaboration_ready,
        )


class DocumentExpectationsUseCase:
    """Document stakeholder expectations."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(
        self,
        stakeholder_id: UUID,
        documented_by: UUID,
        expectations_summary: str,
        scope_limitations: Optional[str] = None,
        deliverables_agreed: Optional[List[str]] = None,
    ) -> Optional[Stakeholder]:
        """Document stakeholder expectations."""
        stakeholder = await self.stakeholder_repository.get_by_id(stakeholder_id)
        if not stakeholder:
            return None

        stakeholder.document_expectations(documented_by)
        stakeholder.last_interaction_date = datetime.utcnow()

        return await self.stakeholder_repository.update(stakeholder)


class AcknowledgeLimitationsUseCase:
    """Record stakeholder acknowledgment of limitations."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(
        self,
        stakeholder_id: UUID,
        confirmation_text: str,
        digital_signature: Optional[str] = None,
    ) -> Optional[Stakeholder]:
        """Record stakeholder acknowledgment of OneVision limitations."""
        stakeholder = await self.stakeholder_repository.get_by_id(stakeholder_id)
        if not stakeholder:
            return None

        stakeholder.acknowledge_limitations()
        stakeholder.last_interaction_date = datetime.utcnow()

        return await self.stakeholder_repository.update(stakeholder)


class EstablishCommunicationChannelUseCase:
    """Establish communication channel with stakeholder."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(
        self,
        stakeholder_id: UUID,
        primary_channel: str,
        secondary_channel: Optional[str] = None,
        meeting_frequency: str = "quincenal",
        escalation_contact: Optional[str] = None,
    ) -> Optional[Stakeholder]:
        """Establish communication channel with stakeholder."""
        stakeholder = await self.stakeholder_repository.get_by_id(stakeholder_id)
        if not stakeholder:
            return None

        stakeholder.establish_communication_channel()
        stakeholder.last_interaction_date = datetime.utcnow()

        return await self.stakeholder_repository.update(stakeholder)


class RecordScopeChangeRequestUseCase:
    """Record a scope change request from stakeholder."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(
        self,
        stakeholder_id: UUID,
        change_description: str,
        justification: str,
        approved: bool,
        impact_assessment: Optional[str] = None,
    ) -> Optional[Stakeholder]:
        """Record a scope change request and its result."""
        stakeholder = await self.stakeholder_repository.get_by_id(stakeholder_id)
        if not stakeholder:
            return None

        stakeholder.record_scope_change_request(approved)
        return await self.stakeholder_repository.update(stakeholder)


class SuspendStakeholderUseCase:
    """Suspend stakeholder collaboration."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(
        self,
        stakeholder_id: UUID,
        reason: str,
    ) -> Optional[Stakeholder]:
        """Suspend stakeholder collaboration."""
        stakeholder = await self.stakeholder_repository.get_by_id(stakeholder_id)
        if not stakeholder:
            return None

        if stakeholder.status != StakeholderStatus.ACTIVE:
            raise ValueError("Only active stakeholders can be suspended")

        stakeholder.suspend_stakeholder(reason)
        return await self.stakeholder_repository.update(stakeholder)


class ReactivateStakeholderUseCase:
    """Reactivate suspended stakeholder."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(self, stakeholder_id: UUID) -> Optional[Stakeholder]:
        """Reactivate suspended stakeholder."""
        stakeholder = await self.stakeholder_repository.get_by_id(stakeholder_id)
        if not stakeholder:
            return None

        if stakeholder.status not in [
            StakeholderStatus.SUSPENDED,
            StakeholderStatus.INACTIVE,
        ]:
            raise ValueError(
                "Only suspended or inactive stakeholders can be reactivated"
            )

        stakeholder.reactivate_stakeholder()
        return await self.stakeholder_repository.update(stakeholder)


class CheckCollaborationReadinessUseCase:
    """Check if stakeholder is ready for collaboration."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(self, stakeholder_id: UUID) -> dict:
        """Check collaboration readiness and return details."""
        stakeholder = await self.stakeholder_repository.get_by_id(stakeholder_id)
        if not stakeholder:
            return {
                "is_ready": False,
                "missing_requirements": ["stakeholder_not_found"],
                "recommendations": ["Verificar ID del stakeholder"],
            }

        missing = []
        recommendations = []

        if stakeholder.status != StakeholderStatus.ACTIVE:
            missing.append("status_not_active")
            recommendations.append(
                f"Stakeholder está en estado {stakeholder.status.value}, debe estar activo"
            )

        if not stakeholder.expectations_documented:
            missing.append("expectations_not_documented")
            recommendations.append(
                "Documentar expectativas del proyecto con el stakeholder"
            )

        if not stakeholder.limitations_acknowledged:
            missing.append("limitations_not_acknowledged")
            recommendations.append(
                "Obtener reconocimiento de limitaciones del contexto formativo"
            )

        if not stakeholder.communication_channel_established:
            missing.append("communication_channel_not_established")
            recommendations.append("Establecer canal de comunicación formal")

        return {
            "stakeholder_id": str(stakeholder.id),
            "stakeholder_name": stakeholder.name,
            "is_ready": stakeholder.is_collaboration_ready(),
            "missing_requirements": missing,
            "recommendations": recommendations,
        }


class GetStakeholderStatsUseCase:
    """Get stakeholder statistics."""

    def __init__(self, stakeholder_repository: StakeholderRepository):
        self.stakeholder_repository = stakeholder_repository

    async def execute(self) -> dict:
        """Get comprehensive stakeholder statistics."""
        all_stakeholders = await self.stakeholder_repository.get_all()

        by_type: dict[str, int] = {}
        by_status: dict[str, int] = {}
        collaboration_ready = 0
        pending_expectations = 0
        pending_acknowledgment = 0
        pending_communication = 0

        for s in all_stakeholders:
            # Count by type
            type_key = s.stakeholder_type.value
            by_type[type_key] = by_type.get(type_key, 0) + 1

            # Count by status
            status_key = s.status.value
            by_status[status_key] = by_status.get(status_key, 0) + 1

            # Count readiness
            if s.is_collaboration_ready():
                collaboration_ready += 1

            if not s.expectations_documented:
                pending_expectations += 1

            if not s.limitations_acknowledged:
                pending_acknowledgment += 1

            if not s.communication_channel_established:
                pending_communication += 1

        return {
            "total_stakeholders": len(all_stakeholders),
            "active_stakeholders": by_status.get("active", 0),
            "collaboration_ready": collaboration_ready,
            "pending_expectations": pending_expectations,
            "pending_acknowledgment": pending_acknowledgment,
            "pending_communication": pending_communication,
            "by_type": by_type,
            "by_status": by_status,
        }
