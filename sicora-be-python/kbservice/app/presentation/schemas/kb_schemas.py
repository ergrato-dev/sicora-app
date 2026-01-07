"""Pydantic schemas for Knowledge Base Service API."""

from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

from app.domain.entities.kb_entities import ContentType, ContentStatus, TargetAudience


class HealthCheckResponse(BaseModel):
    """Health check response schema."""
    service: str
    status: str
    timestamp: datetime
    version: str
    database_status: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
    error_code: str
    timestamp: datetime


# Knowledge Item Schemas
class KnowledgeItemCreate(BaseModel):
    """Schema for creating a knowledge item."""
    title: str = Field(..., min_length=1, max_length=200, description="Knowledge item title")
    content: str = Field(..., min_length=1, max_length=50000, description="Knowledge item content")
    content_type: ContentType = Field(..., description="Type of content")
    category: str = Field(..., min_length=1, max_length=100, description="Category name")
    target_audience: TargetAudience = Field(..., description="Target audience")
    tags: Optional[List[str]] = Field(default=[], description="List of tags")
    status: ContentStatus = Field(default=ContentStatus.DRAFT, description="Content status")
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if v:
            for tag in v:
                if not tag.strip() or len(tag.strip()) > 50:
                    raise ValueError("Tags must be non-empty and max 50 characters")
        return [tag.strip().lower() for tag in v] if v else []
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Cómo registrar asistencia",
                "content": "Para registrar asistencia, sigue estos pasos...",
                "content_type": "guide",
                "category": "Asistencia",
                "target_audience": "student",
                "tags": ["asistencia", "tutorial", "estudiantes"],
                "status": "draft"
            }
        }


class KnowledgeItemUpdate(BaseModel):
    """Schema for updating a knowledge item."""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Knowledge item title")
    content: Optional[str] = Field(None, min_length=1, max_length=50000, description="Knowledge item content")
    content_type: Optional[ContentType] = Field(None, description="Type of content")
    category: Optional[str] = Field(None, min_length=1, max_length=100, description="Category name")
    target_audience: Optional[TargetAudience] = Field(None, description="Target audience")
    tags: Optional[List[str]] = Field(None, description="List of tags")
    status: Optional[ContentStatus] = Field(None, description="Content status")
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if v is not None:
            for tag in v:
                if not tag.strip() or len(tag.strip()) > 50:
                    raise ValueError("Tags must be non-empty and max 50 characters")
            return [tag.strip().lower() for tag in v]
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Cómo registrar asistencia - Actualizado",
                "status": "published"
            }
        }


class KnowledgeItemResponse(BaseModel):
    """Schema for knowledge item response."""
    id: UUID
    title: str
    content: str
    content_type: ContentType
    category: str
    target_audience: TargetAudience
    author_id: UUID
    status: ContentStatus
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    view_count: int
    helpful_count: int
    unhelpful_count: int
    version: int
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Cómo registrar asistencia",
                "content": "Para registrar asistencia, sigue estos pasos...",
                "content_type": "guide",
                "category": "Asistencia",
                "target_audience": "student",
                "author_id": "456e7890-e89b-12d3-a456-426614174001",
                "status": "published",
                "tags": ["asistencia", "tutorial", "estudiantes"],
                "created_at": "2023-12-01T10:00:00Z",
                "updated_at": "2023-12-01T10:00:00Z",
                "published_at": "2023-12-01T10:00:00Z",
                "view_count": 150,
                "helpful_count": 25,
                "unhelpful_count": 2,
                "version": 1
            }
        }


class KnowledgeItemList(BaseModel):
    """Schema for knowledge item list response."""
    id: UUID
    title: str
    content_snippet: str
    content_type: ContentType
    category: str
    target_audience: TargetAudience
    status: ContentStatus
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    view_count: int
    helpful_count: int
    
    class Config:
        from_attributes = True


# Category Schemas
class CategoryCreate(BaseModel):
    """Schema for creating a category."""
    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    description: str = Field(..., min_length=1, max_length=500, description="Category description")
    parent_id: Optional[UUID] = Field(None, description="Parent category ID")
    sort_order: int = Field(default=0, description="Sort order")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not all(c.isalnum() or c in ' -_áéíóúñÁÉÍÓÚÑ' for c in v.strip()):
            raise ValueError("Category name contains invalid characters")
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Asistencia",
                "description": "Información sobre registro y gestión de asistencia",
                "sort_order": 1
            }
        }


