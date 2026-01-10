"""Alert use cases for AI Service."""

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta

from app.domain.entities.alert import Alert, AlertType, AlertSeverity, AlertStatus
from app.domain.entities.prediction_result import PredictionResult, PredictionType
from app.domain.repositories.alert_repository import AlertRepositoryInterface
from app.domain.repositories.prediction_repository import (
    PredictionResultRepositoryInterface,
)
from app.domain.exceptions import (
    AlertNotFoundError,
    InvalidAlertDataError,
    AlertStatusError,
)


class CreateAlertUseCase:
    """Use case for creating alerts."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(
        self,
        alert_type: AlertType,
        title: str,
        description: str,
        subject_id: Optional[UUID] = None,
        subject_type: str = "user",
        severity: AlertSeverity = AlertSeverity.MEDIUM,
        prediction_id: Optional[UUID] = None,
        created_by: Optional[UUID] = None,
        assigned_to: Optional[UUID] = None,
        data: Optional[Dict[str, Any]] = None,
        expires_in_days: Optional[int] = None,
    ) -> Alert:
        """Create a new alert."""

        if not title.strip():
            raise InvalidAlertDataError("Alert title is required")

        if not description.strip():
            raise InvalidAlertDataError("Alert description is required")

        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)

        alert = Alert(
            alert_type=alert_type,
            severity=severity,
            title=title,
            description=description,
            subject_id=subject_id,
            subject_type=subject_type,
            prediction_id=prediction_id,
            created_by=created_by,
            assigned_to=assigned_to,
            data=data or {},
            expires_at=expires_at,
        )

        return await self.alert_repository.create(alert)


class GetAlertByIdUseCase:
    """Use case for getting alert by ID."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(self, alert_id: UUID) -> Alert:
        """Get alert by ID."""
        alert = await self.alert_repository.get_by_id(alert_id)
        if not alert:
            raise AlertNotFoundError(f"Alert with ID {alert_id} not found")
        return alert


class GetActiveAlertsUseCase:
    """Use case for getting active alerts."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(
        self,
        alert_type: Optional[AlertType] = None,
        severity: Optional[AlertSeverity] = None,
        limit: int = 100,
    ) -> List[Alert]:
        """Get active alerts."""
        return await self.alert_repository.get_active_alerts(
            alert_type, severity, limit
        )


class GetCriticalAlertsUseCase:
    """Use case for getting critical alerts."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(self, limit: int = 50) -> List[Alert]:
        """Get critical alerts."""
        return await self.alert_repository.get_critical_alerts(limit)


class AcknowledgeAlertUseCase:
    """Use case for acknowledging alerts."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(self, alert_id: UUID, acknowledged_by: UUID) -> Alert:
        """Acknowledge an alert."""
        alert = await self.alert_repository.get_by_id(alert_id)
        if not alert:
            raise AlertNotFoundError(f"Alert with ID {alert_id} not found")

        if alert.status != AlertStatus.ACTIVO:
            raise AlertStatusError("Only active alerts can be acknowledged")

        return await self.alert_repository.acknowledge_alert(alert_id, acknowledged_by)


class ResolveAlertUseCase:
    """Use case for resolving alerts."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(
        self, alert_id: UUID, resolved_by: UUID, resolution_notes: Optional[str] = None
    ) -> Alert:
        """Resolve an alert."""
        alert = await self.alert_repository.get_by_id(alert_id)
        if not alert:
            raise AlertNotFoundError(f"Alert with ID {alert_id} not found")

        if alert.status in [AlertStatus.RESOLVED, AlertStatus.DISMISSED]:
            raise AlertStatusError("Alert is already resolved or dismissed")

        return await self.alert_repository.resolve_alert(
            alert_id, resolved_by, resolution_notes
        )


