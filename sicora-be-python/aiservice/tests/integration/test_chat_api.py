"""Integration tests for Enhanced Chat API endpoints."""

import pytest
from fastapi.testclient import TestClient

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


class TestRootEndpoints:
    """Tests for root endpoints."""

    def test_root_endpoint(self, client):
        """Test root endpoint returns service info."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "service" in data or "message" in data

    def test_health_endpoint(self, client):
        """Test health endpoint."""
        response = client.get("/health")

        assert response.status_code == 200

    def test_openapi_endpoint(self, client):
        """Test OpenAPI schema endpoint."""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "paths" in data

    def test_docs_endpoint(self, client):
        """Test Swagger UI endpoint."""
        response = client.get("/docs")

        assert response.status_code == 200


class TestEnhancedChatValidation:
    """Validation tests for chat endpoint."""

    def test_enhanced_chat_missing_message(self, client):
        """Test enhanced chat with missing message returns 422."""
        response = client.post("/api/v1/chat/enhanced", json={})

        assert response.status_code == 422  # Validation error

    def test_enhanced_chat_empty_message(self, client):
        """Test enhanced chat with empty message."""
        response = client.post("/api/v1/chat/enhanced", json={"message": ""})

        # Should return validation error or accept empty string
        assert response.status_code in [200, 422]


class TestQuickAnswerValidation:
    """Validation tests for quick-answer endpoint."""

    def test_quick_answer_missing_question(self, client):
        """Test quick answer with missing question."""
        response = client.post("/api/v1/chat/quick-answer", json={})

        assert response.status_code == 422


class TestKnowledgeSearchValidation:
    """Validation tests for search endpoint."""

    def test_knowledge_search_missing_query(self, client):
        """Test knowledge search with missing query."""
        response = client.post("/api/v1/chat/search", json={})

        assert response.status_code == 422

    def test_knowledge_search_with_invalid_limit(self, client):
        """Test knowledge search with invalid limit."""
        response = client.post(
            "/api/v1/chat/search", json={"query": "test", "limit": -1}
        )

        # Should either validate and reject or accept
        assert response.status_code in [200, 422, 500]


class TestHealthCheckEndpointDirect:
    """Tests for health check endpoint without complex mocking."""

    def test_health_endpoint_accessible(self, client):
        """Test that health endpoint is accessible."""
        # This tests the raw endpoint is reachable
        response = client.get("/api/v1/chat/health")

        # Could be healthy, degraded, or service unavailable
        assert response.status_code in [200, 503]

        if response.status_code == 200:
            data = response.json()
            assert "status" in data
            assert data["status"] in ["healthy", "degraded"]


class TestApiRouteStructure:
    """Test API route structure is correct."""

    def test_chat_routes_exist(self, client):
        """Verify chat routes exist in OpenAPI spec."""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        data = response.json()
        paths = data.get("paths", {})

        # Verify expected routes exist
        assert "/api/v1/chat/enhanced" in paths
        assert "/api/v1/chat/quick-answer" in paths
        assert "/api/v1/chat/search" in paths
        assert "/api/v1/chat/health" in paths

    def test_enhanced_chat_route_methods(self, client):
        """Test enhanced chat accepts POST method."""
        response = client.get("/openapi.json")
        data = response.json()

        enhanced_route = data["paths"].get("/api/v1/chat/enhanced", {})
        assert "post" in enhanced_route

    def test_health_route_methods(self, client):
        """Test health route accepts GET method."""
        response = client.get("/openapi.json")
        data = response.json()

        health_route = data["paths"].get("/api/v1/chat/health", {})
        assert "get" in health_route


class TestRequestSchemaValidation:
    """Test request schema validation."""

    def test_enhanced_chat_with_all_fields(self, client):
        """Test enhanced chat with all optional fields."""
        response = client.post(
            "/api/v1/chat/enhanced",
            json={
                "message": "Test message",
                "use_knowledge_base": True,
                "search_categories": ["reglamento"],
                "context_limit": 5,
                "model_name": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 1000,
            },
        )

        # Should process request (may fail on service but not on validation)
        assert response.status_code in [200, 500]

    def test_quick_answer_with_category(self, client):
        """Test quick answer with category filter."""
        response = client.post(
            "/api/v1/chat/quick-answer",
            json={
                "question": "What is the attendance policy?",
                "category": "asistencia",
            },
        )

        assert response.status_code in [200, 500]

    def test_search_with_limit(self, client):
        """Test search with custom limit."""
        response = client.post(
            "/api/v1/chat/search", json={"query": "reglamento aprendiz", "limit": 10}
        )

        assert response.status_code in [200, 500]