class CategoryResponse(BaseModel):
    """Schema for category response."""
    id: UUID
    name: str
    description: str
    parent_id: Optional[UUID]
    sort_order: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Search Schemas
class SearchRequest(BaseModel):
    """Schema for search requests."""
    query: str = Field(..., min_length=1, max_length=500, description="Search query")
    filters: Optional[Dict[str, Any]] = Field(default={}, description="Search filters")
    search_type: Optional[str] = Field(default="hybrid", pattern="^(text|semantic|hybrid)$", description="Search type")
    limit: int = Field(default=20, ge=1, le=100, description="Maximum results")
    offset: int = Field(default=0, ge=0, description="Results offset")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "cómo registrar asistencia",
                "filters": {
                    "category": "Asistencia",
                    "target_audience": "student"
                },
                "search_type": "hybrid",
                "limit": 10,
                "offset": 0
            }
        }


class SearchResult(BaseModel):
    """Schema for search result."""
    item: KnowledgeItemList
    score: float = Field(..., ge=0.0, le=1.0, description="Relevance score")
    snippet: str = Field(..., description="Content snippet with highlights")
    
    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """Schema for search response."""
    results: List[SearchResult]
    total_count: int
    query: str
    filters: Dict[str, Any]
    suggestions: List[str] = Field(default=[], description="Query suggestions")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "results": [],
                "total_count": 15,
                "query": "cómo registrar asistencia",
                "filters": {"category": "Asistencia"},
                "suggestions": [
                    "¿Cómo justifico una falta?",
                    "¿Cuál es el porcentaje mínimo de asistencia?"
                ]
            }
        }


# Query Schemas
class QueryRequest(BaseModel):
    """Schema for intelligent query requests."""
    query: str = Field(..., min_length=1, max_length=1000, description="User query")
    context: Optional[Dict[str, Any]] = Field(default={}, description="User context")
    include_chatbot: bool = Field(default=True, description="Include chatbot response")
    
    @field_validator('context')
    @classmethod
    def validate_context(cls, v):
        if v is None:
            return {}
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "¿Puedo faltar por motivos médicos?",
                "context": {
                    "user_role": "student",
                    "program": "Análisis y Desarrollo de Software"
                },
                "include_chatbot": True
            }
        }


class QueryResponse(BaseModel):
    """Schema for intelligent query response."""
    answer: str = Field(..., description="Generated answer")
    sources: List[KnowledgeItemList] = Field(..., description="Source knowledge items")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Response confidence")
    suggestions: List[str] = Field(default=[], description="Related suggestions")
    chatbot_used: bool = Field(default=False, description="Whether chatbot was consulted")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "answer": "Sí, puedes faltar por motivos médicos...",
                "sources": [],
                "confidence": 0.85,
                "suggestions": [
                    "¿Cómo justifico una falta médica?",
                    "¿Qué documentos necesito para justificar?"
                ],
                "chatbot_used": True
            }
        }


# Feedback Schema
class Feedback(BaseModel):
    """Schema for user feedback."""
    item_id: UUID = Field(..., description="Knowledge item ID")
    feedback_type: str = Field(..., pattern="^(helpful|unhelpful)$", description="Feedback type")
    comment: Optional[str] = Field(None, max_length=500, description="Optional comment")
    
    class Config:
        json_schema_extra = {
            "example": {
                "item_id": "123e4567-e89b-12d3-a456-426614174000",
                "feedback_type": "helpful",
                "comment": "Esta información me ayudó mucho"
            }
        }


class FeedbackCreateSchema(BaseModel):
    """Schema for creating feedback."""
    item_id: UUID = Field(..., description="ID of the knowledge item")
    feedback_type: str = Field(..., pattern="^(helpful|unhelpful)$", description="Type of feedback")
    comment: Optional[str] = Field(None, max_length=500, description="Optional feedback comment")
    
    class Config:
        json_schema_extra = {
            "example": {
                "item_id": "123e4567-e89b-12d3-a456-426614174000",
                "feedback_type": "helpful",
                "comment": "Esta información me ayudó mucho a resolver mi problema"
            }
        }


