"""
Student case router - API endpoints for student case management.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...application.usecases import StudentCaseUseCase
from ...infrastructure.database.base import get_db
from ...infrastructure.repositories import StudentCaseRepositoryImpl
from ..schemas import (
    StudentCaseCreate,
    StudentCaseResponse,
    StudentCaseAssignToCommittee,
    AddEvidenceDocument,
)
from ...domain.entities import DetectionCriteria

router = APIRouter(prefix="/cases", tags=["Student Cases"])


def get_student_case_usecase(db: AsyncSession = Depends(get_db)) -> StudentCaseUseCase:
    """Dependency injection for StudentCaseUseCase."""
    case_repo = StudentCaseRepositoryImpl(db)
    return StudentCaseUseCase(case_repo)


@router.post(
    "", response_model=StudentCaseResponse, status_code=status.HTTP_201_CREATED
)
async def create_case(
    data: StudentCaseCreate,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Create a new student case."""
    detection = None
    if data.detection_criteria:
        detection = DetectionCriteria(
            criterion_type=data.detection_criteria.criterion_type,
            threshold_value=data.detection_criteria.threshold_value,
            actual_value=data.detection_criteria.actual_value,
            period_start=data.detection_criteria.period_start,
            period_end=data.detection_criteria.period_end,
        )

    case = await usecase.create_case(
        student_id=data.student_id,
        program_id=data.program_id,
        case_type=data.case_type,
        description=data.description,
        reported_by=data.reported_by,
        is_auto_detected=data.is_auto_detected,
        detection_criteria=detection,
        priority_level=data.priority_level,
    )
    return StudentCaseResponse.model_validate(case)


@router.get("", response_model=list[StudentCaseResponse])
async def list_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """List all student cases with pagination."""
    cases = await usecase.list_cases(skip, limit)
    return [StudentCaseResponse.model_validate(c) for c in cases]


@router.get("/pending", response_model=list[StudentCaseResponse])
async def get_pending_cases(
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Get all pending cases."""
    cases = await usecase.get_pending_cases()
    return [StudentCaseResponse.model_validate(c) for c in cases]


@router.get("/auto-detected", response_model=list[StudentCaseResponse])
async def get_auto_detected_cases(
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Get all auto-detected cases."""
    cases = await usecase.get_auto_detected_cases()
    return [StudentCaseResponse.model_validate(c) for c in cases]


@router.get("/student/{student_id}", response_model=list[StudentCaseResponse])
async def get_student_cases(
    student_id: UUID,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Get all cases for a student."""
    cases = await usecase.get_student_cases(student_id)
    return [StudentCaseResponse.model_validate(c) for c in cases]


@router.get("/program/{program_id}", response_model=list[StudentCaseResponse])
async def get_cases_by_program(
    program_id: UUID,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Get all cases for a program."""
    cases = await usecase.get_cases_by_program(program_id)
    return [StudentCaseResponse.model_validate(c) for c in cases]


@router.get("/{case_id}", response_model=StudentCaseResponse)
async def get_case(
    case_id: UUID,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Get case by ID."""
    case = await usecase.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return StudentCaseResponse.model_validate(case)


@router.post("/{case_id}/assign", response_model=StudentCaseResponse)
async def assign_to_committee(
    case_id: UUID,
    data: StudentCaseAssignToCommittee,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Assign case to a committee."""
    try:
        case = await usecase.assign_to_committee(case_id, data.committee_id)
        return StudentCaseResponse.model_validate(case)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/start-review", response_model=StudentCaseResponse)
async def start_review(
    case_id: UUID,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Start reviewing a case."""
    try:
        case = await usecase.start_review(case_id)
        return StudentCaseResponse.model_validate(case)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/deliberate", response_model=StudentCaseResponse)
async def start_deliberation(
    case_id: UUID,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Start deliberation on a case."""
    try:
        case = await usecase.start_deliberation(case_id)
        return StudentCaseResponse.model_validate(case)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/decide", response_model=StudentCaseResponse)
async def mark_decided(
    case_id: UUID,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Mark case as decided."""
    try:
        case = await usecase.mark_decided(case_id)
        return StudentCaseResponse.model_validate(case)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/close", response_model=StudentCaseResponse)
async def close_case(
    case_id: UUID,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Close a case."""
    try:
        case = await usecase.close_case(case_id)
        return StudentCaseResponse.model_validate(case)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/archive", response_model=StudentCaseResponse)
async def archive_case(
    case_id: UUID,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Archive a closed case."""
    try:
        case = await usecase.archive_case(case_id)
        return StudentCaseResponse.model_validate(case)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/evidence", response_model=StudentCaseResponse)
async def add_evidence(
    case_id: UUID,
    data: AddEvidenceDocument,
    usecase: StudentCaseUseCase = Depends(get_student_case_usecase),
):
    """Add evidence document to a case."""
    try:
        case = await usecase.add_evidence(
            case_id=case_id,
            document_type=data.document_type,
            file_path=data.file_path,
            uploaded_by=data.uploaded_by,
            description=data.description,
        )
        return StudentCaseResponse.model_validate(case)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
