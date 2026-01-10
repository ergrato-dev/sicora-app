"""Pydantic schemas for AI model endpoints."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class ModelTypeEnum(str, Enum):
    """AI model type enumeration."""

    CHAT = "CHAT"
    COMPLETADO = "COMPLETADO"
    EMBEDDING = "EMBEDDING"
    CLASIFICACION = "CLASIFICACION"
    RESUMEN = "RESUMEN"
    SENTIMIENTO = "SENTIMIENTO"


class ModelProviderEnum(str, Enum):
    """AI model provider enumeration."""

    OPENAI = "OPENAI"
    ANTHROPIC = "ANTHROPIC"
    HUGGINGFACE = "HUGGINGFACE"
    LOCAL = "LOCAL"
    PERSONALIZADO = "PERSONALIZADO"


class ModelStatusEnum(str, Enum):
    """AI model status enumeration."""

    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"
    OBSOLETO = "OBSOLETO"
    MANTENIMIENTO = "MANTENIMIENTO"


class AIModelCreate(BaseModel):
    """Schema for creating a new AI model."""

    name: str = Field(..., min_length=1, max_length=200, description="Model name")
    model_name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Provider-specific model identifier",
    )
    provider: ModelProviderEnum = Field(..., description="Model provider")
    model_type: ModelTypeEnum = Field(..., description="Type of model")
    description: Optional[str] = Field(
        default=None, max_length=1000, description="Model description"
    )
    max_tokens: int = Field(default=4000, ge=1, description="Maximum tokens supported")
    context_window: int = Field(default=4000, ge=1, description="Context window size")
    cost_per_token: Optional[float] = Field(
        default=None, ge=0, description="Cost per token"
    )
    capabilities: List[str] = Field(default=[], description="Model capabilities")
    config: Optional[Dict[str, Any]] = Field(
        default=None, description="Model configuration"
    )
    is_default: bool = Field(
        default=False, description="Whether this is the default model for its type"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "GPT-4 Turbo",
                "model_name": "gpt-4-turbo-preview",
                "provider": "openai",
                "model_type": "chat",
                "description": "Advanced conversational AI model",
                "max_tokens": 4000,
                "context_window": 128000,
                "cost_per_token": 0.00003,
                "capabilities": ["chat", "analysis", "coding"],
                "config": {"temperature": 0.7, "top_p": 1.0},
            }
        }
    )


class AIModelUpdate(BaseModel):
    """Schema for updating an AI model."""

    name: Optional[str] = Field(
        default=None, min_length=1, max_length=200, description="New model name"
    )
    description: Optional[str] = Field(
        default=None, max_length=1000, description="New description"
    )
    max_tokens: Optional[int] = Field(
        default=None, ge=1, description="New maximum tokens"
    )
    context_window: Optional[int] = Field(
        default=None, ge=1, description="New context window size"
    )
    cost_per_token: Optional[float] = Field(
        default=None, ge=0, description="New cost per token"
    )
    capabilities: Optional[List[str]] = Field(
        default=None, description="New capabilities"
    )
    config: Optional[Dict[str, Any]] = Field(
        default=None, description="New configuration"
    )
    status: Optional[ModelStatusEnum] = Field(default=None, description="New status")
    is_default: Optional[bool] = Field(
        default=None, description="Whether this should be the default model"
    )


class AIModelResponse(BaseModel):
    """Schema for AI model response."""

    id: UUID = Field(..., description="Model unique identifier")
    name: str = Field(..., description="Model name")
    model_name: str = Field(..., description="Provider-specific model identifier")
    provider: ModelProviderEnum = Field(..., description="Model provider")
    model_type: ModelTypeEnum = Field(..., description="Type of model")
    description: Optional[str] = Field(default=None, description="Model description")
    max_tokens: int = Field(..., description="Maximum tokens supported")
    context_window: int = Field(..., description="Context window size")
    cost_per_token: Optional[float] = Field(default=None, description="Cost per token")
    capabilities: List[str] = Field(default=[], description="Model capabilities")
    config: Optional[Dict[str, Any]] = Field(
        default=None, description="Model configuration"
    )
    status: ModelStatusEnum = Field(..., description="Model status")
    is_default: bool = Field(
        ..., description="Whether this is the default model for its type"
    )
    usage_count: int = Field(
        default=0, description="Number of times this model has been used"
    )
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class ModelTestRequest(BaseModel):
    """Schema for testing a model."""

    model_id: UUID = Field(..., description="Model ID to test")
    test_input: str = Field(
        ..., min_length=1, max_length=1000, description="Test input text"
    )
    test_type: str = Field(default="generation", description="Type of test to perform")
    parameters: Optional[Dict[str, Any]] = Field(
        default=None, description="Test parameters"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "model_id": "123e4567-e89b-12d3-a456-426614174000",
                "test_input": "Explain artificial intelligence in simple terms",
                "test_type": "generation",
                "parameters": {"temperature": 0.7, "max_tokens": 100},
            }
        }
    )


class ModelTestResponse(BaseModel):
    """Schema for model test response."""

    model_id: UUID = Field(..., description="Model ID tested")
    test_input: str = Field(..., description="Input used for testing")
    test_output: str = Field(..., description="Output generated by the model")
    test_type: str = Field(..., description="Type of test performed")
    success: bool = Field(..., description="Whether the test was successful")
    response_time_ms: float = Field(..., description="Response time in milliseconds")
    token_usage: Optional[Dict[str, int]] = Field(
        default=None, description="Token usage information"
    )
    error_message: Optional[str] = Field(
        default=None, description="Error message if test failed"
    )


class ModelAvailabilityCheck(BaseModel):
    """Schema for checking model availability."""

    model_ids: List[UUID] = Field(..., min_length=1, description="Model IDs to check")


class ModelAvailabilityResponse(BaseModel):
    """Schema for model availability response."""

    results: Dict[str, bool] = Field(
        ..., description="Availability status for each model ID"
    )
    checked_at: datetime = Field(..., description="When the check was performed")


class ModelListQuery(BaseModel):
    """Schema for model list query parameters."""

    provider: Optional[ModelProviderEnum] = Field(
        default=None, description="Filter by provider"
    )
    model_type: Optional[ModelTypeEnum] = Field(
        default=None, description="Filter by model type"
    )
    status: Optional[ModelStatusEnum] = Field(
        default=None, description="Filter by status"
    )
    capabilities: Optional[List[str]] = Field(
        default=None, description="Filter by capabilities"
    )
    is_default: Optional[bool] = Field(
        default=None, description="Filter by default status"
    )
    limit: int = Field(
        default=20, ge=1, le=100, description="Maximum number of models to return"
    )
    offset: int = Field(default=0, ge=0, description="Number of models to skip")
    order_by: str = Field(default="created_at", description="Field to order by")
    order_desc: bool = Field(
        default=True, description="Whether to order in descending order"
    )


class ModelListResponse(BaseModel):
    """Schema for model list response."""

    models: List[AIModelResponse] = Field(..., description="List of AI models")
    total: int = Field(..., description="Total number of models")
    limit: int = Field(..., description="Limit used for pagination")
    offset: int = Field(..., description="Offset used for pagination")
    has_more: bool = Field(..., description="Whether there are more models available")


class ModelUsageStats(BaseModel):
    """Schema for model usage statistics."""

    model_id: UUID = Field(..., description="Model ID")
    model_name: str = Field(..., description="Model name")
    total_requests: int = Field(..., description="Total number of requests")
    successful_requests: int = Field(..., description="Number of successful requests")
    failed_requests: int = Field(..., description="Number of failed requests")
    total_tokens: int = Field(..., description="Total tokens processed")
    avg_response_time_ms: float = Field(
        ..., description="Average response time in milliseconds"
    )
    last_used: Optional[datetime] = Field(
        default=None, description="Last time the model was used"
    )
    requests_today: int = Field(..., description="Requests made today")
    requests_this_week: int = Field(..., description="Requests made this week")
    requests_this_month: int = Field(..., description="Requests made this month")


class ModelComparisonRequest(BaseModel):
    """Schema for comparing models."""

    model_ids: List[UUID] = Field(
        ..., min_length=2, max_length=5, description="Model IDs to compare"
    )
    test_prompts: List[str] = Field(
        ..., min_length=1, max_length=10, description="Test prompts for comparison"
    )
    comparison_criteria: List[str] = Field(
        default=["quality", "speed", "cost"], description="Criteria for comparison"
    )


class ModelComparisonResult(BaseModel):
    """Schema for individual model comparison result."""

    model_id: UUID = Field(..., description="Model ID")
    model_name: str = Field(..., description="Model name")
    responses: List[str] = Field(..., description="Responses for each test prompt")
    metrics: Dict[str, float] = Field(..., description="Calculated metrics")
    scores: Dict[str, float] = Field(..., description="Scores for each criteria")


class ModelComparisonResponse(BaseModel):
    """Schema for model comparison response."""

    comparison_id: UUID = Field(
        ..., description="Unique identifier for this comparison"
    )
    models_compared: List[ModelComparisonResult] = Field(
        ..., description="Results for each model"
    )
    test_prompts: List[str] = Field(..., description="Test prompts used")
    overall_ranking: List[UUID] = Field(
        ..., description="Model IDs ordered by overall performance"
    )
    comparison_summary: Dict[str, Any] = Field(
        ..., description="Summary of comparison results"
    )
    created_at: datetime = Field(..., description="When the comparison was performed")


class ModelRecommendationRequest(BaseModel):
    """Schema for model recommendation request."""

    use_case: str = Field(..., description="Description of the use case")
    requirements: Dict[str, Any] = Field(..., description="Specific requirements")
    constraints: Optional[Dict[str, Any]] = Field(
        default=None, description="Constraints like budget, speed"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "use_case": "Customer support chatbot for technical questions",
                "requirements": {
                    "model_type": "chat",
                    "max_response_time_ms": 2000,
                    "quality_threshold": 0.8,
                },
                "constraints": {
                    "max_cost_per_token": 0.00005,
                    "preferred_providers": ["openai", "anthropic"],
                },
            }
        }
    )


class ModelRecommendationResponse(BaseModel):
    """Schema for model recommendation response."""

    recommended_models: List[AIModelResponse] = Field(
        ..., description="Recommended models in order of preference"
    )
    reasoning: Dict[str, str] = Field(
        ..., description="Explanation for each recommendation"
    )
    confidence_scores: Dict[str, float] = Field(
        ..., description="Confidence score for each recommendation"
    )
    alternatives: List[AIModelResponse] = Field(
        default=[], description="Alternative models to consider"
    )
