"""
Committee member repository implementation.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ...domain.entities import CommitteeMember, MemberRole
from ...domain.repositories import CommitteeMemberRepository
from ..database.models import CommitteeMemberModel, MemberRoleDB


class CommitteeMemberRepositoryImpl(CommitteeMemberRepository):
    """SQLAlchemy implementation of CommitteeMemberRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: CommitteeMemberModel) -> CommitteeMember:
        return CommitteeMember(
            id=model.id,
            committee_id=model.committee_id,
            user_id=model.user_id,
            role=MemberRole(model.role.value),
            is_present=model.is_present,
            attendance_time=model.attendance_time,
            has_voting_rights=model.has_voting_rights,
            vote_recorded=model.vote_recorded,
            justification_for_absence=model.justification_for_absence,
            delegate_user_id=model.delegate_user_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: CommitteeMember) -> CommitteeMemberModel:
        return CommitteeMemberModel(
            id=entity.id,
            committee_id=entity.committee_id,
            user_id=entity.user_id,
            role=MemberRoleDB(entity.role.value),
            is_present=entity.is_present,
            attendance_time=entity.attendance_time,
            has_voting_rights=entity.has_voting_rights,
            vote_recorded=entity.vote_recorded,
            justification_for_absence=entity.justification_for_absence,
            delegate_user_id=entity.delegate_user_id,
        )

    async def create(self, member: CommitteeMember) -> CommitteeMember:
        model = self._to_model(member)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, member_id: UUID) -> Optional[CommitteeMember]:
        result = await self.session.execute(
            select(CommitteeMemberModel).where(CommitteeMemberModel.id == member_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, member: CommitteeMember) -> CommitteeMember:
        result = await self.session.execute(
            select(CommitteeMemberModel).where(CommitteeMemberModel.id == member.id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.role = MemberRoleDB(member.role.value)
            model.is_present = member.is_present
            model.attendance_time = member.attendance_time
            model.has_voting_rights = member.has_voting_rights
            model.vote_recorded = member.vote_recorded
            model.justification_for_absence = member.justification_for_absence
            model.delegate_user_id = member.delegate_user_id
            await self.session.commit()
            await self.session.refresh(model)
            return self._to_entity(model)
        raise ValueError(f"CommitteeMember {member.id} not found")

    async def delete(self, member_id: UUID) -> bool:
        result = await self.session.execute(
            select(CommitteeMemberModel).where(CommitteeMemberModel.id == member_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_by_committee(self, committee_id: UUID) -> list[CommitteeMember]:
        result = await self.session.execute(
            select(CommitteeMemberModel).where(
                CommitteeMemberModel.committee_id == committee_id
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_present_members(self, committee_id: UUID) -> list[CommitteeMember]:
        result = await self.session.execute(
            select(CommitteeMemberModel).where(
                CommitteeMemberModel.committee_id == committee_id,
                CommitteeMemberModel.is_present.is_(True),
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_voting_members(self, committee_id: UUID) -> list[CommitteeMember]:
        result = await self.session.execute(
            select(CommitteeMemberModel).where(
                CommitteeMemberModel.committee_id == committee_id,
                CommitteeMemberModel.has_voting_rights.is_(True),
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_quorum_count(self, committee_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(CommitteeMemberModel.id)).where(
                CommitteeMemberModel.committee_id == committee_id,
                CommitteeMemberModel.is_present.is_(True),
                CommitteeMemberModel.has_voting_rights.is_(True),
            )
        )
        return result.scalar() or 0
