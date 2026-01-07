"""
Criterion Schemas - Pydantic models for evaluation criteria endpoints.

Author: SICORA Team
Date: 2025
"""

from pydantic import BaseModel, Field, UUID4
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CriterionStatusSchema(str, Enum):
    """Estado de un criterio de evaluación."""

    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    INACTIVE = "inactive"


class CriterionCategorySchema(str, Enum):
    """Categorías de criterios de evaluación."""

    ARCHITECTURE = "architecture"
    DATA_MANAGEMENT = "data_management"
    UI_UX = "ui_ux"
    FUNCTIONALITY = "functionality"
    SECURITY = "security"
    TESTING = "testing"
    VCS = "vcs"
    CI_CD = "ci_cd"
    DEPLOYMENT = "deployment"
    METHODOLOGY = "methodology"
    VOICE_NOTES = "voice_notes"
    DATABASE_VCS = "database_vcs"


class ApprovalStatusSchema(str, Enum):
    """Estado de aprobación de criterios."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# =============================================================================
# Request Schemas
# =============================================================================


class CriterionCreateSchema(BaseModel):
    """Schema para crear un nuevo criterio de evaluación."""

    code: str = Field(
        ...,
        min_length=5,
        max_length=10,
        description="Código único del criterio (ej: AR-001)",
        example="AR-001",
    )
    title: str = Field(
        ...,
        min_length=5,
        max_length=200,
        description="Título del criterio",
        example="Arquitectura Clean modular",
    )
    description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Descripción detallada del criterio",
        example="El proyecto implementa arquitectura Clean con separación de capas domain, application, infrastructure y presentation",
    )
    category: CriterionCategorySchema = Field(
        ...,
        description="Categoría del criterio",
        example=CriterionCategorySchema.ARCHITECTURE,
    )
    is_required: bool = Field(
        True, description="Si el criterio es obligatorio", example=True
    )
    points: int = Field(
        ..., ge=1, le=100, description="Puntos asignados al criterio", example=10
    )
    effective_date: Optional[datetime] = Field(
        None, description="Fecha de vigencia", example="2025-01-15T00:00:00Z"
    )
    expiration_date: Optional[datetime] = Field(
        None, description="Fecha de expiración", example="2025-12-31T23:59:59Z"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "code": "AR-001",
                "title": "Arquitectura Clean modular",
                "description": "El proyecto implementa arquitectura Clean con separación de capas domain, application, infrastructure y presentation",
                "category": "architecture",
                "is_required": True,
                "points": 10,
                "effective_date": "2025-01-15T00:00:00Z",
                "expiration_date": None,
            }
        }


class CriterionSubmitApprovalSchema(BaseModel):
    """Schema para enviar criterio a aprobación."""

    pass  # No additional fields needed


class CriterionApproveSchema(BaseModel):
    """Schema para aprobar un criterio."""

    comments: Optional[str] = Field(
        None,
        max_length=1000,
        description="Comentarios del aprobador",
        example="Criterio bien definido y alineado con objetivos pedagógicos",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "comments": "Criterio bien definido y alineado con objetivos pedagógicos"
            }
        }


class CriterionRejectSchema(BaseModel):
    """Schema para rechazar un criterio."""

    rejection_reason: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Razón del rechazo",
        example="El criterio necesita mayor especificidad en los criterios de cumplimiento",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "rejection_reason": "El criterio necesita mayor especificidad en los criterios de cumplimiento"
            }
        }


class CriterionDeactivateSchema(BaseModel):
    """Schema para desactivar un criterio."""

    reason: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Razón de la desactivación",
        example="Criterio obsoleto debido a cambio en estándares de la industria",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "reason": "Criterio obsoleto debido a cambio en estándares de la industria"
            }
        }


class CriterionFilterSchema(BaseModel):
    """Schema para filtros de búsqueda de criterios."""

    status: Optional[CriterionStatusSchema] = Field(
        None, description="Filtrar por estado"
    )
    category: Optional[CriterionCategorySchema] = Field(
        None, description="Filtrar por categoría"
    )
    is_required: Optional[bool] = Field(None, description="Filtrar por obligatoriedad")
    active_only: bool = Field(False, description="Solo criterios activos")


# =============================================================================
# Response Schemas
# =============================================================================


class CriterionApprovalResponseSchema(BaseModel):
    """Schema de respuesta para aprobaciones de criterios."""

    id: UUID4
    criterion_id: UUID4
    pedagogical_member_id: UUID4
    approval_status: ApprovalStatusSchema
    comments: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CriterionChangeHistoryResponseSchema(BaseModel):
    """Schema de respuesta para historial de cambios."""

    id: UUID4
    criterion_id: UUID4
    changed_by: UUID4
    change_type: str
    old_version: Optional[dict]
    new_version: dict
    change_reason: str
    created_at: datetime

    class Config:
        from_attributes = True


class CriterionResponseSchema(BaseModel):
    """Schema de respuesta para criterios de evaluación."""

    id: UUID4
    code: str
    title: str
    description: str
    category: CriterionCategorySchema
    status: CriterionStatusSchema
    is_required: bool
    points: int
    version: int
    created_at: datetime
    updated_at: datetime
    created_by: UUID4
    approved_by: Optional[List[UUID4]] = None
    rejection_reason: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "code": "AR-001",
                "title": "Arquitectura Clean modular",
                "description": "El proyecto implementa arquitectura Clean con separación de capas",
                "category": "architecture",
                "status": "active",
                "is_required": True,
                "points": 10,
                "version": 1,
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-01-15T10:00:00Z",
                "created_by": "123e4567-e89b-12d3-a456-426614174001",
                "approved_by": [
                    "123e4567-e89b-12d3-a456-426614174002",
                    "123e4567-e89b-12d3-a456-426614174003",
                    "123e4567-e89b-12d3-a456-426614174004",
                ],
                "rejection_reason": None,
                "effective_date": "2025-01-15T00:00:00Z",
                "expiration_date": None,
            }
        }


class CriterionListResponseSchema(BaseModel):
    """Schema de respuesta para lista de criterios."""

    items: List[CriterionResponseSchema]
    total: int
    page: int
    page_size: int

    class Config:
        json_schema_extra = {
            "example": {"items": [], "total": 25, "page": 1, "page_size": 20}
        }


class CriterionHistoryResponseSchema(BaseModel):
    """Schema de respuesta para historial de un criterio."""

    criterion_id: UUID4
    history: List[CriterionChangeHistoryResponseSchema]

    class Config:
        json_schema_extra = {
            "example": {
                "criterion_id": "123e4567-e89b-12d3-a456-426614174000",
                "history": [],
            }
        }


# =============================================================================
# Message Response Schema
# =============================================================================


class MessageResponseSchema(BaseModel):
    """Schema genérico para respuestas de mensaje."""

    message: str
    success: bool = True
    data: Optional[dict] = None

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Operación completada exitosamente",
                "success": True,
                "data": None,
            }
        }
