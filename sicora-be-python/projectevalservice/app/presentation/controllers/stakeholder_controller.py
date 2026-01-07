"""
Stakeholder Controller - REST API endpoints for stakeholder management.

This controller exposes endpoints for:
- RF-06: Gestión de Stakeholders

Author: SICORA Team
Date: 2025
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from uuid import UUID

from ..schemas.stakeholder_schemas import (
    StakeholderCreateSchema,
    StakeholderUpdateSchema,
    StakeholderResponseSchema,
    StakeholderListResponseSchema,
    DocumentExpectationsSchema,
    AcknowledgeLimitationsSchema,
    EstablishCommunicationSchema,
    ScopeChangeRequestSchema,
    SuspendStakeholderSchema,
    CollaborationReadinessSchema,
    StakeholderStatsSchema,
    StakeholderTypeSchema,
    StakeholderStatusSchema,
)
from ...application.use_cases.stakeholder_use_cases import (
    CreateStakeholderUseCase,
    GetStakeholderUseCase,
    UpdateStakeholderUseCase,
    ListStakeholdersUseCase,
    DocumentExpectationsUseCase,
    AcknowledgeLimitationsUseCase,
    EstablishCommunicationChannelUseCase,
    RecordScopeChangeRequestUseCase,
    SuspendStakeholderUseCase,
    ReactivateStakeholderUseCase,
    CheckCollaborationReadinessUseCase,
    GetStakeholderStatsUseCase,
)
from ...domain.entities.stakeholder import StakeholderType, StakeholderStatus
from ...infrastructure.dependencies import get_stakeholder_repository

router = APIRouter(
    prefix="/stakeholders",
    tags=["Stakeholders - RF-06"],
    responses={
        404: {"description": "Stakeholder no encontrado"},
        400: {"description": "Solicitud inválida"},
        500: {"description": "Error interno del servidor"},
    },
)


def _map_type_to_domain(stype: StakeholderTypeSchema) -> StakeholderType:
    """Map schema type to domain type."""
    return StakeholderType(stype.value)


def _map_status_to_domain(sstatus: StakeholderStatusSchema) -> StakeholderStatus:
    """Map schema status to domain status."""
    return StakeholderStatus(sstatus.value)


# =============================================================================
# CRUD Operations
# =============================================================================


@router.post(
    "/",
    response_model=StakeholderResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo stakeholder",
    description="""
    Crea un nuevo stakeholder en el sistema.
    
    El stakeholder inicia en estado ACTIVE pero no está listo para colaboración
    hasta completar el proceso de onboarding:
    1. Documentar expectativas
    2. Reconocer limitaciones del contexto formativo
    3. Establecer canal de comunicación
    """,
)
async def create_stakeholder(
    stakeholder_data: StakeholderCreateSchema,
    created_by: UUID = Query(..., description="ID del usuario que crea el stakeholder"),
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Create a new stakeholder."""
    use_case = CreateStakeholderUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(
            name=stakeholder_data.name,
            stakeholder_type=_map_type_to_domain(stakeholder_data.stakeholder_type),
            contact_person=stakeholder_data.contact_person,
            email=stakeholder_data.email,
            created_by=created_by,
            phone=stakeholder_data.phone,
            address=stakeholder_data.address,
            organization_size=stakeholder_data.organization_size.value
            if stakeholder_data.organization_size
            else None,
            sector=stakeholder_data.sector,
            website=stakeholder_data.website,
        )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear stakeholder: {str(e)}",
        )


@router.get(
    "/{stakeholder_id}",
    response_model=StakeholderResponseSchema,
    summary="Obtener stakeholder por ID",
    description="Obtiene los detalles de un stakeholder específico.",
)
async def get_stakeholder(
    stakeholder_id: UUID,
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Get stakeholder by ID."""
    use_case = GetStakeholderUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(stakeholder_id=stakeholder_id)
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stakeholder {stakeholder_id} no encontrado",
            )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener stakeholder: {str(e)}",
        )


@router.patch(
    "/{stakeholder_id}",
    response_model=StakeholderResponseSchema,
    summary="Actualizar stakeholder",
    description="Actualiza información del stakeholder.",
)
async def update_stakeholder(
    stakeholder_id: UUID,
    update_data: StakeholderUpdateSchema,
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Update stakeholder information."""
    use_case = UpdateStakeholderUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(
            stakeholder_id=stakeholder_id,
            name=update_data.name,
            contact_person=update_data.contact_person,
            email=update_data.email,
            phone=update_data.phone,
            address=update_data.address,
            organization_size=update_data.organization_size.value
            if update_data.organization_size
            else None,
            sector=update_data.sector,
            website=update_data.website,
        )
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stakeholder {stakeholder_id} no encontrado",
            )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar stakeholder: {str(e)}",
        )


