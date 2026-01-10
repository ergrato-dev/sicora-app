"""Pydantic schemas for analytics endpoints."""

from datetime import datetime, date
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class AnalyticsPeriod(str, Enum):
    """Analytics time period enumeration."""

    HORA = "HORA"
    DIA = "DIA"
    SEMANA = "SEMANA"
    MES = "MES"
    TRIMESTRE = "TRIMESTRE"
    ANIO = "ANIO"


class MetricType(str, Enum):
    """Analytics metric type enumeration."""

    CONTEO = "CONTEO"
    SUMA = "SUMA"
    PROMEDIO = "PROMEDIO"
    MINIMO = "MINIMO"
    MAXIMO = "MAXIMO"
    PORCENTAJE = "PORCENTAJE"


class AnalyticsQuery(BaseModel):
    """Schema for analytics query."""

    start_date: date = Field(..., description="Start date for analytics")
    end_date: date = Field(..., description="End date for analytics")
    period: AnalyticsPeriod = Field(
        default=AnalyticsPeriod.DIA, description="Aggregation period"
    )
    metrics: List[str] = Field(
        ..., min_length=1, description="List of metrics to calculate"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default=None, description="Filters to apply"
    )
    group_by: Optional[List[str]] = Field(
        default=None, description="Fields to group by"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "start_date": "2024-01-01",
                "end_date": "2024-01-31",
                "period": "day",
                "metrics": ["conversation_count", "message_count", "avg_response_time"],
                "filters": {"model_provider": "openai"},
                "group_by": ["model_id"],
            }
        }
    )


class MetricValue(BaseModel):
    """Schema for a single metric value."""

    name: str = Field(..., description="Metric name")
    value: float = Field(..., description="Metric value")
    unit: Optional[str] = Field(default=None, description="Metric unit")
    change_percentage: Optional[float] = Field(
        default=None, description="Percentage change from previous period"
    )


class TimeSeriesDataPoint(BaseModel):
    """Schema for time series data point."""

    timestamp: datetime = Field(..., description="Data point timestamp")
    metrics: List[MetricValue] = Field(
        ..., description="Metric values at this timestamp"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, description="Additional data point metadata"
    )


class AnalyticsResponse(BaseModel):
    """Schema for analytics response."""

    query: AnalyticsQuery = Field(..., description="Original query")
    data: List[TimeSeriesDataPoint] = Field(..., description="Time series data")
    summary: Dict[str, MetricValue] = Field(..., description="Summary statistics")
    generated_at: datetime = Field(..., description="When the analytics were generated")
    query_time_ms: float = Field(
        ..., description="Query execution time in milliseconds"
    )


class ConversationAnalytics(BaseModel):
    """Schema for conversation analytics."""

    total_conversations: int = Field(..., description="Total number of conversations")
    active_conversations: int = Field(..., description="Currently active conversations")
    completed_conversations: int = Field(..., description="Completed conversations")
    avg_conversation_length: float = Field(
        ..., description="Average conversation length in messages"
    )
    avg_conversation_duration_minutes: float = Field(
        ..., description="Average conversation duration"
    )
    conversations_by_model: Dict[str, int] = Field(
        ..., description="Conversations count by model"
    )
    conversations_by_day: List[Dict[str, Any]] = Field(
        ..., description="Daily conversation counts"
    )
    peak_usage_hours: List[int] = Field(..., description="Hours with highest usage")


class MessageAnalytics(BaseModel):
    """Schema for message analytics."""

    total_messages: int = Field(..., description="Total number of messages")
    user_messages: int = Field(..., description="Number of user messages")
    assistant_messages: int = Field(..., description="Number of assistant messages")
    avg_message_length: float = Field(
        ..., description="Average message length in characters"
    )
    avg_response_time_ms: float = Field(
        ..., description="Average response time in milliseconds"
    )
    messages_by_hour: List[Dict[str, Any]] = Field(
        ..., description="Hourly message distribution"
    )
    sentiment_distribution: Dict[str, int] = Field(
        ..., description="Message sentiment distribution"
    )


class ModelAnalytics(BaseModel):
    """Schema for model analytics."""

    total_requests: int = Field(..., description="Total model requests")
    successful_requests: int = Field(..., description="Successful requests")
    failed_requests: int = Field(..., description="Failed requests")
    success_rate: float = Field(..., description="Request success rate")
    avg_response_time_ms: float = Field(..., description="Average response time")
    total_tokens_processed: int = Field(..., description="Total tokens processed")
    cost_summary: Dict[str, float] = Field(..., description="Cost breakdown by model")
    most_used_models: List[Dict[str, Any]] = Field(
        ..., description="Most frequently used models"
    )
    error_rate_by_model: Dict[str, float] = Field(
        ..., description="Error rates by model"
    )


class KnowledgeAnalytics(BaseModel):
    """Schema for knowledge base analytics."""

    total_entries: int = Field(..., description="Total knowledge entries")
    entries_by_category: Dict[str, int] = Field(
        ..., description="Entries count by category"
    )
    most_searched_topics: List[Dict[str, Any]] = Field(
        ..., description="Most searched topics"
    )
    search_success_rate: float = Field(..., description="Search success rate")
    avg_search_results: float = Field(
        ..., description="Average number of search results"
    )
    entries_created_trend: List[Dict[str, Any]] = Field(
        ..., description="Knowledge entry creation trend"
    )
    top_contributors: List[Dict[str, Any]] = Field(
        ..., description="Top knowledge contributors"
    )


