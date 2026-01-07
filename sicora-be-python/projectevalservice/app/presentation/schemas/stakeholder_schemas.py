"""
Stakeholder Schemas - Pydantic models for stakeholder management endpoints.

Author: SICORA Team
Date: 2025
"""

from pydantic import BaseModel, Field, UUID4, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class StakeholderTypeSchema(str, Enum):
    """Tipos de stakeholder."""

    COMPANY = "company"
    GOVERNMENT = "government"
    NGO = "ngo"
    EDUCATIONAL_INSTITUTION = "educational_institution"
    INDIVIDUAL = "individual"
    INTERNAL_ONEVISION = "internal_onevision"


class StakeholderStatusSchema(str, Enum):
    """Estados del stakeholder."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    BLACKLISTED = "blacklisted"


class OrganizationSizeSchema(str, Enum):
    """Tamaños de organización."""

    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    ENTERPRISE = "enterprise"


# =============================================================================
# Request Schemas
# =============================================================================


class StakeholderCreateSchema(BaseModel):
    """Schema para crear un nuevo stakeholder."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Nombre del stakeholder/organización",
        example="TechCorp Colombia S.A.S",
    )
    stakeholder_type: StakeholderTypeSchema = Field(
        ..., description="Tipo de stakeholder", example=StakeholderTypeSchema.COMPANY
    )
    contact_person: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Nombre de la persona de contacto",
        example="María García",
    )
    email: EmailStr = Field(
        ..., description="Email de contacto", example="maria.garcia@techcorp.co"
    )
    phone: Optional[str] = Field(
        None,
        max_length=20,
        description="Teléfono de contacto",
        example="+57 300 123 4567",
    )
    address: Optional[str] = Field(
        None,
        max_length=500,
        description="Dirección física",
        example="Cra 15 # 100-50, Bogotá",
    )
    organization_size: Optional[OrganizationSizeSchema] = Field(
        None, description="Tamaño de la organización"
    )
    sector: Optional[str] = Field(
        None, max_length=100, description="Sector de la industria", example="Tecnología"
    )
    website: Optional[str] = Field(
        None, max_length=200, description="Sitio web", example="https://www.techcorp.co"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "TechCorp Colombia S.A.S",
                "stakeholder_type": "company",
                "contact_person": "María García",
                "email": "maria.garcia@techcorp.co",
                "phone": "+57 300 123 4567",
                "address": "Cra 15 # 100-50, Bogotá",
                "organization_size": "medium",
                "sector": "Tecnología",
                "website": "https://www.techcorp.co",
            }
        }


class StakeholderUpdateSchema(BaseModel):
    """Schema para actualizar un stakeholder."""

    name: Optional[str] = Field(None, min_length=2, max_length=200)
    contact_person: Optional[str] = Field(None, min_length=2, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    organization_size: Optional[OrganizationSizeSchema] = None
    sector: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=200)


class DocumentExpectationsSchema(BaseModel):
    """Schema para documentar expectativas del stakeholder."""

    expectations_summary: str = Field(
        ...,
        min_length=20,
        max_length=5000,
        description="Resumen de expectativas documentadas",
        example="El stakeholder espera un sistema de gestión de inventarios que...",
    )
    scope_limitations: Optional[str] = Field(
        None, max_length=2000, description="Limitaciones de alcance acordadas"
    )
    deliverables_agreed: List[str] = Field(
        default=[],
        description="Lista de entregables acordados",
        example=["Módulo de inventarios", "Dashboard de reportes", "API REST"],
    )

    class Config:
        json_schema_extra = {
            "example": {
                "expectations_summary": "El stakeholder espera un sistema de gestión de inventarios con seguimiento en tiempo real, reportes automatizados y alertas de stock bajo.",
                "scope_limitations": "No incluye integración con sistemas ERP externos en esta fase.",
                "deliverables_agreed": [
                    "Módulo de inventarios",
                    "Dashboard de reportes",
                    "API REST",
                    "Documentación técnica",
                ],
            }
        }


class AcknowledgeLimitationsSchema(BaseModel):
    """Schema para confirmar reconocimiento de limitaciones."""

    confirmation_text: str = Field(
        ...,
        min_length=50,
        description="Texto de confirmación del stakeholder",
        example="Confirmo que entiendo que este proyecto es desarrollado por aprendices...",
    )
    digital_signature: Optional[str] = Field(
        None, description="Firma digital o identificador de confirmación"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "confirmation_text": "Confirmo que entiendo que este proyecto es desarrollado por aprendices en formación de OneVision, y que el alcance está limitado a las competencias del programa de formación.",
                "digital_signature": "MGG-2025-001",
            }
        }


