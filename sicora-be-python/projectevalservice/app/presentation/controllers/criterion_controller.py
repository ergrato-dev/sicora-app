"""
Criterion Controller - REST API endpoints for evaluation criteria management.

This controller exposes endpoints for:
- RF-13: CRUD de Criterios con aprobación del Comité Pedagógico

Author: SICORA Team
Date: 2025
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from typing import Optional
from uuid import UUID

from ..schemas.criterion_schemas import (
    CriterionCreateSchema,
    CriterionApproveSchema,
    CriterionRejectSchema,
    CriterionDeactivateSchema,
    CriterionResponseSchema,
    CriterionListResponseSchema,
    CriterionHistoryResponseSchema,
    CriterionChangeHistoryResponseSchema,
    CriterionStatusSchema,
    CriterionCategorySchema,
    MessageResponseSchema,
)
from ...application.use_cases.criteria_use_cases import (
    CreateCriterionUseCase,
    SubmitCriterionForApprovalUseCase,
    ApproveCriterionUseCase,
    RejectCriterionUseCase,
    GetCriterionUseCase,
    GetCriteriaUseCase,
    GetCriterionHistoryUseCase,
    DeactivateCriterionUseCase,
)
from ...domain.entities import CriterionStatus, CriterionCategory
from ...infrastructure.dependencies import get_criterion_repository

router = APIRouter(
    prefix="/criteria",
    tags=["Criteria - RF-13"],
    responses={
        404: {"description": "Criterio no encontrado"},
        400: {"description": "Solicitud inválida"},
        500: {"description": "Error interno del servidor"},
    },
)


def _map_status_to_domain(status: CriterionStatusSchema) -> CriterionStatus:
    """Map schema status to domain status."""
    return CriterionStatus(status.value)


def _map_category_to_domain(category: CriterionCategorySchema) -> CriterionCategory:
    """Map schema category to domain category."""
    return CriterionCategory(category.value)


# =============================================================================
# CREATE Operations
# =============================================================================


@router.post(
    "/",
    response_model=CriterionResponseSchema,
    status_code=http_status.HTTP_201_CREATED,
    summary="Crear nuevo criterio de evaluación",
    description="""
    Crea un nuevo criterio de evaluación en estado DRAFT.
    
    El criterio debe ser aprobado por el Comité Pedagógico antes de activarse.
    Requiere aprobación unánime (3 miembros) para nuevos criterios.
    """,
)
async def create_criterion(
    criterion_data: CriterionCreateSchema,
    created_by: UUID = Query(..., description="ID del usuario que crea el criterio"),
    criterion_repository=Depends(get_criterion_repository),
):
    """Create a new evaluation criterion."""
    use_case = CreateCriterionUseCase(criterion_repository)

    try:
        criterion = await use_case.execute(
            code=criterion_data.code,
            title=criterion_data.title,
            description=criterion_data.description,
            category=_map_category_to_domain(criterion_data.category),
            is_required=criterion_data.is_required,
            points=criterion_data.points,
            created_by=created_by,
            effective_date=criterion_data.effective_date,
            expiration_date=criterion_data.expiration_date,
        )
        return CriterionResponseSchema.model_validate(criterion)
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear criterio: {str(e)}",
        )


# =============================================================================
# APPROVAL Workflow Operations
# =============================================================================


@router.post(
    "/{criterion_id}/submit-for-approval",
    response_model=CriterionResponseSchema,
    summary="Enviar criterio para aprobación",
    description="""
    Envía un criterio en estado DRAFT para aprobación del Comité Pedagógico.
    
    Solo criterios en estado DRAFT pueden ser enviados a aprobación.
    """,
)
async def submit_criterion_for_approval(
    criterion_id: UUID,
    submitted_by: UUID = Query(..., description="ID del usuario que envía"),
    criterion_repository=Depends(get_criterion_repository),
):
    """Submit criterion for approval."""
    use_case = SubmitCriterionForApprovalUseCase(criterion_repository)

    try:
        criterion = await use_case.execute(
            criterion_id=criterion_id,
            submitted_by=submitted_by,
        )
        if not criterion:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Criterio {criterion_id} no encontrado",
            )
        return CriterionResponseSchema.model_validate(criterion)
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al enviar criterio: {str(e)}",
        )


@router.post(
    "/{criterion_id}/approve",
    response_model=CriterionResponseSchema,
    summary="Aprobar criterio",
    description="""
    Aprueba un criterio de evaluación.
    
    Requiere:
    - 3 aprobaciones unánimes para nuevos criterios (version=1)
    - 2 aprobaciones para modificaciones de criterios existentes
    
    El criterio se activa automáticamente cuando alcanza las aprobaciones requeridas.
    """,
)
async def approve_criterion(
    criterion_id: UUID,
    approval_data: CriterionApproveSchema,
    approver_id: UUID = Query(..., description="ID del miembro del Comité Pedagógico"),
    criterion_repository=Depends(get_criterion_repository),
):
    """Approve a criterion."""
    use_case = ApproveCriterionUseCase(criterion_repository)

    try:
        criterion = await use_case.execute(
            criterion_id=criterion_id,
            approver_id=approver_id,
            comments=approval_data.comments,
        )
        if not criterion:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Criterio {criterion_id} no encontrado",
            )
        return CriterionResponseSchema.model_validate(criterion)
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al aprobar criterio: {str(e)}",
        )


@router.post(
    "/{criterion_id}/reject",
    response_model=CriterionResponseSchema,
    summary="Rechazar criterio",
    description="""
    Rechaza un criterio de evaluación.
    
    El criterio vuelve a estado DRAFT para correcciones.
    Se registra la razón del rechazo en el historial.
    """,
)
async def reject_criterion(
    criterion_id: UUID,
    rejection_data: CriterionRejectSchema,
    rejector_id: UUID = Query(..., description="ID del miembro del Comité Pedagógico"),
    criterion_repository=Depends(get_criterion_repository),
):
    """Reject a criterion."""
    use_case = RejectCriterionUseCase(criterion_repository)

    try:
        criterion = await use_case.execute(
            criterion_id=criterion_id,
            rejector_id=rejector_id,
            rejection_reason=rejection_data.rejection_reason,
        )
        if not criterion:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Criterio {criterion_id} no encontrado",
            )
        return CriterionResponseSchema.model_validate(criterion)
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al rechazar criterio: {str(e)}",
        )


# =============================================================================
# READ Operations
# =============================================================================


@router.get(
    "/{criterion_id}",
    response_model=CriterionResponseSchema,
    summary="Obtener criterio por ID",
    description="Obtiene los detalles de un criterio de evaluación específico.",
)
async def get_criterion(
    criterion_id: UUID,
    criterion_repository=Depends(get_criterion_repository),
):
    """Get criterion by ID."""
    use_case = GetCriterionUseCase(criterion_repository)

    try:
        criterion = await use_case.execute(criterion_id=criterion_id)
        if not criterion:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Criterio {criterion_id} no encontrado",
            )
        return CriterionResponseSchema.model_validate(criterion)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener criterio: {str(e)}",
        )


@router.get(
    "/",
    response_model=CriterionListResponseSchema,
    summary="Listar criterios de evaluación",
    description="""
    Lista todos los criterios de evaluación con filtros opcionales.
    
    Filtros disponibles:
    - status: Estado del criterio (draft, pending_approval, active, inactive)
    - category: Categoría (architecture, data_management, ui_ux, etc.)
    - is_required: Si el criterio es obligatorio
    - active_only: Solo criterios activos y vigentes
    """,
)
async def list_criteria(
    status: Optional[CriterionStatusSchema] = Query(
        None, description="Filtrar por estado"
    ),
    category: Optional[CriterionCategorySchema] = Query(
        None, description="Filtrar por categoría"
    ),
    is_required: Optional[bool] = Query(None, description="Filtrar por obligatoriedad"),
    active_only: bool = Query(False, description="Solo criterios activos"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    criterion_repository=Depends(get_criterion_repository),
):
    """List criteria with optional filters."""
    use_case = GetCriteriaUseCase(criterion_repository)

    try:
        criteria = await use_case.execute(
            status=_map_status_to_domain(status) if status else None,
            category=_map_category_to_domain(category) if category else None,
            is_required=is_required,
            active_only=active_only,
        )

        # Pagination
        total = len(criteria)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_criteria = criteria[start_idx:end_idx]

        return CriterionListResponseSchema(
            items=[
                CriterionResponseSchema.model_validate(c) for c in paginated_criteria
            ],
            total=total,
            page=page,
            page_size=page_size,
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar criterios: {str(e)}",
        )


@router.get(
    "/{criterion_id}/history",
    response_model=CriterionHistoryResponseSchema,
    summary="Obtener historial de cambios de criterio",
    description="""
    Obtiene el historial completo de cambios de un criterio.
    
    Incluye:
    - Creación inicial
    - Envíos a aprobación
    - Aprobaciones y rechazos
    - Desactivaciones
    """,
)
async def get_criterion_history(
    criterion_id: UUID,
    criterion_repository=Depends(get_criterion_repository),
):
    """Get change history for a criterion."""
    use_case = GetCriterionHistoryUseCase(criterion_repository)

    try:
        history = await use_case.execute(criterion_id=criterion_id)
        return CriterionHistoryResponseSchema(
            criterion_id=criterion_id,
            history=[
                CriterionChangeHistoryResponseSchema.model_validate(h) for h in history
            ],
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener historial: {str(e)}",
        )


# =============================================================================
# DEACTIVATE Operations
# =============================================================================


@router.post(
    "/{criterion_id}/deactivate",
    response_model=CriterionResponseSchema,
    summary="Desactivar criterio",
    description="""
    Desactiva un criterio de evaluación activo.
    
    Solo criterios en estado ACTIVE pueden ser desactivados.
    La desactivación se registra en el historial con la razón proporcionada.
    """,
)
async def deactivate_criterion(
    criterion_id: UUID,
    deactivation_data: CriterionDeactivateSchema,
    deactivated_by: UUID = Query(..., description="ID del usuario que desactiva"),
    criterion_repository=Depends(get_criterion_repository),
):
    """Deactivate a criterion."""
    use_case = DeactivateCriterionUseCase(criterion_repository)

    try:
        criterion = await use_case.execute(
            criterion_id=criterion_id,
            deactivated_by=deactivated_by,
            reason=deactivation_data.reason,
        )
        if not criterion:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Criterio {criterion_id} no encontrado",
            )
        return CriterionResponseSchema.model_validate(criterion)
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al desactivar criterio: {str(e)}",
        )


# =============================================================================
# Statistics Endpoint
# =============================================================================


@router.get(
    "/stats/summary",
    response_model=MessageResponseSchema,
    summary="Obtener estadísticas de criterios",
    description="Obtiene un resumen estadístico de los criterios de evaluación.",
)
async def get_criteria_stats(
    criterion_repository=Depends(get_criterion_repository),
):
    """Get criteria statistics."""
    use_case = GetCriteriaUseCase(criterion_repository)

    try:
        all_criteria = await use_case.execute()
        active_criteria = [
            c for c in all_criteria if c.status == CriterionStatus.ACTIVE
        ]
        pending_criteria = [
            c for c in all_criteria if c.status == CriterionStatus.PENDING_APPROVAL
        ]
        draft_criteria = [c for c in all_criteria if c.status == CriterionStatus.DRAFT]

        # Count by category
        category_counts = {}
        for criterion in active_criteria:
            cat = criterion.category.value
            category_counts[cat] = category_counts.get(cat, 0) + 1

        stats = {
            "total": len(all_criteria),
            "active": len(active_criteria),
            "pending_approval": len(pending_criteria),
            "draft": len(draft_criteria),
            "inactive": len(all_criteria)
            - len(active_criteria)
            - len(pending_criteria)
            - len(draft_criteria),
            "required_count": len([c for c in active_criteria if c.is_required]),
            "optional_count": len([c for c in active_criteria if not c.is_required]),
            "total_points": sum(c.points for c in active_criteria),
            "by_category": category_counts,
        }

        return MessageResponseSchema(
            message="Estadísticas de criterios obtenidas exitosamente",
            success=True,
            data=stats,
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}",
        )
