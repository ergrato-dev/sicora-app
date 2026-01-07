"""Tests for Enhanced Chat Service."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from uuid import uuid4

from app.application.services.enhanced_chat_service import EnhancedChatService
from app.application.dtos.ai_dtos import (
    EnhancedChatRequestDTO,
    ChatContext,
    KnowledgeSearchResult,
    MessageDTO,
)


class TestEnhancedChatService:
    """Test cases for Enhanced Chat Service."""

    def setup_method(self):
        """Set up test fixtures."""
        self.mock_kb_integration = MagicMock()
        self.mock_kb_integration.health_check = AsyncMock(return_value=True)
        self.mock_kb_integration.get_chat_context = AsyncMock()
        self.mock_kb_integration.search_knowledge = AsyncMock(return_value=[])
        self.mock_kb_integration.get_regulatory_context = AsyncMock(return_value=[])

        self.mock_openai_client = MagicMock()
        self.mock_openai_client.health_check = AsyncMock(return_value=True)
        self.mock_openai_client.chat_completion = AsyncMock()

        self.service = EnhancedChatService(
            kb_integration=self.mock_kb_integration,
            openai_client=self.mock_openai_client,
        )

        self.user_id = uuid4()

    def test_initialization(self):
        """Test service initializes correctly."""
        assert self.service.kb_integration is not None
        assert self.service.openai_client is not None
        assert self.service.regulatory_context_cache == {}

    @pytest.mark.asyncio
    async def test_generate_enhanced_response_without_kb(self):
        """Test generating response without KB integration."""
        # Configure mock
        self.mock_openai_client.chat_completion.return_value = {
            "choices": [{"message": {"content": "Test response"}}],
            "model": "gpt-4",
            "usage": {"total_tokens": 50},
        }

        request = EnhancedChatRequestDTO(
            message="Hello", user_id=self.user_id, use_knowledge_base=False
        )

        response = await self.service.generate_enhanced_response(request, [])

        assert response.content == "Test response"
        assert response.role == "assistant"
        assert response.metadata["kb_integration_used"] is False

    @pytest.mark.asyncio
    async def test_generate_enhanced_response_with_kb(self):
        """Test generating response with KB integration."""
        # Configure KB mock
        mock_context = ChatContext(
            query="test query",
            knowledge_results=[
                KnowledgeSearchResult(
                    id=str(uuid4()),
                    title="Test Article",
                    content="Test content",
                    content_type="article",
                    category="test",
                    relevance_score=0.9,
                )
            ],
            conversation_history=[],
            user_id=self.user_id,
            timestamp=datetime.utcnow(),
            categories=["test"],
        )
        self.mock_kb_integration.get_chat_context.return_value = mock_context

        # Configure OpenAI mock
        self.mock_openai_client.chat_completion.return_value = {
            "choices": [{"message": {"content": "KB-enhanced response"}}],
            "model": "gpt-4",
            "usage": {"total_tokens": 100},
        }

        request = EnhancedChatRequestDTO(
            message="What is the regulation?",
            user_id=self.user_id,
            use_knowledge_base=True,
            search_categories=["reglamento"],
        )

        response = await self.service.generate_enhanced_response(request, [])

        assert response.content == "KB-enhanced response"
        assert response.metadata["kb_integration_used"] is True
        assert response.metadata["knowledge_sources"] == 1

    @pytest.mark.asyncio
    async def test_generate_enhanced_response_with_history(self):
        """Test generating response with conversation history."""
        self.mock_openai_client.chat_completion.return_value = {
            "choices": [{"message": {"content": "Response with context"}}],
            "model": "gpt-4",
            "usage": {"total_tokens": 75},
        }

        conversation_history = [
            MessageDTO(content="Previous question", role="user", message_type="text"),
            MessageDTO(
                content="Previous answer", role="assistant", message_type="text"
            ),
        ]

        request = EnhancedChatRequestDTO(
            message="Follow up question", user_id=self.user_id, use_knowledge_base=False
        )

        await self.service.generate_enhanced_response(request, conversation_history)

        # Verify OpenAI was called with history in messages
        call_args = self.mock_openai_client.chat_completion.call_args
        messages = call_args.kwargs.get("messages", [])

        # Should have: system + 2 history + 1 user
        assert len(messages) >= 3

    def test_build_contextual_system_prompt_without_context(self):
        """Test building system prompt without context."""
        prompt = self.service._build_contextual_system_prompt(None)

        assert "SICORA" in prompt
        assert "OneVision" in prompt or "SENA" in prompt

    def test_build_contextual_system_prompt_with_context(self):
        """Test building system prompt with context."""
        context = ChatContext(
            query="test",
            knowledge_results=[
                KnowledgeSearchResult(
                    id=str(uuid4()),
                    title="Reglamento Aprendiz",
                    content="Content about regulations",
                    content_type="article",
                    category="reglamento",
                    relevance_score=0.95,
                )
            ],
            conversation_history=[],
            user_id=self.user_id,
            timestamp=datetime.utcnow(),
            categories=["reglamento"],
        )

        prompt = self.service._build_contextual_system_prompt(context)

        assert "CONOCIMIENTO" in prompt
        assert "Reglamento Aprendiz" in prompt
        assert "reglamento" in prompt.lower()

    def test_prepare_conversation_messages(self):
        """Test preparing conversation messages for OpenAI."""
        history = [
            MessageDTO(content="Q1", role="user", message_type="text"),
            MessageDTO(content="A1", role="assistant", message_type="text"),
            MessageDTO(content="Q2", role="user", message_type="text"),
        ]

        messages = self.service._prepare_conversation_messages(history, "System prompt")

        assert messages[0]["role"] == "system"
        assert messages[0]["content"] == "System prompt"
        assert len(messages) == 4  # system + 3 history

    def test_prepare_conversation_messages_limits_history(self):
        """Test that conversation history is limited to last 8 messages."""
        history = [
            MessageDTO(content=f"Msg {i}", role="user", message_type="text")
            for i in range(20)
        ]

        messages = self.service._prepare_conversation_messages(history, "System")

        # Should have system + 8 history = 9 messages
        assert len(messages) == 9

    @pytest.mark.asyncio
    async def test_search_regulatory_content(self):
        """Test searching regulatory content."""
        mock_results = [
            KnowledgeSearchResult(
                id=str(uuid4()),
                title="Capítulo 1",
                content="Regulatory content",
                content_type="article",
                category="reglamento",
                relevance_score=0.9,
            )
        ]
        self.mock_kb_integration.get_regulatory_context.return_value = mock_results

        results = await self.service.search_regulatory_content(
            query="derechos aprendiz", user_id=self.user_id
        )

        assert len(results) == 1
        assert results[0].title == "Capítulo 1"

    @pytest.mark.asyncio
    async def test_search_regulatory_content_uses_cache(self):
        """Test that regulatory search uses cache."""
        mock_results = [
            KnowledgeSearchResult(
                id=str(uuid4()),
                title="Cached Result",
                content="Cached content",
                content_type="article",
                category="reglamento",
                relevance_score=0.85,
            )
        ]
        self.mock_kb_integration.get_regulatory_context.return_value = mock_results

        # First call
        await self.service.search_regulatory_content("test query", self.user_id)

        # Second call with same query (should use cache)
        results = await self.service.search_regulatory_content(
            "test query", self.user_id
        )

        # KB should be called only once
        assert self.mock_kb_integration.get_regulatory_context.call_count == 1
        assert results[0].title == "Cached Result"

    @pytest.mark.asyncio
    async def test_get_quick_answer_found(self):
        """Test getting quick answer when FAQ exists."""
        self.mock_kb_integration.search_knowledge.return_value = [
            KnowledgeSearchResult(
                id=str(uuid4()),
                title="FAQ Item",
                content="Quick answer content",
                content_type="faq",
                category="general",
                relevance_score=0.98,
            )
        ]

        answer = await self.service.get_quick_answer(
            question="Common question?", user_id=self.user_id
        )

        assert answer == "Quick answer content"

    @pytest.mark.asyncio
    async def test_get_quick_answer_not_found(self):
        """Test getting quick answer when no FAQ matches."""
        self.mock_kb_integration.search_knowledge.return_value = [
            KnowledgeSearchResult(
                id=str(uuid4()),
                title="Regular Article",
                content="Not a FAQ",
                content_type="article",
                category="general",
                relevance_score=0.7,
            )
        ]

        answer = await self.service.get_quick_answer(
            question="Complex question?", user_id=self.user_id
        )

        assert answer is None

    @pytest.mark.asyncio
    async def test_get_quick_answer_no_results(self):
        """Test getting quick answer with no results."""
        self.mock_kb_integration.search_knowledge.return_value = []

        answer = await self.service.get_quick_answer(
            question="Unknown question?", user_id=self.user_id
        )

        assert answer is None

    @pytest.mark.asyncio
    async def test_health_check_all_healthy(self):
        """Test health check when all services are healthy."""
        self.mock_kb_integration.health_check.return_value = True
        self.mock_openai_client.health_check.return_value = True

        result = await self.service.health_check()

        assert result["enhanced_chat_service"] is True
        assert result["kb_integration"] is True
        assert result["openai_client"] is True
        assert "cache_size" in result

    @pytest.mark.asyncio
    async def test_health_check_kb_unhealthy(self):
        """Test health check when KB is unhealthy."""
        self.mock_kb_integration.health_check.return_value = False
        self.mock_openai_client.health_check.return_value = True

        result = await self.service.health_check()

        assert result["enhanced_chat_service"] is True
        assert result["kb_integration"] is False

    @pytest.mark.asyncio
    async def test_health_check_error(self):
        """Test health check when error occurs."""
        self.mock_kb_integration.health_check.side_effect = Exception(
            "Connection failed"
        )

        result = await self.service.health_check()

        assert result["enhanced_chat_service"] is False
        assert "error" in result