class FeedbackResponseSchema(BaseModel):
    """Schema for feedback response."""
    id: UUID
    item_id: UUID
    user_id: UUID
    feedback_type: str
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Metrics Schema
class MetricsResponse(BaseModel):
    """Schema for metrics response."""
    total_items: int
    total_queries: int
    popular_items: List[KnowledgeItemList]
    frequent_queries: List[Dict[str, Any]]
    user_activity: Dict[str, Any]
    performance_stats: Dict[str, Any]
    
    class Config:
        from_attributes = True


# Pagination Schema
class PaginationResponse(BaseModel):
    """Schema for paginated responses."""
    items: List[Any] = Field(..., description="List of items")
    total_count: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_previous: bool = Field(..., description="Whether there are previous pages")
    
    class Config:
        from_attributes = True


# Admin Schemas
class AdminConfigUpdate(BaseModel):
    """Schema for admin configuration updates."""
    embedding_model: Optional[str] = Field(None, description="Embedding model to use")
    similarity_threshold: Optional[float] = Field(None, ge=0.0, le=1.0, description="Vector similarity threshold")
    max_search_results: Optional[int] = Field(None, ge=1, le=100, description="Maximum search results")
    cache_ttl: Optional[int] = Field(None, ge=60, description="Cache TTL in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "similarity_threshold": 0.75,
                "max_search_results": 25,
                "cache_ttl": 3600
            }
        }


class AdminMetricsResponse(BaseModel):
    """Schema for comprehensive admin metrics."""
    period: str
    total_queries: int
    average_response_time: float
    search_accuracy: float
    error_rate: float
    user_satisfaction: float
    resource_usage: Dict[str, Any]
    timestamp: datetime
    
    class Config:
        from_attributes = True


class AdminConfigResponse(BaseModel):
    """Schema for admin configuration response."""
    config: Dict[str, Any]
    timestamp: datetime
    
    class Config:
        from_attributes = True


class AdminConfigRequest(BaseModel):
    """Schema for admin configuration request."""
    config: Dict[str, Any]
    
    class Config:
        json_schema_extra = {
            "example": {
                "config": {
                    "embeddings": {
                        "model": "text-embedding-ada-002",
                        "batch_size": 100
                    },
                    "search": {
                        "max_results": 50,
                        "similarity_threshold": 0.7
                    }
                }
            }
        }


class RegenerateEmbeddingsRequest(BaseModel):
    """Schema for regenerate embeddings request."""
    item_ids: Optional[List[UUID]] = Field(None, description="Specific item IDs to regenerate")
    category: Optional[str] = Field(None, description="Category to regenerate")
    force_regeneration: bool = Field(False, description="Force regeneration even if embeddings exist")
    
    class Config:
        json_schema_extra = {
            "example": {
                "category": "procedures",
                "force_regeneration": True
            }
        }


class RegenerateEmbeddingsResponse(BaseModel):
    """Schema for regenerate embeddings response."""
    task_id: str
    status: str
    message: str
    estimated_duration: str
    timestamp: datetime
    
    class Config:
        from_attributes = True


class OptimizeIndicesResponse(BaseModel):
    """Schema for optimize indices response."""
    status: str
    optimization_details: Dict[str, Any]
    performance_improvement: float
    timestamp: datetime
    
    class Config:
        from_attributes = True


class QueryPatternsResponse(BaseModel):
    """Schema for query patterns analysis response."""
    period: str
    patterns: List[Dict[str, Any]]
    insights: List[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True


class BackupResponse(BaseModel):
    """Schema for backup response."""
    backup_id: str
    status: str
    file_size: str
    location: str
    includes_embeddings: bool
    timestamp: datetime
    
    class Config:
        from_attributes = True


class RestoreRequest(BaseModel):
    """Schema for restore request."""
    backup_id: str
    overwrite_existing: bool = Field(False, description="Whether to overwrite existing data")
    
    class Config:
        json_schema_extra = {
            "example": {
                "backup_id": "backup_20241213_143022",
                "overwrite_existing": False
            }
        }


class RestoreResponse(BaseModel):
    """Schema for restore response."""
    status: str
    items_restored: int
    conflicts_resolved: int
    timestamp: datetime
    
    class Config:
        from_attributes = True
