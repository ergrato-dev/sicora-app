"""Test configuration and fixtures for AIService tests."""

import pytest
from unittest.mock import MagicMock, AsyncMock
from uuid import uuid4

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


@pytest.fixture(scope="session")
def test_user_id():
    """Generate a test user ID."""
    return uuid4()


@pytest.fixture
def mock_current_user():
    """Mock authenticated user for testing."""
    return {
        "user_id": str(uuid4()),
        "username": "test_user",
        "email": "test@example.com",
        "roles": ["student"],
    }


@pytest.fixture
def mock_admin_user():
    """Mock admin user for testing."""
    return {
        "user_id": str(uuid4()),
        "username": "admin_user",
        "email": "admin@example.com",
        "roles": ["admin"],
    }


@pytest.fixture
def mock_kb_integration():
    """Create mock KB integration."""
    mock = MagicMock()
    mock.health_check = AsyncMock(return_value=True)
    mock.search_knowledge = AsyncMock(return_value=[])
    mock.get_chat_context = AsyncMock()
    mock.get_regulatory_context = AsyncMock(return_value=[])
    return mock


@pytest.fixture
def mock_openai_client():
    """Create mock OpenAI client."""
    mock = MagicMock()
    mock.chat_completion = AsyncMock(
        return_value={
            "choices": [{"message": {"content": "Mock response"}}],
            "model": "gpt-4",
            "usage": {"total_tokens": 50},
        }
    )
    mock.is_available.return_value = True
    mock.health_check = AsyncMock(return_value=True)
    return mock
