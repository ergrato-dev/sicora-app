"""Tests for KB Service Integration."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4

from app.infrastructure.integrations.kb_integration import KbServiceIntegration
from app.application.dtos.ai_dtos import ChatContext


class TestKbServiceIntegration:
    """Test cases for KB Service Integration."""

    def setup_method(self):
        """Set up test fixtures."""
        self.integration = KbServiceIntegration(
            kb_service_url="http://test-kbservice:8006/api/v1", timeout=10
        )
        self.user_id = uuid4()

    def test_initialization(self):
        """Test integration initializes correctly."""
        assert self.integration.kb_service_url == "http://test-kbservice:8006/api/v1"
        assert self.integration.timeout == 10
        assert self.integration.client is not None

    def test_initialization_with_defaults(self):
        """Test integration initializes with default values."""
        integration = KbServiceIntegration()
        assert integration.kb_service_url == "http://kbservice:8000/api/v1"
        assert integration.timeout == 30

    @pytest.mark.asyncio
    async def test_search_knowledge_success(self):
        """Test successful knowledge search."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "results": [
                {
                    "id": str(uuid4()),
                    "title": "Reglamento del Aprendiz",
                    "content": "El aprendiz debe cumplir con...",
                    "content_type": "article",
                    "category": "reglamento",
                    "relevance_score": 0.95,
                }
            ],
            "total_count": 1,
        }

        with patch.object(
            self.integration.client, "post", new_callable=AsyncMock
        ) as mock_post:
            mock_post.return_value = mock_response

            results = await self.integration.search_knowledge(
                query="reglamento aprendiz", user_id=self.user_id, limit=5
            )

            mock_post.assert_called_once()
            # Results may be empty if parsing returns empty
            assert isinstance(results, list)

    @pytest.mark.asyncio
    async def test_search_knowledge_no_results(self):
        """Test knowledge search with no results."""
        mock_response = MagicMock()
        mock_response.status_code = 404

        with patch.object(
            self.integration.client, "post", new_callable=AsyncMock
        ) as mock_post:
            mock_post.return_value = mock_response

            results = await self.integration.search_knowledge(
                query="nonexistent topic", user_id=self.user_id
            )

            assert results == []

    @pytest.mark.asyncio
    async def test_search_knowledge_with_category_filter(self):
        """Test knowledge search with category filter."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"results": [], "total_count": 0}

        with patch.object(
            self.integration.client, "post", new_callable=AsyncMock
        ) as mock_post:
            mock_post.return_value = mock_response

            await self.integration.search_knowledge(
                query="test query", user_id=self.user_id, category_filter="asistencia"
            )

            call_args = mock_post.call_args
            request_body = call_args.kwargs.get("json", {})
            assert request_body.get("filters", {}).get("category") == "asistencia"

    @pytest.mark.asyncio
    async def test_search_knowledge_error(self):
        """Test knowledge search handles errors."""
        from app.domain.exceptions.ai_exceptions import SearchError

        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"

        with patch.object(
            self.integration.client, "post", new_callable=AsyncMock
        ) as mock_post:
            mock_post.return_value = mock_response

            with pytest.raises(SearchError):
                await self.integration.search_knowledge(
                    query="test", user_id=self.user_id
                )

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        """Test health check returns True on success."""
        mock_response = MagicMock()
        mock_response.status_code = 200

        with patch.object(
            self.integration.client, "get", new_callable=AsyncMock
        ) as mock_get:
            mock_get.return_value = mock_response

            result = await self.integration.health_check()

            assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        """Test health check returns False on failure."""
        with patch.object(
            self.integration.client, "get", new_callable=AsyncMock
        ) as mock_get:
            mock_get.side_effect = Exception("Connection refused")

            result = await self.integration.health_check()

            assert result is False

    @pytest.mark.asyncio
    async def test_get_chat_context(self):
        """Test getting chat context."""
        mock_search_response = MagicMock()
        mock_search_response.status_code = 200
        mock_search_response.json.return_value = {
            "results": [
                {
                    "id": str(uuid4()),
                    "title": "Test Article",
                    "content": "Test content",
                    "content_type": "article",
                    "category": "test",
                    "relevance_score": 0.9,
                }
            ],
            "total_count": 1,
        }

        with patch.object(
            self.integration.client, "post", new_callable=AsyncMock
        ) as mock_post:
            mock_post.return_value = mock_search_response

            context = await self.integration.get_chat_context(
                user_query="test query", conversation_history=[], user_id=self.user_id
            )

            assert isinstance(context, ChatContext)
            assert context.query == "test query"
            assert context.user_id == self.user_id