class EstablishCommunicationSchema(BaseModel):
    """Schema para establecer canal de comunicación."""

    primary_channel: str = Field(
        ..., description="Canal principal de comunicación", example="email"
    )
    secondary_channel: Optional[str] = Field(
        None, description="Canal secundario de comunicación", example="teams"
    )
    meeting_frequency: str = Field(
        ..., description="Frecuencia de reuniones de seguimiento", example="quincenal"
    )
    escalation_contact: Optional[str] = Field(
        None, description="Contacto de escalamiento"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "primary_channel": "email",
                "secondary_channel": "teams",
                "meeting_frequency": "quincenal",
                "escalation_contact": "director@techcorp.co",
            }
        }


class ScopeChangeRequestSchema(BaseModel):
    """Schema para solicitud de cambio de alcance."""

    change_description: str = Field(
        ...,
        min_length=20,
        max_length=2000,
        description="Descripción del cambio solicitado",
    )
    justification: str = Field(
        ..., min_length=20, max_length=1000, description="Justificación del cambio"
    )
    impact_assessment: Optional[str] = Field(
        None, max_length=1000, description="Evaluación del impacto"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "change_description": "Agregar módulo de facturación electrónica",
                "justification": "Requerimiento legal que entra en vigencia el próximo trimestre",
                "impact_assessment": "Impacto medio: requiere 3 semanas adicionales de desarrollo",
            }
        }


class SuspendStakeholderSchema(BaseModel):
    """Schema para suspender colaboración con stakeholder."""

    reason: str = Field(
        ..., min_length=20, max_length=1000, description="Razón de la suspensión"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "reason": "Incumplimiento de compromisos de comunicación durante más de 30 días"
            }
        }


# =============================================================================
# Response Schemas
# =============================================================================


class StakeholderResponseSchema(BaseModel):
    """Schema de respuesta para stakeholders."""

    id: UUID4
    name: str
    stakeholder_type: StakeholderTypeSchema
    status: StakeholderStatusSchema

    # Contact information
    contact_person: str
    email: str
    phone: Optional[str]
    address: Optional[str]

    # Organization details
    organization_size: Optional[str]
    sector: Optional[str]
    website: Optional[str]

    # OneVision collaboration
    previous_collaborations: int
    expectations_documented: bool
    limitations_acknowledged: bool
    communication_channel_established: bool

    # Governance
    scope_change_requests: int
    scope_changes_approved: int
    scope_changes_rejected: int
    last_interaction_date: Optional[datetime]

    # Metadata
    created_at: datetime
    updated_at: datetime
    created_by: UUID4

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "TechCorp Colombia S.A.S",
                "stakeholder_type": "company",
                "status": "active",
                "contact_person": "María García",
                "email": "maria.garcia@techcorp.co",
                "phone": "+57 300 123 4567",
                "address": "Cra 15 # 100-50, Bogotá",
                "organization_size": "medium",
                "sector": "Tecnología",
                "website": "https://www.techcorp.co",
                "previous_collaborations": 2,
                "expectations_documented": True,
                "limitations_acknowledged": True,
                "communication_channel_established": True,
                "scope_change_requests": 3,
                "scope_changes_approved": 2,
                "scope_changes_rejected": 1,
                "last_interaction_date": "2025-07-10T14:30:00Z",
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-07-10T14:30:00Z",
                "created_by": "123e4567-e89b-12d3-a456-426614174001",
            }
        }


class StakeholderListResponseSchema(BaseModel):
    """Schema de respuesta para lista de stakeholders."""

    items: List[StakeholderResponseSchema]
    total: int
    page: int
    page_size: int

    class Config:
        json_schema_extra = {
            "example": {"items": [], "total": 15, "page": 1, "page_size": 20}
        }


class CollaborationReadinessSchema(BaseModel):
    """Schema de respuesta para estado de preparación de colaboración."""

    stakeholder_id: UUID4
    stakeholder_name: str
    is_ready: bool
    missing_requirements: List[str]
    recommendations: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "stakeholder_id": "123e4567-e89b-12d3-a456-426614174000",
                "stakeholder_name": "TechCorp Colombia S.A.S",
                "is_ready": False,
                "missing_requirements": [
                    "expectations_documented",
                    "communication_channel_established",
                ],
                "recommendations": [
                    "Documentar expectativas del proyecto",
                    "Establecer canal de comunicación formal",
                ],
            }
        }


class StakeholderStatsSchema(BaseModel):
    """Schema de respuesta para estadísticas de stakeholders."""

    total_stakeholders: int
    active_stakeholders: int
    collaboration_ready: int
    pending_expectations: int
    pending_acknowledgment: int
    pending_communication: int
    by_type: dict
    by_status: dict

    class Config:
        json_schema_extra = {
            "example": {
                "total_stakeholders": 25,
                "active_stakeholders": 20,
                "collaboration_ready": 15,
                "pending_expectations": 3,
                "pending_acknowledgment": 2,
                "pending_communication": 5,
                "by_type": {
                    "company": 15,
                    "government": 5,
                    "ngo": 3,
                    "educational_institution": 2,
                },
                "by_status": {"active": 20, "inactive": 3, "suspended": 2},
            }
        }


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