@router.get(
    "/",
    response_model=StakeholderListResponseSchema,
    summary="Listar stakeholders",
    description="""
    Lista todos los stakeholders con filtros opcionales.
    
    Filtros disponibles:
    - status: Estado del stakeholder (active, inactive, suspended, blacklisted)
    - stakeholder_type: Tipo (company, government, ngo, educational_institution, individual)
    - collaboration_ready: Solo stakeholders listos para colaboración
    """,
)
async def list_stakeholders(
    sstatus: Optional[StakeholderStatusSchema] = Query(
        None, alias="status", description="Filtrar por estado"
    ),
    stakeholder_type: Optional[StakeholderTypeSchema] = Query(
        None, description="Filtrar por tipo"
    ),
    collaboration_ready: Optional[bool] = Query(
        None, description="Solo listos para colaboración"
    ),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """List stakeholders with filters."""
    use_case = ListStakeholdersUseCase(stakeholder_repository)

    try:
        stakeholders = await use_case.execute(
            status=_map_status_to_domain(sstatus) if sstatus else None,
            stakeholder_type=_map_type_to_domain(stakeholder_type)
            if stakeholder_type
            else None,
            collaboration_ready=collaboration_ready,
        )

        # Pagination
        total = len(stakeholders)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated = stakeholders[start_idx:end_idx]

        return StakeholderListResponseSchema(
            items=[StakeholderResponseSchema.model_validate(s) for s in paginated],
            total=total,
            page=page,
            page_size=page_size,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar stakeholders: {str(e)}",
        )


# =============================================================================
# Onboarding Operations (RF-06)
# =============================================================================


@router.post(
    "/{stakeholder_id}/document-expectations",
    response_model=StakeholderResponseSchema,
    summary="Documentar expectativas del stakeholder",
    description="""
    Documenta las expectativas del stakeholder para el proyecto.
    
    Paso 1 del proceso de onboarding. Debe incluir:
    - Resumen de expectativas
    - Limitaciones de alcance acordadas
    - Entregables acordados
    """,
)
async def document_expectations(
    stakeholder_id: UUID,
    expectations_data: DocumentExpectationsSchema,
    documented_by: UUID = Query(..., description="ID del usuario que documenta"),
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Document stakeholder expectations."""
    use_case = DocumentExpectationsUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(
            stakeholder_id=stakeholder_id,
            documented_by=documented_by,
            expectations_summary=expectations_data.expectations_summary,
            scope_limitations=expectations_data.scope_limitations,
            deliverables_agreed=expectations_data.deliverables_agreed,
        )
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stakeholder {stakeholder_id} no encontrado",
            )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al documentar expectativas: {str(e)}",
        )


@router.post(
    "/{stakeholder_id}/acknowledge-limitations",
    response_model=StakeholderResponseSchema,
    summary="Confirmar reconocimiento de limitaciones",
    description="""
    Registra que el stakeholder ha reconocido las limitaciones del contexto formativo.
    
    Paso 2 del proceso de onboarding. El stakeholder debe entender que:
    - El proyecto es desarrollado por aprendices en formación
    - El alcance está limitado a las competencias del programa
    - Los tiempos están sujetos al calendario académico
    """,
)
async def acknowledge_limitations(
    stakeholder_id: UUID,
    acknowledgment_data: AcknowledgeLimitationsSchema,
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Record stakeholder acknowledgment of limitations."""
    use_case = AcknowledgeLimitationsUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(
            stakeholder_id=stakeholder_id,
            confirmation_text=acknowledgment_data.confirmation_text,
            digital_signature=acknowledgment_data.digital_signature,
        )
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stakeholder {stakeholder_id} no encontrado",
            )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar reconocimiento: {str(e)}",
        )


