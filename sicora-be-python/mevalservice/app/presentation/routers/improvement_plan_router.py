"""
Improvement plan router - API endpoints for improvement plan management.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...application.usecases import ImprovementPlanUseCase
from ...infrastructure.database.base import get_db
from ...infrastructure.repositories import ImprovementPlanRepositoryImpl
from ..schemas import (
    ImprovementPlanCreate,
    ImprovementPlanResponse,
    ImprovementPlanReview,
    ImprovementPlanExtend,
)
from ...domain.entities import Objective, Activity, SuccessCriteria

router = APIRouter(prefix="/improvement-plans", tags=["Improvement Plans"])


def get_improvement_plan_usecase(
    db: AsyncSession = Depends(get_db),
) -> ImprovementPlanUseCase:
    """Dependency injection for ImprovementPlanUseCase."""
    plan_repo = ImprovementPlanRepositoryImpl(db)
    return ImprovementPlanUseCase(plan_repo)


@router.post(
    "", response_model=ImprovementPlanResponse, status_code=status.HTTP_201_CREATED
)
async def create_plan(
    data: ImprovementPlanCreate,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Create a new improvement plan."""
    objectives = [
        Objective(
            id=obj.id,
            description=obj.description,
            target_value=obj.target_value,
            current_value=obj.current_value,
            is_completed=obj.is_completed,
        )
        for obj in data.objectives
    ]
    activities = [
        Activity(
            id=act.id,
            description=act.description,
            due_date=act.due_date,
            completed_date=act.completed_date,
            responsible_id=act.responsible_id,
            status=act.status,
            notes=act.notes,
        )
        for act in data.activities
    ]
    criteria = [
        SuccessCriteria(
            id=crit.id,
            description=crit.description,
            measurement_method=crit.measurement_method,
            target_value=crit.target_value,
            achieved_value=crit.achieved_value,
            is_met=crit.is_met,
        )
        for crit in data.success_criteria
    ]

    plan = await usecase.create_plan(
        student_case_id=data.student_case_id,
        student_id=data.student_id,
        plan_type=data.plan_type,
        title=data.title,
        start_date=data.start_date,
        end_date=data.end_date,
        supervisor_id=data.supervisor_id,
        description=data.description,
        support_instructor_id=data.support_instructor_id,
        objectives=objectives,
        activities=activities,
        success_criteria=criteria,
    )
    return ImprovementPlanResponse.model_validate(plan)


@router.get("", response_model=list[ImprovementPlanResponse])
async def list_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """List all improvement plans with pagination."""
    plans = await usecase.list_plans(skip, limit)
    return [ImprovementPlanResponse.model_validate(p) for p in plans]


@router.get("/active", response_model=list[ImprovementPlanResponse])
async def get_active_plans(
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Get all active plans."""
    plans = await usecase.get_active_plans()
    return [ImprovementPlanResponse.model_validate(p) for p in plans]


@router.get("/overdue", response_model=list[ImprovementPlanResponse])
async def get_overdue_plans(
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Get all overdue plans."""
    plans = await usecase.get_overdue_plans()
    return [ImprovementPlanResponse.model_validate(p) for p in plans]


@router.get("/ending-soon", response_model=list[ImprovementPlanResponse])
async def get_plans_ending_soon(
    days: int = Query(7, ge=1, le=30),
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Get plans ending within specified days."""
    plans = await usecase.get_plans_ending_soon(days)
    return [ImprovementPlanResponse.model_validate(p) for p in plans]


@router.get("/student/{student_id}", response_model=list[ImprovementPlanResponse])
async def get_student_plans(
    student_id: UUID,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Get all plans for a student."""
    plans = await usecase.get_student_plans(student_id)
    return [ImprovementPlanResponse.model_validate(p) for p in plans]


@router.get("/supervisor/{supervisor_id}", response_model=list[ImprovementPlanResponse])
async def get_supervisor_plans(
    supervisor_id: UUID,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Get plans supervised by a user."""
    plans = await usecase.get_supervisor_plans(supervisor_id)
    return [ImprovementPlanResponse.model_validate(p) for p in plans]


@router.get("/{plan_id}", response_model=ImprovementPlanResponse)
async def get_plan(
    plan_id: UUID,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Get plan by ID."""
    plan = await usecase.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Improvement plan not found")
    return ImprovementPlanResponse.model_validate(plan)


@router.post("/{plan_id}/activate", response_model=ImprovementPlanResponse)
async def activate_plan(
    plan_id: UUID,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Activate a draft plan."""
    try:
        plan = await usecase.activate_plan(plan_id)
        return ImprovementPlanResponse.model_validate(plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{plan_id}/review", response_model=ImprovementPlanResponse)
async def review_plan(
    plan_id: UUID,
    data: ImprovementPlanReview,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Review and update plan compliance."""
    try:
        plan = await usecase.review_plan(
            plan_id=plan_id,
            compliance_percentage=data.compliance_percentage,
            review_notes=data.review_notes,
            next_review_date=data.next_review_date,
        )
        return ImprovementPlanResponse.model_validate(plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{plan_id}/complete", response_model=ImprovementPlanResponse)
async def complete_plan(
    plan_id: UUID,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Mark plan as completed."""
    try:
        plan = await usecase.complete_plan(plan_id)
        return ImprovementPlanResponse.model_validate(plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{plan_id}/fail", response_model=ImprovementPlanResponse)
async def fail_plan(
    plan_id: UUID,
    reason: str,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Mark plan as failed."""
    try:
        plan = await usecase.fail_plan(plan_id, reason)
        return ImprovementPlanResponse.model_validate(plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{plan_id}/extend", response_model=ImprovementPlanResponse)
async def extend_plan(
    plan_id: UUID,
    data: ImprovementPlanExtend,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Extend plan duration."""
    try:
        plan = await usecase.extend_plan(plan_id, data.new_end_date, data.reason)
        return ImprovementPlanResponse.model_validate(plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{plan_id}/sign-commitment", response_model=ImprovementPlanResponse)
async def sign_commitment(
    plan_id: UUID,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Record student commitment signature."""
    try:
        plan = await usecase.sign_commitment(plan_id)
        return ImprovementPlanResponse.model_validate(plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{plan_id}/cancel", response_model=ImprovementPlanResponse)
async def cancel_plan(
    plan_id: UUID,
    usecase: ImprovementPlanUseCase = Depends(get_improvement_plan_usecase),
):
    """Cancel a plan."""
    try:
        plan = await usecase.cancel_plan(plan_id)
        return ImprovementPlanResponse.model_validate(plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
