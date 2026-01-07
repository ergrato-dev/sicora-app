"""
Committee router - API endpoints for committee management.
"""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...application.usecases import CommitteeUseCase
from ...infrastructure.database.base import get_db
from ...infrastructure.repositories import (
    CommitteeRepositoryImpl,
    CommitteeMemberRepositoryImpl,
)
from ..schemas import (
    CommitteeCreate,
    CommitteeResponse,
    CommitteeEndSession,
    CommitteeApproveMinutes,
    CommitteeMemberCreate,
    CommitteeMemberResponse,
    CommitteeMemberAttendance,
)

router = APIRouter(prefix="/committees", tags=["Committees"])


def get_committee_usecase(db: AsyncSession = Depends(get_db)) -> CommitteeUseCase:
    """Dependency injection for CommitteeUseCase."""
    committee_repo = CommitteeRepositoryImpl(db)
    member_repo = CommitteeMemberRepositoryImpl(db)
    return CommitteeUseCase(committee_repo, member_repo)


@router.post("", response_model=CommitteeResponse, status_code=status.HTTP_201_CREATED)
async def create_committee(
    data: CommitteeCreate,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Create a new committee."""
    committee = await usecase.create_committee(
        committee_type=data.committee_type,
        scheduled_date=data.scheduled_date,
        training_center_id=data.training_center_id,
        created_by=data.created_by,
        location=data.location,
        is_virtual=data.is_virtual,
        virtual_meeting_link=data.virtual_meeting_link,
        agenda=data.agenda,
    )
    return CommitteeResponse.model_validate(committee)


@router.get("", response_model=list[CommitteeResponse])
async def list_committees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """List all committees with pagination."""
    committees = await usecase.list_committees(skip, limit)
    return [CommitteeResponse.model_validate(c) for c in committees]


@router.get("/{committee_id}", response_model=CommitteeResponse)
async def get_committee(
    committee_id: UUID,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Get committee by ID."""
    committee = await usecase.get_committee(committee_id)
    if not committee:
        raise HTTPException(status_code=404, detail="Committee not found")
    return CommitteeResponse.model_validate(committee)


@router.get("/date-range/", response_model=list[CommitteeResponse])
async def get_committees_by_date_range(
    start_date: date,
    end_date: date,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Get committees within a date range."""
    committees = await usecase.get_committees_by_date_range(start_date, end_date)
    return [CommitteeResponse.model_validate(c) for c in committees]


@router.get("/next/{training_center_id}", response_model=CommitteeResponse)
async def get_next_scheduled(
    training_center_id: UUID,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Get next scheduled committee for a training center."""
    committee = await usecase.get_next_scheduled(training_center_id)
    if not committee:
        raise HTTPException(status_code=404, detail="No scheduled committee found")
    return CommitteeResponse.model_validate(committee)


@router.post("/{committee_id}/start", response_model=CommitteeResponse)
async def start_session(
    committee_id: UUID,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Start a committee session."""
    try:
        committee = await usecase.start_session(committee_id)
        return CommitteeResponse.model_validate(committee)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{committee_id}/end", response_model=CommitteeResponse)
async def end_session(
    committee_id: UUID,
    data: CommitteeEndSession,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """End a committee session."""
    try:
        committee = await usecase.end_session(committee_id, data.minutes)
        return CommitteeResponse.model_validate(committee)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{committee_id}/approve-minutes", response_model=CommitteeResponse)
async def approve_minutes(
    committee_id: UUID,
    data: CommitteeApproveMinutes,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Approve committee minutes."""
    try:
        committee = await usecase.approve_minutes(committee_id, data.approved_by)
        return CommitteeResponse.model_validate(committee)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{committee_id}/cancel", response_model=CommitteeResponse)
async def cancel_committee(
    committee_id: UUID,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Cancel a scheduled committee."""
    try:
        committee = await usecase.cancel_committee(committee_id)
        return CommitteeResponse.model_validate(committee)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{committee_id}/postpone", response_model=CommitteeResponse)
async def postpone_committee(
    committee_id: UUID,
    new_date: date,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Postpone a committee to a new date."""
    try:
        committee = await usecase.postpone_committee(committee_id, new_date)
        return CommitteeResponse.model_validate(committee)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Member endpoints
@router.post(
    "/{committee_id}/members",
    response_model=CommitteeMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_member(
    committee_id: UUID,
    data: CommitteeMemberCreate,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Add a member to a committee."""
    member = await usecase.add_member(
        committee_id=committee_id,
        user_id=data.user_id,
        role=data.role,
        has_voting_rights=data.has_voting_rights,
    )
    return CommitteeMemberResponse.model_validate(member)


@router.get("/{committee_id}/members", response_model=list[CommitteeMemberResponse])
async def get_members(
    committee_id: UUID,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Get all members of a committee."""
    members = await usecase.get_committee_members(committee_id)
    return [CommitteeMemberResponse.model_validate(m) for m in members]


@router.post("/members/{member_id}/attendance", response_model=CommitteeMemberResponse)
async def record_attendance(
    member_id: UUID,
    data: CommitteeMemberAttendance,
    usecase: CommitteeUseCase = Depends(get_committee_usecase),
):
    """Record member attendance."""
    try:
        member = await usecase.record_attendance(
            member_id=member_id,
            is_present=data.is_present,
            justification=data.justification_for_absence,
        )
        return CommitteeMemberResponse.model_validate(member)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
