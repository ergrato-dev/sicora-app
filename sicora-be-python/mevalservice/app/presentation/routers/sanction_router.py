"""
Sanction router - API endpoints for sanction management.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...application.usecases import SanctionUseCase
from ...infrastructure.database.base import get_db
from ...infrastructure.repositories import SanctionRepositoryImpl
from ..schemas import (
    SanctionCreate,
    SanctionResponse,
    SanctionComplianceUpdate,
)

router = APIRouter(prefix="/sanctions", tags=["Sanctions"])


def get_sanction_usecase(db: AsyncSession = Depends(get_db)) -> SanctionUseCase:
    """Dependency injection for SanctionUseCase."""
    sanction_repo = SanctionRepositoryImpl(db)
    return SanctionUseCase(sanction_repo)


@router.post("", response_model=SanctionResponse, status_code=status.HTTP_201_CREATED)
async def create_sanction(
    data: SanctionCreate,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Create a new sanction."""
    sanction = await usecase.create_sanction(
        student_case_id=data.student_case_id,
        student_id=data.student_id,
        sanction_type=data.sanction_type,
        severity_level=data.severity_level,
        description=data.description,
        legal_basis=data.legal_basis,
        effective_date=data.effective_date,
        imposed_by=data.imposed_by,
        end_date=data.end_date,
        conditions=data.conditions,
        is_appealable=data.is_appealable,
    )
    return SanctionResponse.model_validate(sanction)


@router.get("", response_model=list[SanctionResponse])
async def list_sanctions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """List all sanctions with pagination."""
    sanctions = await usecase.list_sanctions(skip, limit)
    return [SanctionResponse.model_validate(s) for s in sanctions]


@router.get("/active", response_model=list[SanctionResponse])
async def get_active_sanctions(
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Get all active sanctions."""
    sanctions = await usecase.get_active_sanctions()
    return [SanctionResponse.model_validate(s) for s in sanctions]


@router.get("/appealable", response_model=list[SanctionResponse])
async def get_appealable_sanctions(
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Get sanctions that can still be appealed."""
    sanctions = await usecase.get_appealable_sanctions()
    return [SanctionResponse.model_validate(s) for s in sanctions]


@router.get("/expiring-soon", response_model=list[SanctionResponse])
async def get_expiring_soon(
    days: int = Query(7, ge=1, le=30),
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Get sanctions expiring within specified days."""
    sanctions = await usecase.get_expiring_soon(days)
    return [SanctionResponse.model_validate(s) for s in sanctions]


@router.get("/student/{student_id}", response_model=list[SanctionResponse])
async def get_student_sanctions(
    student_id: UUID,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Get all sanctions for a student."""
    sanctions = await usecase.get_student_sanctions(student_id)
    return [SanctionResponse.model_validate(s) for s in sanctions]


@router.get("/student/{student_id}/recidivism-count")
async def get_recidivism_count(
    student_id: UUID,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Get number of previous sanctions for a student."""
    count = await usecase.get_recidivism_count(student_id)
    return {"student_id": str(student_id), "recidivism_count": count}


@router.get("/{sanction_id}", response_model=SanctionResponse)
async def get_sanction(
    sanction_id: UUID,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Get sanction by ID."""
    sanction = await usecase.get_sanction(sanction_id)
    if not sanction:
        raise HTTPException(status_code=404, detail="Sanction not found")
    return SanctionResponse.model_validate(sanction)


@router.get("/{sanction_id}/can-appeal")
async def check_can_appeal(
    sanction_id: UUID,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Check if a sanction can still be appealed."""
    can_appeal = await usecase.check_can_appeal(sanction_id)
    return {"sanction_id": str(sanction_id), "can_appeal": can_appeal}


@router.post("/{sanction_id}/notify-student", response_model=SanctionResponse)
async def notify_student(
    sanction_id: UUID,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Mark sanction as notified to student."""
    try:
        sanction = await usecase.notify_student(sanction_id)
        return SanctionResponse.model_validate(sanction)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{sanction_id}/notify-parent", response_model=SanctionResponse)
async def notify_parent(
    sanction_id: UUID,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Mark sanction as notified to parent."""
    try:
        sanction = await usecase.notify_parent(sanction_id)
        return SanctionResponse.model_validate(sanction)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{sanction_id}/compliance", response_model=SanctionResponse)
async def update_compliance(
    sanction_id: UUID,
    data: SanctionComplianceUpdate,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Update compliance status."""
    try:
        sanction = await usecase.update_compliance(
            sanction_id=sanction_id,
            status=data.compliance_status,
            notes=data.compliance_notes,
        )
        return SanctionResponse.model_validate(sanction)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{sanction_id}/deactivate", response_model=SanctionResponse)
async def deactivate_sanction(
    sanction_id: UUID,
    usecase: SanctionUseCase = Depends(get_sanction_usecase),
):
    """Deactivate a sanction."""
    try:
        sanction = await usecase.deactivate_sanction(sanction_id)
        return SanctionResponse.model_validate(sanction)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
