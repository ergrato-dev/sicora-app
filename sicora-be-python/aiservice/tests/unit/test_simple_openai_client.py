"""Tests for Simple OpenAI Client Mock."""

import pytest
from app.infrastructure.external.simple_openai_client import SimpleOpenAIClient


class TestSimpleOpenAIClient:
    """Test cases for Simple OpenAI Client Mock."""

    def setup_method(self):
        """Set up test fixtures."""
        self.client = SimpleOpenAIClient(api_key="test-key", organization="test-org")

    def test_client_initialization(self):
        """Test client initializes correctly."""
        assert self.client.api_key == "test-key"
        assert self.client.organization == "test-org"
        assert self.client.default_model == "gpt-4"

    def test_client_initialization_without_api_key(self):
        """Test client initializes without API key."""
        client = SimpleOpenAIClient()
        assert client.api_key is None
        assert client.organization is None

    @pytest.mark.asyncio
    async def test_chat_completion_basic(self):
        """Test basic chat completion."""
        messages = [{"role": "user", "content": "Hello, how are you?"}]

        response = await self.client.chat_completion(messages)

        assert "id" in response
        assert response["object"] == "chat.completion"
        assert "model" in response
        assert len(response["choices"]) == 1
        assert response["choices"][0]["message"]["role"] == "assistant"
        assert len(response["choices"][0]["message"]["content"]) > 0

    @pytest.mark.asyncio
    async def test_chat_completion_with_reglamento_keyword(self):
        """Test chat completion with reglamento keyword returns relevant response."""
        messages = [{"role": "user", "content": "¿Cuál es el reglamento del aprendiz?"}]

        response = await self.client.chat_completion(messages)

        content = response["choices"][0]["message"]["content"]
        assert "reglamento" in content.lower()

    @pytest.mark.asyncio
    async def test_chat_completion_with_norma_keyword(self):
        """Test chat completion with norma keyword returns relevant response."""
        messages = [
            {"role": "user", "content": "¿Cuáles son las normas de convivencia?"}
        ]

        response = await self.client.chat_completion(messages)

        content = response["choices"][0]["message"]["content"]
        assert "reglamento" in content.lower() or "norma" in content.lower()

    @pytest.mark.asyncio
    async def test_chat_completion_with_custom_model(self):
        """Test chat completion with custom model."""
        messages = [{"role": "user", "content": "Test message"}]

        response = await self.client.chat_completion(messages, model="gpt-3.5-turbo")

        assert response["model"] == "gpt-3.5-turbo"

    @pytest.mark.asyncio
    async def test_chat_completion_with_temperature(self):
        """Test chat completion with temperature parameter."""
        messages = [{"role": "user", "content": "Test message"}]

        response = await self.client.chat_completion(messages, temperature=0.5)

        assert response is not None
        assert "choices" in response

    @pytest.mark.asyncio
    async def test_chat_completion_usage_tokens(self):
        """Test chat completion returns token usage."""
        messages = [{"role": "user", "content": "Test message with some words"}]

        response = await self.client.chat_completion(messages)

        assert "usage" in response
        assert "prompt_tokens" in response["usage"]
        assert "completion_tokens" in response["usage"]
        assert "total_tokens" in response["usage"]
        assert response["usage"]["total_tokens"] > 0

    @pytest.mark.asyncio
    async def test_chat_completion_multiple_messages(self):
        """Test chat completion with conversation history."""
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "First question"},
            {"role": "assistant", "content": "First answer"},
            {"role": "user", "content": "Second question"},
        ]

        response = await self.client.chat_completion(messages)

        assert response is not None
        assert response["choices"][0]["finish_reason"] == "stop"

    def test_is_available(self):
        """Test client availability check."""
        assert self.client.is_available() is True

    def test_is_available_without_api_key(self):
        """Test client availability returns True for mock client."""
        client = SimpleOpenAIClient()
        # Mock client is always available
        assert client.is_available() is True
