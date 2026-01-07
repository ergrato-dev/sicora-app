"""
Appeal router - API endpoints for appeal management.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...application.usecases import AppealUseCase
from ...infrastructure.database.base import get_db
from ...infrastructure.repositories import AppealRepositoryImpl, SanctionRepositoryImpl
from ..schemas import (
    AppealCreate,
    AppealResponse,
    AppealAdmissibilityReview,
    AppealDecisionSchema,
    AppealScheduleHearing,
    AddSupportingDocument,
)
from ...domain.entities import SupportingDocument

router = APIRouter(prefix="/appeals", tags=["Appeals"])


def get_appeal_usecase(db: AsyncSession = Depends(get_db)) -> AppealUseCase:
    """Dependency injection for AppealUseCase."""
    appeal_repo = AppealRepositoryImpl(db)
    sanction_repo = SanctionRepositoryImpl(db)
    return AppealUseCase(appeal_repo, sanction_repo)


@router.post("", response_model=AppealResponse, status_code=status.HTTP_201_CREATED)
async def file_appeal(
    data: AppealCreate,
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """File a new appeal against a sanction."""
    documents = [
        SupportingDocument(
            document_id=doc.document_id,
            document_type=doc.document_type,
            file_path=doc.file_path,
            uploaded_at=doc.uploaded_at,
            description=doc.description,
        )
        for doc in data.supporting_documents
    ]

    try:
        appeal = await usecase.file_appeal(
            sanction_id=data.sanction_id,
            student_id=data.student_id,
            filed_by=data.filed_by,
            grounds=data.grounds,
            supporting_documents=documents,
        )
        return AppealResponse.model_validate(appeal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[AppealResponse])
async def list_appeals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """List all appeals with pagination."""
    appeals = await usecase.list_appeals(skip, limit)
    return [AppealResponse.model_validate(a) for a in appeals]


@router.get("/pending", response_model=list[AppealResponse])
async def get_pending_appeals(
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Get all pending appeals."""
    appeals = await usecase.get_pending_appeals()
    return [AppealResponse.model_validate(a) for a in appeals]


@router.get("/admitted", response_model=list[AppealResponse])
async def get_admitted_appeals(
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Get all admitted appeals awaiting hearing."""
    appeals = await usecase.get_admitted_appeals()
    return [AppealResponse.model_validate(a) for a in appeals]


@router.get("/near-deadline", response_model=list[AppealResponse])
async def get_appeals_near_deadline(
    days: int = Query(3, ge=1, le=14),
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Get appeals near processing deadline."""
    appeals = await usecase.get_appeals_near_deadline(days)
    return [AppealResponse.model_validate(a) for a in appeals]


@router.get("/student/{student_id}", response_model=list[AppealResponse])
async def get_student_appeals(
    student_id: UUID,
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Get all appeals for a student."""
    appeals = await usecase.get_student_appeals(student_id)
    return [AppealResponse.model_validate(a) for a in appeals]


@router.get("/{appeal_id}", response_model=AppealResponse)
async def get_appeal(
    appeal_id: UUID,
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Get appeal by ID."""
    appeal = await usecase.get_appeal(appeal_id)
    if not appeal:
        raise HTTPException(status_code=404, detail="Appeal not found")
    return AppealResponse.model_validate(appeal)


@router.post("/{appeal_id}/admissibility", response_model=AppealResponse)
async def review_admissibility(
    appeal_id: UUID,
    data: AppealAdmissibilityReview,
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Review appeal admissibility."""
    try:
        appeal = await usecase.review_admissibility(
            appeal_id=appeal_id,
            status=data.admissibility_status,
            reviewer_id=data.reviewer_id,
            notes=data.notes,
        )
        return AppealResponse.model_validate(appeal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{appeal_id}/schedule-hearing", response_model=AppealResponse)
async def schedule_hearing(
    appeal_id: UUID,
    data: AppealScheduleHearing,
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Schedule appeal hearing with appeals committee."""
    try:
        appeal = await usecase.schedule_hearing(
            appeal_id=appeal_id,
            committee_id=data.appeal_committee_id,
            hearing_date=data.hearing_date,
        )
        return AppealResponse.model_validate(appeal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{appeal_id}/decide", response_model=AppealResponse)
async def decide_appeal(
    appeal_id: UUID,
    data: AppealDecisionSchema,
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Record appeal decision."""
    try:
        appeal = await usecase.decide_appeal(
            appeal_id=appeal_id,
            decision=data.decision,
            rationale=data.decision_rationale,
            decided_by=data.decided_by,
            new_sanction_id=data.new_sanction_id,
        )
        return AppealResponse.model_validate(appeal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{appeal_id}/notify", response_model=AppealResponse)
async def notify_student(
    appeal_id: UUID,
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Mark appeal decision as notified to student."""
    try:
        appeal = await usecase.notify_student(appeal_id)
        return AppealResponse.model_validate(appeal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{appeal_id}/documents", response_model=AppealResponse)
async def add_supporting_document(
    appeal_id: UUID,
    data: AddSupportingDocument,
    usecase: AppealUseCase = Depends(get_appeal_usecase),
):
    """Add supporting document to appeal."""
    try:
        appeal = await usecase.add_supporting_document(
            appeal_id=appeal_id,
            document_type=data.document_type,
            file_path=data.file_path,
            description=data.description,
        )
        return AppealResponse.model_validate(appeal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