class UserAnalytics(BaseModel):
    """Schema for user analytics."""

    total_users: int = Field(..., description="Total number of users")
    active_users: int = Field(..., description="Active users in period")
    new_users: int = Field(..., description="New users in period")
    user_retention_rate: float = Field(..., description="User retention rate")
    avg_sessions_per_user: float = Field(..., description="Average sessions per user")
    user_engagement_score: float = Field(
        ..., description="Overall user engagement score"
    )
    usage_by_user_type: Dict[str, int] = Field(
        ..., description="Usage distribution by user type"
    )


class SystemAnalytics(BaseModel):
    """Schema for system analytics."""

    uptime_percentage: float = Field(..., description="System uptime percentage")
    avg_response_time_ms: float = Field(..., description="Average system response time")
    error_rate: float = Field(..., description="Overall system error rate")
    throughput_requests_per_second: float = Field(..., description="System throughput")
    resource_usage: Dict[str, float] = Field(..., description="Resource usage metrics")
    cache_hit_rate: float = Field(..., description="Cache hit rate")
    database_performance: Dict[str, float] = Field(
        ..., description="Database performance metrics"
    )


class ComprehensiveAnalytics(BaseModel):
    """Schema for comprehensive analytics dashboard."""

    period: AnalyticsPeriod = Field(..., description="Analytics period")
    start_date: date = Field(..., description="Start date")
    end_date: date = Field(..., description="End date")
    conversation_analytics: ConversationAnalytics = Field(
        ..., description="Conversation metrics"
    )
    message_analytics: MessageAnalytics = Field(..., description="Message metrics")
    model_analytics: ModelAnalytics = Field(..., description="Model usage metrics")
    knowledge_analytics: KnowledgeAnalytics = Field(
        ..., description="Knowledge base metrics"
    )
    user_analytics: UserAnalytics = Field(..., description="User behavior metrics")
    system_analytics: SystemAnalytics = Field(
        ..., description="System performance metrics"
    )
    generated_at: datetime = Field(..., description="When analytics were generated")


class AlertThreshold(BaseModel):
    """Schema for analytics alert threshold."""

    metric_name: str = Field(..., description="Name of the metric to monitor")
    threshold_value: float = Field(..., description="Threshold value for the alert")
    comparison_operator: str = Field(
        ..., description="Comparison operator (>, <, >=, <=, ==)"
    )
    alert_severity: str = Field(..., description="Alert severity level")
    notification_channels: List[str] = Field(
        ..., description="Channels to send notifications"
    )


class AnalyticsAlert(BaseModel):
    """Schema for analytics alert."""

    id: UUID = Field(..., description="Alert unique identifier")
    metric_name: str = Field(..., description="Metric that triggered the alert")
    current_value: float = Field(..., description="Current metric value")
    threshold_value: float = Field(..., description="Threshold that was exceeded")
    severity: str = Field(..., description="Alert severity")
    message: str = Field(..., description="Alert message")
    triggered_at: datetime = Field(..., description="When the alert was triggered")
    resolved_at: Optional[datetime] = Field(
        default=None, description="When the alert was resolved"
    )
    is_active: bool = Field(..., description="Whether the alert is currently active")


class CustomReport(BaseModel):
    """Schema for custom analytics report."""

    name: str = Field(..., min_length=1, max_length=200, description="Report name")
    description: Optional[str] = Field(
        default=None, max_length=1000, description="Report description"
    )
    query: AnalyticsQuery = Field(..., description="Analytics query for the report")
    schedule: Optional[str] = Field(
        default=None, description="Cron schedule for automated generation"
    )
    recipients: List[str] = Field(
        default=[], description="Email recipients for scheduled reports"
    )
    format: str = Field(default="json", description="Report output format")


class CustomReportResponse(BaseModel):
    """Schema for custom report response."""

    id: UUID = Field(..., description="Report unique identifier")
    name: str = Field(..., description="Report name")
    description: Optional[str] = Field(default=None, description="Report description")
    query: AnalyticsQuery = Field(..., description="Analytics query")
    schedule: Optional[str] = Field(default=None, description="Report schedule")
    recipients: List[str] = Field(default=[], description="Email recipients")
    format: str = Field(..., description="Report format")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    last_generated: Optional[datetime] = Field(
        default=None, description="Last generation timestamp"
    )

    model_config = ConfigDict(from_attributes=True)


class ReportExecution(BaseModel):
    """Schema for report execution result."""

    report_id: UUID = Field(..., description="Report ID")
    execution_id: UUID = Field(..., description="Execution unique identifier")
    status: str = Field(..., description="Execution status")
    data: Optional[AnalyticsResponse] = Field(
        default=None, description="Report data if successful"
    )
    error_message: Optional[str] = Field(
        default=None, description="Error message if failed"
    )
    started_at: datetime = Field(..., description="Execution start time")
    completed_at: Optional[datetime] = Field(
        default=None, description="Execution completion time"
    )
    execution_time_ms: Optional[float] = Field(
        default=None, description="Execution duration"
    )
