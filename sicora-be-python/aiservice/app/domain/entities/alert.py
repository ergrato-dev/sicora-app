"""Alert entity for AI Service."""

from datetime import datetime
from typing import Dict, Any, Optional, List
from uuid import UUID
import uuid
from enum import Enum


class AlertType(str, Enum):
    """Types of alerts."""

    RIESGO_ASISTENCIA = "RIESGO_ASISTENCIA"
    ALERTA_DESERCION = "ALERTA_DESERCION"
    PROBLEMA_RENDIMIENTO = "PROBLEMA_RENDIMIENTO"
    RIESGO_ACADEMICO = "RIESGO_ACADEMICO"
    ALERTA_SISTEMA = "ALERTA_SISTEMA"


class AlertSeverity(str, Enum):
    """Alert severity levels."""

    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"
    CRITICO = "CRITICO"


class AlertStatus(str, Enum):
    """Alert status."""

    ACTIVO = "ACTIVO"
    RECONOCIDO = "RECONOCIDO"
    RESUELTO = "RESUELTO"
    DESCARTADO = "DESCARTADO"


class Alert:
    """Alert domain entity for automated notifications."""

    def __init__(
        self,
        alert_id: Optional[UUID] = None,
        alert_type: AlertType = AlertType.ALERTA_SISTEMA,
        severity: AlertSeverity = AlertSeverity.MEDIO,
        title: str = "",
        description: str = "",
        subject_id: Optional[UUID] = None,  # Related user, ficha, etc.
        subject_type: str = "user",
        prediction_id: Optional[UUID] = None,  # Related prediction if any
        status: AlertStatus = AlertStatus.ACTIVO,
        created_by: Optional[UUID] = None,  # System or user who created
        assigned_to: Optional[UUID] = None,  # Who should handle this
        data: Optional[Dict[str, Any]] = None,
        actions_taken: Optional[List[Dict[str, Any]]] = None,
        created_at: Optional[datetime] = None,
        acknowledged_at: Optional[datetime] = None,
        resolved_at: Optional[datetime] = None,
        expires_at: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.alert_id = alert_id or uuid.uuid4()
        self.alert_type = alert_type
        self.severity = severity
        self.title = title
        self.description = description
        self.subject_id = subject_id
        self.subject_type = subject_type
        self.prediction_id = prediction_id
        self.status = status
        self.created_by = created_by
        self.assigned_to = assigned_to
        self.data = data or {}
        self.actions_taken = actions_taken or []
        self.created_at = created_at or datetime.utcnow()
        self.acknowledged_at = acknowledged_at
        self.resolved_at = resolved_at
        self.expires_at = expires_at
        self.metadata = metadata or {}

    def acknowledge(self, acknowledged_by: UUID) -> None:
        """Acknowledge the alert."""
        self.status = AlertStatus.ACKNOWLEDGED
        self.acknowledged_at = datetime.utcnow()
        self.add_action("acknowledged", {"acknowledged_by": str(acknowledged_by)})

    def resolve(
        self, resolved_by: UUID, resolution_notes: Optional[str] = None
    ) -> None:
        """Resolve the alert."""
        self.status = AlertStatus.RESOLVED
        self.resolved_at = datetime.utcnow()
        action_data = {"resolved_by": str(resolved_by)}
        if resolution_notes:
            action_data["resolution_notes"] = resolution_notes
        self.add_action("resolved", action_data)

    def dismiss(self, dismissed_by: UUID, reason: Optional[str] = None) -> None:
        """Dismiss the alert."""
        self.status = AlertStatus.DISMISSED
        action_data = {"dismissed_by": str(dismissed_by)}
        if reason:
            action_data["reason"] = reason
        self.add_action("dismissed", action_data)

    def add_action(self, action_type: str, action_data: Dict[str, Any]) -> None:
        """Add an action to the alert history."""
        action = {
            "action_type": action_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": action_data,
        }
        self.actions_taken.append(action)

    def assign_to(self, user_id: UUID) -> None:
        """Assign alert to a user."""
        self.assigned_to = user_id
        self.add_action("assigned", {"assigned_to": str(user_id)})

    def is_expired(self) -> bool:
        """Check if alert has expired."""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at

    def is_critical(self) -> bool:
        """Check if alert is critical."""
        return self.severity == AlertSeverity.CRITICO

    def is_active(self) -> bool:
        """Check if alert is still active."""
        return self.status == AlertStatus.ACTIVO and not self.is_expired()

    def get_age_in_hours(self) -> float:
        """Get alert age in hours."""
        delta = datetime.utcnow() - self.created_at
        return delta.total_seconds() / 3600

    def update_metadata(self, key: str, value: Any) -> None:
        """Update alert metadata."""
        self.metadata[key] = value

    def to_dict(self) -> Dict[str, Any]:
        """Convert alert to dictionary."""
        return {
            "alert_id": str(self.alert_id),
            "alert_type": self.alert_type.value,
            "severity": self.severity.value,
            "title": self.title,
            "description": self.description,
            "subject_id": str(self.subject_id) if self.subject_id else None,
            "subject_type": self.subject_type,
            "prediction_id": str(self.prediction_id) if self.prediction_id else None,
            "status": self.status.value,
            "created_by": str(self.created_by) if self.created_by else None,
            "assigned_to": str(self.assigned_to) if self.assigned_to else None,
            "data": self.data,
            "actions_taken": self.actions_taken,
            "created_at": self.created_at.isoformat(),
            "acknowledged_at": (
                self.acknowledged_at.isoformat() if self.acknowledged_at else None
            ),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_expired": self.is_expired(),
            "is_critical": self.is_critical(),
            "is_active": self.is_active(),
            "age_hours": self.get_age_in_hours(),
            "metadata": self.metadata,
        }

    def __str__(self) -> str:
        return f"Alert(id={self.alert_id}, type={self.alert_type}, severity={self.severity}, status={self.status})"

    def __repr__(self) -> str:
        return self.__str__()
