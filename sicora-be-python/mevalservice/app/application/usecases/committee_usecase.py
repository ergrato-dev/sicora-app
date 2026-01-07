"""
Committee use case - business logic for committee management.
"""

from datetime import date
from typing import Optional
from uuid import UUID, uuid4

from ...domain.entities import (
    Committee,
    CommitteeMember,
    CommitteeStatus,
    CommitteeType,
    MemberRole,
)
from ...domain.repositories import CommitteeRepository, CommitteeMemberRepository


class CommitteeUseCase:
    """Use case for committee operations."""

    QUORUM_PERCENTAGE = 0.5  # 50% of voting members

    def __init__(
        self,
        committee_repo: CommitteeRepository,
        member_repo: CommitteeMemberRepository,
    ):
        self.committee_repo = committee_repo
        self.member_repo = member_repo

    async def create_committee(
        self,
        committee_type: str,
        scheduled_date: date,
        training_center_id: UUID,
        created_by: UUID,
        location: Optional[str] = None,
        is_virtual: bool = False,
        virtual_meeting_link: Optional[str] = None,
        agenda: Optional[str] = None,
    ) -> Committee:
        """Create a new committee."""
        committee = Committee(
            id=uuid4(),
            committee_type=CommitteeType(committee_type),
            status=CommitteeStatus.SCHEDULED,
            scheduled_date=scheduled_date,
            training_center_id=training_center_id,
            created_by=created_by,
            location=location,
            is_virtual=is_virtual,
            virtual_meeting_link=virtual_meeting_link,
            agenda=agenda,
        )
        return await self.committee_repo.create(committee)

    async def get_committee(self, committee_id: UUID) -> Optional[Committee]:
        """Get committee by ID."""
        return await self.committee_repo.get_by_id(committee_id)

    async def list_committees(self, skip: int = 0, limit: int = 100) -> list[Committee]:
        """List all committees with pagination."""
        return await self.committee_repo.get_all(skip, limit)

    async def get_committees_by_date_range(
        self, start_date: date, end_date: date
    ) -> list[Committee]:
        """Get committees within a date range."""
        return await self.committee_repo.get_by_date_range(start_date, end_date)

    async def start_session(self, committee_id: UUID) -> Committee:
        """Start a committee session."""
        committee = await self.committee_repo.get_by_id(committee_id)
        if not committee:
            raise ValueError(f"Committee {committee_id} not found")

        if committee.status != CommitteeStatus.SCHEDULED:
            raise ValueError(
                f"Committee must be SCHEDULED to start, current: {committee.status}"
            )

        # Check quorum
        if not await self._has_quorum(committee_id):
            raise ValueError("Cannot start session: quorum not reached")

        committee.start_session()
        return await self.committee_repo.update(committee)

    async def end_session(self, committee_id: UUID, minutes: str) -> Committee:
        """End a committee session."""
        committee = await self.committee_repo.get_by_id(committee_id)
        if not committee:
            raise ValueError(f"Committee {committee_id} not found")

        if committee.status != CommitteeStatus.IN_SESSION:
            raise ValueError("Committee must be IN_SESSION to end")

        committee.end_session(minutes)
        return await self.committee_repo.update(committee)

    async def approve_minutes(self, committee_id: UUID, approved_by: UUID) -> Committee:
        """Approve committee minutes."""
        committee = await self.committee_repo.get_by_id(committee_id)
        if not committee:
            raise ValueError(f"Committee {committee_id} not found")

        committee.approve_minutes(approved_by)
        return await self.committee_repo.update(committee)

    async def cancel_committee(self, committee_id: UUID) -> Committee:
        """Cancel a scheduled committee."""
        committee = await self.committee_repo.get_by_id(committee_id)
        if not committee:
            raise ValueError(f"Committee {committee_id} not found")

        if committee.status not in [
            CommitteeStatus.SCHEDULED,
            CommitteeStatus.POSTPONED,
        ]:
            raise ValueError("Can only cancel scheduled or postponed committees")

        committee.status = CommitteeStatus.CANCELLED
        return await self.committee_repo.update(committee)

    async def postpone_committee(self, committee_id: UUID, new_date: date) -> Committee:
        """Postpone a committee to a new date."""
        committee = await self.committee_repo.get_by_id(committee_id)
        if not committee:
            raise ValueError(f"Committee {committee_id} not found")

        if committee.status != CommitteeStatus.SCHEDULED:
            raise ValueError("Can only postpone scheduled committees")

        committee.status = CommitteeStatus.POSTPONED
        committee.scheduled_date = new_date
        return await self.committee_repo.update(committee)

    async def add_member(
        self,
        committee_id: UUID,
        user_id: UUID,
        role: str,
        has_voting_rights: bool = True,
    ) -> CommitteeMember:
        """Add a member to a committee."""
        member = CommitteeMember(
            id=uuid4(),
            committee_id=committee_id,
            user_id=user_id,
            role=MemberRole(role),
            has_voting_rights=has_voting_rights,
        )
        return await self.member_repo.create(member)

    async def record_attendance(
        self,
        member_id: UUID,
        is_present: bool,
        justification: Optional[str] = None,
    ) -> CommitteeMember:
        """Record member attendance."""
        member = await self.member_repo.get_by_id(member_id)
        if not member:
            raise ValueError(f"Member {member_id} not found")

        member.record_attendance(is_present, justification)
        return await self.member_repo.update(member)

    async def get_committee_members(self, committee_id: UUID) -> list[CommitteeMember]:
        """Get all members of a committee."""
        return await self.member_repo.get_by_committee(committee_id)

    async def _has_quorum(self, committee_id: UUID) -> bool:
        """Check if committee has quorum."""
        voting_members = await self.member_repo.get_voting_members(committee_id)
        present_count = await self.member_repo.get_quorum_count(committee_id)

        if not voting_members:
            return False

        return present_count >= len(voting_members) * self.QUORUM_PERCENTAGE

    async def get_next_scheduled(self, training_center_id: UUID) -> Optional[Committee]:
        """Get the next scheduled committee for a training center."""
        return await self.committee_repo.get_next_scheduled(training_center_id)
