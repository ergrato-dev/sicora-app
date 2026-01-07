"""Tests for OpenAI Embedding Service."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.infrastructure.services.kb_services_impl import OpenAIEmbeddingService
from app.domain.exceptions.kb_exceptions import EmbeddingError
from app.config import settings


class TestOpenAIEmbeddingService:
    """Test cases for OpenAI Embedding Service."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = OpenAIEmbeddingService()
    
    @pytest.mark.asyncio
    async def test_generate_embedding_mock_mode(self):
        """Test embedding generation in mock mode (no API key)."""
        # Arrange
        original_api_key = settings.OPENAI_API_KEY
        settings.OPENAI_API_KEY = None
        service = OpenAIEmbeddingService()
        text = "Test text for embedding"
        
        try:
            # Act
            result = await service.generate_embedding(text)
            
            # Assert
            assert result is not None
            assert len(result.values) == settings.EMBEDDING_DIMENSION
            assert all(isinstance(v, float) for v in result.values)
            assert all(-1.0 <= v <= 1.0 for v in result.values)  # Check normalization
            
        finally:
            settings.OPENAI_API_KEY = original_api_key
    
    @pytest.mark.asyncio
    async def test_generate_embedding_deterministic_mock(self):
        """Test that mock embeddings are deterministic."""
        # Arrange
        original_api_key = settings.OPENAI_API_KEY
        settings.OPENAI_API_KEY = None
        service = OpenAIEmbeddingService()
        text = "Consistent test text"
        
        try:
            # Act
            result1 = await service.generate_embedding(text)
            result2 = await service.generate_embedding(text)
            
            # Assert
            assert result1.values == result2.values
            
        finally:
            settings.OPENAI_API_KEY = original_api_key
    
    @pytest.mark.asyncio
    async def test_generate_embedding_empty_text(self):
        """Test embedding generation with empty text.
        
        Note: In mock mode (no API key), empty text generates a mock embedding.
        With a real API key, empty text would raise EmbeddingError.
        This test verifies the mock mode behavior.
        """
        # Arrange - ensure we're in mock mode
        original_api_key = settings.OPENAI_API_KEY
        settings.OPENAI_API_KEY = None
        service = OpenAIEmbeddingService()
        
        try:
            # Act - in mock mode, empty string generates a deterministic mock embedding
            result = await service.generate_embedding("")
            
            # Assert - mock mode returns a valid Vector
            assert len(result.values) == settings.EMBEDDING_DIMENSION
        finally:
            settings.OPENAI_API_KEY = original_api_key
    
    @pytest.mark.asyncio
    async def test_generate_embeddings_batch_mock_mode(self):
        """Test batch embedding generation in mock mode."""
        # Arrange
        original_api_key = settings.OPENAI_API_KEY
        settings.OPENAI_API_KEY = None
        service = OpenAIEmbeddingService()
        texts = ["Text one", "Text two", "Text three"]
        
        try:
            # Act
            results = await service.generate_embeddings_batch(texts)
            
            # Assert
            assert len(results) == len(texts)
            for result in results:
                assert len(result.values) == settings.EMBEDDING_DIMENSION
                assert all(isinstance(v, float) for v in result.values)
                
        finally:
            settings.OPENAI_API_KEY = original_api_key
    
    @pytest.mark.asyncio
    async def test_generate_embeddings_batch_empty_list(self):
        """Test batch embedding generation with empty list."""
        # Act
        results = await self.service.generate_embeddings_batch([])
        
        # Assert
        assert results == []
    
    @pytest.mark.asyncio
    @patch('app.infrastructure.services.kb_services_impl.AsyncOpenAI')
    async def test_generate_embedding_with_api_key(self, mock_openai_class):
        """Test embedding generation with API key."""
        # Arrange
        mock_client = AsyncMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.data = [MagicMock()]
        mock_response.data[0].embedding = [0.1] * settings.EMBEDDING_DIMENSION
        mock_client.embeddings.create.return_value = mock_response
        
        with patch.object(settings, 'OPENAI_API_KEY', 'test-key'):
            service = OpenAIEmbeddingService()
            
            # Act
            result = await service.generate_embedding("Test text")
            
            # Assert
            assert len(result.values) == settings.EMBEDDING_DIMENSION
            assert all(v == 0.1 for v in result.values)
            mock_client.embeddings.create.assert_called_once()
    
    @pytest.mark.asyncio
    @patch('app.infrastructure.services.kb_services_impl.AsyncOpenAI')
    async def test_generate_embedding_api_error(self, mock_openai_class):
        """Test embedding generation with API error."""
        # Arrange
        mock_client = AsyncMock()
        mock_openai_class.return_value = mock_client
        mock_client.embeddings.create.side_effect = Exception("API Error")
        
        with patch.object(settings, 'OPENAI_API_KEY', 'test-key'):
            service = OpenAIEmbeddingService()
            
            # Act & Assert
            with pytest.raises(EmbeddingError):
                await service.generate_embedding("Test text")
    
    @pytest.mark.asyncio
    @patch('app.infrastructure.services.kb_services_impl.AsyncOpenAI')
    async def test_generate_embedding_wrong_dimension(self, mock_openai_class):
        """Test embedding generation with wrong dimension."""
        # Arrange
        mock_client = AsyncMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.data = [MagicMock()]
        mock_response.data[0].embedding = [0.1] * 100  # Wrong dimension
        mock_client.embeddings.create.return_value = mock_response
        
        with patch.object(settings, 'OPENAI_API_KEY', 'test-key'):
            service = OpenAIEmbeddingService()
            
            # Act & Assert
            with pytest.raises(EmbeddingError):
                await service.generate_embedding("Test text")
    
    @pytest.mark.asyncio
    @patch('app.infrastructure.services.kb_services_impl.AsyncOpenAI')
    async def test_generate_embeddings_batch_with_api_key(self, mock_openai_class):
        """Test batch embedding generation with API key."""
        # Arrange
        mock_client = AsyncMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.data = [MagicMock(), MagicMock()]
        mock_response.data[0].embedding = [0.1] * settings.EMBEDDING_DIMENSION
        mock_response.data[1].embedding = [0.2] * settings.EMBEDDING_DIMENSION
        mock_client.embeddings.create.return_value = mock_response
        
        with patch.object(settings, 'OPENAI_API_KEY', 'test-key'):
            service = OpenAIEmbeddingService()
            
            # Act
            results = await service.generate_embeddings_batch(["Text 1", "Text 2"])
            
            # Assert
            assert len(results) == 2
            assert all(v == 0.1 for v in results[0].values)
            assert all(v == 0.2 for v in results[1].values)
            mock_client.embeddings.create.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_embedding_long_text_truncation(self):
        """Test that long text is properly truncated."""
        # Arrange
        original_api_key = settings.OPENAI_API_KEY
        settings.OPENAI_API_KEY = None
        service = OpenAIEmbeddingService()
        long_text = "x" * (settings.MAX_CONTENT_LENGTH + 100)
        
        try:
            # Act
            result = await service.generate_embedding(long_text)
            
            # Assert
            assert result is not None
            assert len(result.values) == settings.EMBEDDING_DIMENSION
            
        finally:
            settings.OPENAI_API_KEY = original_api_key
