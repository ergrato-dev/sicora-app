"""
Common schemas for MEvalService API.
"""

from datetime import datetime
from typing import Generic, TypeVar, Optional

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseSchema(BaseModel):
    """Base schema with common configuration."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response."""

    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    service: str = "mevalservice"
    version: str = "1.0.0"
    timestamp: datetime


__all__ = [
    "BaseSchema",
    "PaginatedResponse",
    "MessageResponse",
    "ErrorResponse",
    "HealthResponse",
]
