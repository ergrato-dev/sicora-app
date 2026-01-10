"""Pydantic schemas for chat and conversation endpoints."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class MessageTypeEnum(str, Enum):
    """Message type enumeration."""

    USUARIO = "USUARIO"
    ASISTENTE = "ASISTENTE"
    SISTEMA = "SISTEMA"


class ConversationStatusEnum(str, Enum):
    """Conversation status enumeration."""

    ACTIVO = "ACTIVO"
    ARCHIVADO = "ARCHIVADO"
    ELIMINADO = "ELIMINADO"


class MessageCreate(BaseModel):
    """Schema for creating a new message."""

    content: str = Field(
        ..., min_length=1, max_length=50000, description="Message content"
    )
    message_type: MessageTypeEnum = Field(
        default=MessageTypeEnum.USUARIO, description="Type of message"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, description="Additional message metadata"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "content": "¿Cuál es el estado del proyecto?",
                "message_type": "user",
                "metadata": {"source": "web_interface"},
            }
        }
    )


class MessageResponse(BaseModel):
    """Schema for message response."""

    id: UUID = Field(..., description="Message unique identifier")
    content: str = Field(..., description="Message content")
    message_type: MessageTypeEnum = Field(..., description="Type of message")
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, description="Message metadata"
    )
    created_at: datetime = Field(..., description="Message creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class ConversationCreate(BaseModel):
    """Schema for creating a new conversation."""

    title: Optional[str] = Field(
        default=None, max_length=200, description="Conversation title"
    )
    user_id: UUID = Field(..., description="User ID who owns the conversation")
    model_id: Optional[UUID] = Field(
        default=None, description="AI model to use for this conversation"
    )
    system_prompt: Optional[str] = Field(
        default=None, max_length=10000, description="System prompt for the conversation"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, description="Additional conversation metadata"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Consulta sobre proyectos",
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "model_id": "456e7890-e89b-12d3-a456-426614174001",
                "system_prompt": "Eres un asistente especializado en gestión de proyectos.",
            }
        }
    )


class ConversationUpdate(BaseModel):
    """Schema for updating a conversation."""

    title: Optional[str] = Field(
        default=None, max_length=200, description="New conversation title"
    )
    status: Optional[ConversationStatusEnum] = Field(
        default=None, description="New conversation status"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, description="Updated conversation metadata"
    )


class ConversationResponse(BaseModel):
    """Schema for conversation response."""

    id: UUID = Field(..., description="Conversation unique identifier")
    title: Optional[str] = Field(default=None, description="Conversation title")
    user_id: UUID = Field(..., description="User ID who owns the conversation")
    model_id: Optional[UUID] = Field(default=None, description="AI model ID")
    system_prompt: Optional[str] = Field(default=None, description="System prompt")
    status: ConversationStatusEnum = Field(..., description="Conversation status")
    message_count: int = Field(
        default=0, description="Number of messages in conversation"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, description="Conversation metadata"
    )
    created_at: datetime = Field(..., description="Conversation creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class ConversationWithMessages(ConversationResponse):
    """Schema for conversation response with messages."""

    messages: List[MessageResponse] = Field(
        default=[], description="Messages in the conversation"
    )


class ChatRequest(BaseModel):
    """Schema for chat request."""

    message: str = Field(
        ..., min_length=1, max_length=50000, description="User message"
    )
    conversation_id: Optional[UUID] = Field(
        default=None, description="Existing conversation ID"
    )
    model_id: Optional[UUID] = Field(default=None, description="AI model to use")
    stream: bool = Field(default=False, description="Whether to stream the response")
    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0, description="Response creativity level"
    )
    max_tokens: int = Field(
        default=1000, ge=1, le=4000, description="Maximum tokens in response"
    )
    include_context: bool = Field(
        default=True, description="Whether to include conversation context"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "¿Puedes ayudarme con el análisis de este proyecto?",
                "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
                "stream": False,
                "temperature": 0.7,
                "max_tokens": 1000,
            }
        }
    )


class ChatResponse(BaseModel):
    """Schema for chat response."""

    message: MessageResponse = Field(..., description="AI assistant response message")
    conversation_id: UUID = Field(..., description="Conversation ID")
    usage: Optional[Dict[str, Any]] = Field(
        default=None, description="Token usage information"
    )
    model_info: Optional[Dict[str, Any]] = Field(
        default=None, description="Model information used"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": {
                    "id": "456e7890-e89b-12d3-a456-426614174001",
                    "content": "Por supuesto, puedo ayudarte con el análisis del proyecto...",
                    "message_type": "assistant",
                    "created_at": "2024-01-15T10:30:00Z",
                },
                "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
                "usage": {
                    "prompt_tokens": 50,
                    "completion_tokens": 100,
                    "total_tokens": 150,
                },
            }
        }
    )


class StreamChatResponse(BaseModel):
    """Schema for streaming chat response chunk."""

    content: str = Field(..., description="Chunk of the streaming response")
    conversation_id: UUID = Field(..., description="Conversation ID")
    is_final: bool = Field(default=False, description="Whether this is the final chunk")


class ConversationListQuery(BaseModel):
    """Schema for conversation list query parameters."""

    user_id: Optional[UUID] = Field(default=None, description="Filter by user ID")
    status: Optional[ConversationStatusEnum] = Field(
        default=None, description="Filter by status"
    )
    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of conversations to return",
    )
    offset: int = Field(default=0, ge=0, description="Number of conversations to skip")
    order_by: str = Field(default="updated_at", description="Field to order by")
    order_desc: bool = Field(
        default=True, description="Whether to order in descending order"
    )


class ConversationListResponse(BaseModel):
    """Schema for conversation list response."""

    conversations: List[ConversationResponse] = Field(
        ..., description="List of conversations"
    )
    total: int = Field(..., description="Total number of conversations")
    limit: int = Field(..., description="Limit used for pagination")
    offset: int = Field(..., description="Offset used for pagination")
    has_more: bool = Field(
        ..., description="Whether there are more conversations available"
    )


class ConversationStats(BaseModel):
    """Schema for conversation statistics."""

    total_conversations: int = Field(..., description="Total number of conversations")
    active_conversations: int = Field(..., description="Number of active conversations")
    archived_conversations: int = Field(
        ..., description="Number of archived conversations"
    )
    total_messages: int = Field(..., description="Total number of messages")
    avg_messages_per_conversation: float = Field(
        ..., description="Average messages per conversation"
    )
    conversations_today: int = Field(..., description="Conversations created today")
    messages_today: int = Field(..., description="Messages sent today")


class HealthCheckResponse(BaseModel):
    """Schema for health check response."""

    status: str = Field(..., description="Service status")
    message: str = Field(..., description="Health check message")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")


class ErrorResponse(BaseModel):
    """Schema for error responses."""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(
        default=None, description="Additional error details"
    )


# Enhanced Chat Schemas para integración con KbService


class EnhancedChatRequest(BaseModel):
    """Schema for enhanced chat requests with KB integration."""

    message: str = Field(
        ..., min_length=1, max_length=10000, description="User message"
    )
    conversation_id: Optional[UUID] = Field(
        None, description="Existing conversation ID"
    )
    use_knowledge_base: bool = Field(
        default=True, description="Use knowledge base for context"
    )
    search_categories: Optional[List[str]] = Field(
        None, description="Specific categories to search"
    )
    context_limit: int = Field(
        default=5, ge=1, le=10, description="Max context items from KB"
    )
    model_name: Optional[str] = Field(None, description="AI model to use")
    temperature: Optional[float] = Field(
        default=0.7, ge=0.0, le=2.0, description="Response creativity"
    )
    max_tokens: Optional[int] = Field(
        default=1000, ge=1, le=4000, description="Max tokens in response"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional request metadata"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "¿Cuáles son las faltas graves según el reglamento?",
                "conversation_id": None,
                "use_knowledge_base": True,
                "search_categories": ["reglamento", "disciplinario"],
                "context_limit": 5,
                "model_name": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 1000,
            }
        }
    )


class EnhancedChatResponse(BaseModel):
    """Schema for enhanced chat responses."""

    message: str = Field(..., description="Assistant response message")
    conversation_id: Optional[UUID] = Field(None, description="Conversation ID")
    model_used: Optional[str] = Field(None, description="AI model used for response")
    tokens_used: Optional[int] = Field(None, description="Total tokens used")
    processing_time: Optional[float] = Field(
        None, description="Processing time in seconds"
    )
    knowledge_sources_used: int = Field(
        default=0, description="Number of KB sources used"
    )
    context_categories: List[str] = Field(
        default_factory=list, description="Categories found in context"
    )
    metadata: Optional[Dict[str, Any]] = Field(None, description="Response metadata")
    timestamp: datetime = Field(..., description="Response timestamp")

    model_config = ConfigDict(from_attributes=True)


class QuickAnswerRequest(BaseModel):
    """Schema for quick answer requests."""

    question: str = Field(
        ..., min_length=1, max_length=500, description="Question to answer"
    )
    category: Optional[str] = Field(None, description="Specific category to search in")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "question": "¿Cómo justifico una falta?",
                "category": "asistencia",
            }
        }
    )


class QuickAnswerResponse(BaseModel):
    """Schema for quick answer responses."""

    question: str = Field(..., description="Original question")
    answer: Optional[str] = Field(None, description="Quick answer if found")
    category: Optional[str] = Field(None, description="Category searched")
    found: bool = Field(..., description="Whether answer was found")
    source: Optional[str] = Field(None, description="Source of the answer")


class KnowledgeSearchRequest(BaseModel):
    """Schema for knowledge base search requests."""

    query: str = Field(..., min_length=1, max_length=500, description="Search query")
    search_type: str = Field(
        default="hybrid",
        pattern="^(text|semantic|hybrid)$",
        description="Type of search",
    )
    category: Optional[str] = Field(None, description="Category filter")
    limit: int = Field(default=5, ge=1, le=20, description="Max number of results")
    search_regulatory: bool = Field(
        default=False, description="Search specifically in regulatory content"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "query": "asistencia faltas justificadas",
                "search_type": "hybrid",
                "category": "asistencia",
                "limit": 5,
                "search_regulatory": True,
            }
        }
    )


class KnowledgeSearchResult(BaseModel):
    """Schema for individual knowledge search results."""

    id: str = Field(..., description="Result ID")
    title: str = Field(..., description="Result title")
    content: str = Field(..., description="Result content")
    category: str = Field(..., description="Content category")
    content_type: str = Field(..., description="Type of content")
    relevance_score: float = Field(..., description="Relevance score")
    source: str = Field(..., description="Source of content")


class KnowledgeSearchResponse(BaseModel):
    """Schema for knowledge search responses."""

    query: str = Field(..., description="Original search query")
    results: List[KnowledgeSearchResult] = Field(..., description="Search results")
    total_results: int = Field(..., description="Total number of results")
    search_type: str = Field(..., description="Type of search performed")
