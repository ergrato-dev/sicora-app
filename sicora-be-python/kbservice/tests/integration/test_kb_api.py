"""Simple integration tests for Knowledge Base API - endpoint availability."""

import pytest


class TestEndpointAvailability:
    """Test that main endpoints are available and configured."""

    def test_app_imports_correctly(self):
        """Test that the FastAPI app can be imported without errors."""
        from main import app
        assert app is not None
        assert app.title == "SICORA KbService API"

    def test_routers_configured(self):
        """Test that all routers are properly configured."""
        from main import app
        
        # Get all routes
        routes = [r.path for r in app.routes if hasattr(r, 'path')]
        
        # Verify KB routes exist
        assert "/api/v1/kb/items" in routes
        assert "/api/v1/kb/search" in routes
        assert "/api/v1/kb/query" in routes
        assert "/api/v1/kb/categories" in routes
        
        # Verify admin routes exist
        assert "/api/v1/kb/admin/health" in routes
        assert "/api/v1/kb/admin/metrics" in routes
        
        # Verify PDF routes exist
        assert "/api/v1/pdf/upload-pdf" in routes
        assert "/api/v1/pdf/batch-upload-pdf" in routes

    def test_cors_middleware_configured(self):
        """Test that CORS middleware is configured."""
        from main import app
        
        middleware_classes = [m.cls.__name__ for m in app.user_middleware]
        assert "CORSMiddleware" in middleware_classes

    def test_exception_handlers_configured(self):
        """Test that custom exception handlers are configured."""
        from main import app
        from app.domain.exceptions.kb_exceptions import KbDomainException
        from fastapi import HTTPException
        
        assert KbDomainException in app.exception_handlers
        assert HTTPException in app.exception_handlers

    def test_lifespan_configured(self):
        """Test that lifespan context manager is configured."""
        from main import app
        
        assert app.router.lifespan_context is not None

    def test_total_endpoints_count(self):
        """Test that we have expected number of endpoints."""
        from main import app
        
        api_routes = [
            r for r in app.routes 
            if hasattr(r, 'path') and r.path.startswith('/api/')
        ]
        
        # We should have at least 15 API endpoints
        assert len(api_routes) >= 15

    def test_health_endpoint_config(self):
        """Test health endpoint is configured correctly."""
        from main import app
        
        health_routes = [
            r for r in app.routes 
            if hasattr(r, 'path') and r.path == '/health'
        ]
        
        assert len(health_routes) == 1
