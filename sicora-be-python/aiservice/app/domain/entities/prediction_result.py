"""Prediction Result entity for AI Service."""

from datetime import datetime
from typing import Dict, Any, Optional
from uuid import UUID
import uuid
from enum import Enum


class PredictionType(str, Enum):
    """Types of predictions available."""

    ASISTENCIA = "ASISTENCIA"
    DESERCION = "DESERCION"
    RENDIMIENTO = "RENDIMIENTO"
    RIESGO_ACADEMICO = "RIESGO_ACADEMICO"


class PredictionStatus(str, Enum):
    """Status of predictions."""

    PENDIENTE = "PENDIENTE"
    PROCESANDO = "PROCESANDO"
    COMPLETADO = "COMPLETADO"
    FALLIDO = "FALLIDO"


class ConfidenceLevel(str, Enum):
    """Confidence levels for predictions."""

    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"
    MUY_ALTO = "MUY_ALTO"


class PredictionResult:
    """Prediction Result domain entity representing AI predictions."""

    def __init__(
        self,
        prediction_id: Optional[UUID] = None,
        prediction_type: PredictionType = PredictionType.ASISTENCIA,
        subject_id: Optional[UUID] = None,  # User ID or entity being predicted
        subject_type: str = "user",  # user, ficha, programa, etc.
        confidence: float = 0.0,
        confidence_level: Optional[ConfidenceLevel] = None,
        prediction_data: Optional[Dict[str, Any]] = None,
        raw_data: Optional[Dict[str, Any]] = None,
        model_used: Optional[str] = None,
        status: PredictionStatus = PredictionStatus.PENDIENTE,
        created_by: Optional[UUID] = None,
        created_at: Optional[datetime] = None,
        expires_at: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.prediction_id = prediction_id or uuid.uuid4()
        self.prediction_type = prediction_type
        self.subject_id = subject_id
        self.subject_type = subject_type
        self.confidence = confidence
        self.confidence_level = confidence_level or self._calculate_confidence_level(
            confidence
        )
        self.prediction_data = prediction_data or {}
        self.raw_data = raw_data or {}
        self.model_used = model_used
        self.status = status
        self.created_by = created_by
        self.created_at = created_at or datetime.utcnow()
        self.expires_at = expires_at
        self.metadata = metadata or {}

    def _calculate_confidence_level(self, confidence: float) -> ConfidenceLevel:
        """Calculate confidence level based on confidence score."""
        if confidence >= 0.9:
            return ConfidenceLevel.MUY_ALTO
        elif confidence >= 0.7:
            return ConfidenceLevel.ALTO
        elif confidence >= 0.5:
            return ConfidenceLevel.MEDIO
        else:
            return ConfidenceLevel.BAJO

    def update_status(self, new_status: PredictionStatus) -> None:
        """Update prediction status."""
        self.status = new_status

    def add_metadata(self, key: str, value: Any) -> None:
        """Add metadata to prediction."""
        self.metadata[key] = value

    def is_expired(self) -> bool:
        """Check if prediction has expired."""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at

    def is_high_confidence(self) -> bool:
        """Check if prediction has high confidence."""
        return self.confidence_level in [
            ConfidenceLevel.HIGH,
            ConfidenceLevel.VERY_HIGH,
        ]

    def get_recommendation(self) -> str:
        """Get recommendation based on prediction."""
        if self.prediction_type == PredictionType.DROPOUT and self.is_high_confidence():
            return "Intervención inmediata recomendada"
        elif (
            self.prediction_type == PredictionType.ATTENDANCE and self.confidence > 0.8
        ):
            return "Monitoreo cercano recomendado"
        elif (
            self.prediction_type == PredictionType.ACADEMIC_RISK
            and self.is_high_confidence()
        ):
            return "Apoyo académico recomendado"
        else:
            return "Continuar monitoreando"

    def to_dict(self) -> Dict[str, Any]:
        """Convert prediction to dictionary."""
        return {
            "prediction_id": str(self.prediction_id),
            "prediction_type": self.prediction_type.value,
            "subject_id": str(self.subject_id) if self.subject_id else None,
            "subject_type": self.subject_type,
            "confidence": self.confidence,
            "confidence_level": self.confidence_level.value,
            "prediction_data": self.prediction_data,
            "model_used": self.model_used,
            "status": self.status.value,
            "recommendation": self.get_recommendation(),
            "created_by": str(self.created_by) if self.created_by else None,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_expired": self.is_expired(),
            "metadata": self.metadata,
        }

    def __str__(self) -> str:
        return f"PredictionResult(id={self.prediction_id}, type={self.prediction_type}, confidence={self.confidence})"

    def __repr__(self) -> str:
        return self.__str__()