class AssignAlertUseCase:
    """Use case for assigning alerts."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(self, alert_id: UUID, assigned_to: UUID) -> Alert:
        """Assign alert to a user."""
        alert = await self.alert_repository.get_by_id(alert_id)
        if not alert:
            raise AlertNotFoundError(f"Alert with ID {alert_id} not found")

        return await self.alert_repository.assign_alert(alert_id, assigned_to)


class GenerateAutomaticAlertsUseCase:
    """Use case for generating automatic alerts from predictions."""

    def __init__(
        self,
        alert_repository: AlertRepositoryInterface,
        prediction_repository: PredictionResultRepositoryInterface,
    ):
        self.alert_repository = alert_repository
        self.prediction_repository = prediction_repository

    async def execute(self) -> List[Alert]:
        """Generate automatic alerts based on high-risk predictions."""
        created_alerts = []

        # Get high-confidence predictions
        high_risk_predictions = (
            await self.prediction_repository.get_high_confidence_predictions(
                confidence_threshold=0.7
            )
        )

        for prediction in high_risk_predictions:
            # Check if alert already exists for this prediction
            existing_alerts = await self.alert_repository.get_by_subject_id(
                prediction.subject_id,
                alert_type=self._get_alert_type_for_prediction(
                    prediction.prediction_type
                ),
            )

            # Skip if recent alert exists
            if any(
                alert.prediction_id == prediction.prediction_id
                for alert in existing_alerts
            ):
                continue

            alert = await self._create_alert_from_prediction(prediction)
            if alert:
                created_alerts.append(alert)

        return created_alerts

    def _get_alert_type_for_prediction(
        self, prediction_type: PredictionType
    ) -> AlertType:
        """Map prediction type to alert type."""
        mapping = {
            PredictionType.ATTENDANCE: AlertType.ATTENDANCE_RISK,
            PredictionType.DROPOUT: AlertType.DROPOUT_WARNING,
            PredictionType.PERFORMANCE: AlertType.PERFORMANCE_ISSUE,
            PredictionType.ACADEMIC_RISK: AlertType.ACADEMIC_RISK,
        }
        return mapping.get(prediction_type, AlertType.SYSTEM_ALERT)

    async def _create_alert_from_prediction(
        self, prediction: PredictionResult
    ) -> Optional[Alert]:
        """Create alert from prediction."""
        alert_type = self._get_alert_type_for_prediction(prediction.prediction_type)

        # Determine severity based on confidence
        if prediction.confidence >= 0.9:
            severity = AlertSeverity.CRITICAL
        elif prediction.confidence >= 0.8:
            severity = AlertSeverity.HIGH
        elif prediction.confidence >= 0.7:
            severity = AlertSeverity.MEDIUM
        else:
            severity = AlertSeverity.LOW

        # Generate title and description
        title, description = self._generate_alert_content(prediction)

        create_usecase = CreateAlertUseCase(self.alert_repository)
        return await create_usecase.execute(
            alert_type=alert_type,
            title=title,
            description=description,
            subject_id=prediction.subject_id,
            subject_type=prediction.subject_type,
            severity=severity,
            prediction_id=prediction.prediction_id,
            data={
                "confidence": prediction.confidence,
                "prediction_data": prediction.prediction_data,
            },
            expires_in_days=30,
        )

    def _generate_alert_content(self, prediction: PredictionResult) -> tuple[str, str]:
        """Generate alert title and description from prediction."""
        if prediction.prediction_type == PredictionType.ATTENDANCE:
            title = f"Riesgo de Inasistencia - Confianza: {prediction.confidence:.1%}"
            description = f"Se ha detectado un alto riesgo de inasistencia. {prediction.get_recommendation()}"
        elif prediction.prediction_type == PredictionType.DROPOUT:
            title = f"Riesgo de Deserción - Confianza: {prediction.confidence:.1%}"
            description = f"Se ha detectado un alto riesgo de deserción académica. {prediction.get_recommendation()}"
        elif prediction.prediction_type == PredictionType.PERFORMANCE:
            title = f"Riesgo de Rendimiento - Confianza: {prediction.confidence:.1%}"
            description = f"Se ha detectado un riesgo en el rendimiento académico. {prediction.get_recommendation()}"
        else:
            title = f"Alerta Académica - Confianza: {prediction.confidence:.1%}"
            description = f"Se ha detectado una situación que requiere atención. {prediction.get_recommendation()}"

        return title, description


class GetUserAlertsUseCase:
    """Use case for getting user-specific alerts."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(
        self,
        user_id: UUID,
        assigned_only: bool = False,
        status: Optional[AlertStatus] = None,
        limit: int = 50,
    ) -> List[Alert]:
        """Get alerts for a specific user."""
        if assigned_only:
            return await self.alert_repository.get_by_assigned_user(
                user_id, status, limit
            )
        else:
            return await self.alert_repository.get_by_subject_id(
                user_id, status=status, limit=limit
            )


class GetAlertStatisticsUseCase:
    """Use case for getting alert statistics."""

    def __init__(self, alert_repository: AlertRepositoryInterface):
        self.alert_repository = alert_repository

    async def execute(self, days: int = 30) -> Dict[str, Any]:
        """Get alert statistics."""
        stats = await self.alert_repository.get_alert_statistics(days)

        # Add calculated metrics
        total_alerts = stats.get("total_alerts", 0)
        resolved_alerts = stats.get("resolved_alerts", 0)

        if total_alerts > 0:
            stats["resolution_rate"] = resolved_alerts / total_alerts
        else:
            stats["resolution_rate"] = 0.0

        return stats