@router.post(
    "/{stakeholder_id}/establish-communication",
    response_model=StakeholderResponseSchema,
    summary="Establecer canal de comunicación",
    description="""
    Establece el canal de comunicación formal con el stakeholder.
    
    Paso 3 del proceso de onboarding. Incluye:
    - Canal principal (email, teams, etc.)
    - Canal secundario
    - Frecuencia de reuniones
    - Contacto de escalamiento
    """,
)
async def establish_communication(
    stakeholder_id: UUID,
    communication_data: EstablishCommunicationSchema,
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Establish communication channel with stakeholder."""
    use_case = EstablishCommunicationChannelUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(
            stakeholder_id=stakeholder_id,
            primary_channel=communication_data.primary_channel,
            secondary_channel=communication_data.secondary_channel,
            meeting_frequency=communication_data.meeting_frequency,
            escalation_contact=communication_data.escalation_contact,
        )
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stakeholder {stakeholder_id} no encontrado",
            )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al establecer comunicación: {str(e)}",
        )


# =============================================================================
# Governance Operations (RF-11)
# =============================================================================


@router.post(
    "/{stakeholder_id}/scope-change-request",
    response_model=StakeholderResponseSchema,
    summary="Registrar solicitud de cambio de alcance",
    description="""
    Registra una solicitud de cambio de alcance del stakeholder.
    
    El sistema lleva control de:
    - Total de solicitudes
    - Solicitudes aprobadas
    - Solicitudes rechazadas
    
    Esto permite evaluar la estabilidad de la relación con el stakeholder.
    """,
)
async def record_scope_change_request(
    stakeholder_id: UUID,
    change_data: ScopeChangeRequestSchema,
    approved: bool = Query(..., description="Si el cambio fue aprobado"),
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Record a scope change request."""
    use_case = RecordScopeChangeRequestUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(
            stakeholder_id=stakeholder_id,
            change_description=change_data.change_description,
            justification=change_data.justification,
            approved=approved,
            impact_assessment=change_data.impact_assessment,
        )
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stakeholder {stakeholder_id} no encontrado",
            )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar cambio de alcance: {str(e)}",
        )


# =============================================================================
# Status Management
# =============================================================================


@router.post(
    "/{stakeholder_id}/suspend",
    response_model=StakeholderResponseSchema,
    summary="Suspender colaboración con stakeholder",
    description="""
    Suspende la colaboración con un stakeholder.
    
    Solo stakeholders ACTIVE pueden ser suspendidos.
    Se registra la razón de la suspensión.
    """,
)
async def suspend_stakeholder(
    stakeholder_id: UUID,
    suspension_data: SuspendStakeholderSchema,
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Suspend stakeholder collaboration."""
    use_case = SuspendStakeholderUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(
            stakeholder_id=stakeholder_id,
            reason=suspension_data.reason,
        )
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stakeholder {stakeholder_id} no encontrado",
            )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al suspender stakeholder: {str(e)}",
        )


@router.post(
    "/{stakeholder_id}/reactivate",
    response_model=StakeholderResponseSchema,
    summary="Reactivar stakeholder",
    description="""
    Reactiva un stakeholder suspendido o inactivo.
    
    El stakeholder vuelve a estado ACTIVE.
    """,
)
async def reactivate_stakeholder(
    stakeholder_id: UUID,
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Reactivate suspended stakeholder."""
    use_case = ReactivateStakeholderUseCase(stakeholder_repository)

    try:
        stakeholder = await use_case.execute(stakeholder_id=stakeholder_id)
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stakeholder {stakeholder_id} no encontrado",
            )
        return StakeholderResponseSchema.model_validate(stakeholder)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al reactivar stakeholder: {str(e)}",
        )


# =============================================================================
# Analytics Endpoints
# =============================================================================


@router.get(
    "/{stakeholder_id}/collaboration-readiness",
    response_model=CollaborationReadinessSchema,
    summary="Verificar preparación para colaboración",
    description="""
    Verifica si un stakeholder está listo para colaboración.
    
    Retorna:
    - Estado de preparación
    - Requisitos faltantes
    - Recomendaciones para completar onboarding
    """,
)
async def check_collaboration_readiness(
    stakeholder_id: UUID,
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Check stakeholder collaboration readiness."""
    use_case = CheckCollaborationReadinessUseCase(stakeholder_repository)

    try:
        readiness = await use_case.execute(stakeholder_id=stakeholder_id)
        return CollaborationReadinessSchema(**readiness)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al verificar preparación: {str(e)}",
        )


@router.get(
    "/stats/summary",
    response_model=StakeholderStatsSchema,
    summary="Obtener estadísticas de stakeholders",
    description="Obtiene un resumen estadístico de todos los stakeholders.",
)
async def get_stakeholder_stats(
    stakeholder_repository=Depends(get_stakeholder_repository),
):
    """Get stakeholder statistics."""
    use_case = GetStakeholderStatsUseCase(stakeholder_repository)

    try:
        stats = await use_case.execute()
        return StakeholderStatsSchema(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}",
        )
