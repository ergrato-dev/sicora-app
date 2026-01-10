"""AI Model configuration entity."""

from datetime import datetime
from typing import Dict, Any, Optional, List
from uuid import UUID
import uuid
from enum import Enum


class ModelType(str, Enum):
    """AI Model types."""

    GPT_OPENAI = "GPT_OPENAI"
    CLAUDE_ANTHROPIC = "CLAUDE_ANTHROPIC"
    HUGGINGFACE = "HUGGINGFACE"
    LOCAL = "LOCAL"


class ModelStatus(str, Enum):
    """AI Model status."""

    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"
    MANTENIMIENTO = "MANTENIMIENTO"
    ERROR = "ERROR"


class AIModel:
    """AI Model configuration domain entity."""

    def __init__(
        self,
        model_id: Optional[UUID] = None,
        name: str = "",
        model_type: ModelType = ModelType.GPT_OPENAI,
        model_name: str = "",
        api_endpoint: Optional[str] = None,
        api_key_name: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        top_p: float = 1.0,
        frequency_penalty: float = 0.0,
        presence_penalty: float = 0.0,
        context_window: int = 4096,
        cost_per_token: float = 0.0,
        status: ModelStatus = ModelStatus.ACTIVO,
        metadata: Optional[Dict[str, Any]] = None,
        supported_features: Optional[List[str]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.model_id = model_id or uuid.uuid4()
        self.name = name
        self.model_type = model_type
        self.model_name = model_name
        self.api_endpoint = api_endpoint
        self.api_key_name = api_key_name
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.top_p = top_p
        self.frequency_penalty = frequency_penalty
        self.presence_penalty = presence_penalty
        self.context_window = context_window
        self.cost_per_token = cost_per_token
        self.status = status
        self.metadata = metadata or {}
        self.supported_features = supported_features or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def update_status(self, new_status: ModelStatus) -> None:
        """Update model status."""
        self.status = new_status
        self.updated_at = datetime.utcnow()

    def update_parameters(
        self,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        max_tokens: Optional[int] = None,
        frequency_penalty: Optional[float] = None,
        presence_penalty: Optional[float] = None,
    ) -> None:
        """Update model parameters."""
        if temperature is not None:
            self.temperature = temperature
        if top_p is not None:
            self.top_p = top_p
        if max_tokens is not None:
            self.max_tokens = max_tokens
        if frequency_penalty is not None:
            self.frequency_penalty = frequency_penalty
        if presence_penalty is not None:
            self.presence_penalty = presence_penalty

        self.updated_at = datetime.utcnow()

    def add_feature(self, feature: str) -> None:
        """Add a supported feature."""
        if feature not in self.supported_features:
            self.supported_features.append(feature)
            self.updated_at = datetime.utcnow()

    def remove_feature(self, feature: str) -> None:
        """Remove a supported feature."""
        if feature in self.supported_features:
            self.supported_features.remove(feature)
            self.updated_at = datetime.utcnow()

    def is_available(self) -> bool:
        """Check if model is available for use."""
        return self.status == ModelStatus.ACTIVO

    def supports_feature(self, feature: str) -> bool:
        """Check if model supports a specific feature."""
        return feature in self.supported_features

    def calculate_cost(self, token_count: int) -> float:
        """Calculate cost for given token count."""
        return self.cost_per_token * token_count

    def get_configuration(self) -> Dict[str, Any]:
        """Get model configuration parameters."""
        return {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "max_tokens": self.max_tokens,
            "frequency_penalty": self.frequency_penalty,
            "presence_penalty": self.presence_penalty,
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert AI model to dictionary."""
        return {
            "model_id": str(self.model_id),
            "name": self.name,
            "model_type": self.model_type.value,
            "model_name": self.model_name,
            "api_endpoint": self.api_endpoint,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "top_p": self.top_p,
            "frequency_penalty": self.frequency_penalty,
            "presence_penalty": self.presence_penalty,
            "context_window": self.context_window,
            "cost_per_token": self.cost_per_token,
            "status": self.status.value,
            "metadata": self.metadata,
            "supported_features": self.supported_features,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_available": self.is_available(),
        }

    def __str__(self) -> str:
        return f"AIModel(id={self.model_id}, name='{self.name}', type='{self.model_type.value}', status='{self.status.value}')"

    def __repr__(self) -> str:
        return self.__str__()
