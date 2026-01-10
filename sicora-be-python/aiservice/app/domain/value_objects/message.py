"""Message value object for AI Service."""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
import uuid
from enum import Enum


class MessageRole(str, Enum):
    """Message roles in a conversation."""

    USUARIO = "USUARIO"
    ASISTENTE = "ASISTENTE"
    SISTEMA = "SISTEMA"


class MessageType(str, Enum):
    """Message types."""

    TEXTO = "TEXTO"
    IMAGEN = "IMAGEN"
    ARCHIVO = "ARCHIVO"
    CODIGO = "CODIGO"
    LLAMADA_FUNCION = "LLAMADA_FUNCION"


class Message:
    """Message value object representing a single message in a conversation."""

    def __init__(
        self,
        content: str,
        role: MessageRole,
        message_id: Optional[UUID] = None,
        message_type: MessageType = MessageType.TEXTO,
        tokens: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None,
        model_used: Optional[str] = None,
        processing_time: Optional[float] = None,
    ):
        self.message_id = message_id or uuid.uuid4()
        self.content = content
        self.role = role
        self.message_type = message_type
        self.tokens = tokens
        self.metadata = metadata or {}
        self.timestamp = timestamp or datetime.utcnow()
        self.model_used = model_used
        self.processing_time = processing_time

    def set_tokens(self, token_count: int) -> None:
        """Set the token count for this message."""
        self.tokens = token_count

    def set_model_used(self, model_name: str) -> None:
        """Set the model used to generate this message."""
        self.model_used = model_name

    def set_processing_time(self, time_seconds: float) -> None:
        """Set the processing time for this message."""
        self.processing_time = time_seconds

    def add_metadata(self, key: str, value: Any) -> None:
        """Add metadata to the message."""
        self.metadata[key] = value

    def get_content_preview(self, max_length: int = 100) -> str:
        """Get a preview of the message content."""
        if len(self.content) <= max_length:
            return self.content
        return self.content[:max_length] + "..."

    def is_user_message(self) -> bool:
        """Check if this is a user message."""
        return self.role == MessageRole.USUARIO

    def is_assistant_message(self) -> bool:
        """Check if this is an assistant message."""
        return self.role == MessageRole.ASISTENTE

    def is_system_message(self) -> bool:
        """Check if this is a system message."""
        return self.role == MessageRole.SYSTEM

    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary."""
        return {
            "message_id": str(self.message_id),
            "content": self.content,
            "role": self.role.value,
            "message_type": self.message_type.value,
            "tokens": self.tokens,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat(),
            "model_used": self.model_used,
            "processing_time": self.processing_time,
        }

    def to_openai_format(self) -> Dict[str, str]:
        """Convert message to OpenAI chat format."""
        return {"role": self.role.value, "content": self.content}

    def __str__(self) -> str:
        preview = self.get_content_preview(50)
        return f"Message(role={self.role.value}, content='{preview}', tokens={self.tokens})"

    def __repr__(self) -> str:
        return self.__str__()

    def __eq__(self, other) -> bool:
        if not isinstance(other, Message):
            return False
        return self.message_id == other.message_id

    def __hash__(self) -> int:
        return hash(self.message_id)
