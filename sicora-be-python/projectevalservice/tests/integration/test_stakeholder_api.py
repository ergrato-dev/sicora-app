"""
Integration Tests for Stakeholder API Endpoints

Tests the complete stakeholder management API including:
- CRUD operations
- Onboarding workflow
- Scope change requests
- Status management

Author: SICORA Team
Date: 2025
"""

import pytest
from uuid import uuid4
from httpx import AsyncClient


class TestStakeholderEndpoints:
    """Integration tests for stakeholder API endpoints."""

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_create_stakeholder(self, async_client: AsyncClient):
        """Test creating a stakeholder via API."""
        # Arrange
        stakeholder_data = {
            "name": "Integration Test Corp",
            "stakeholder_type": "company",
            "contact_person": "Test User",
            "email": f"test_{uuid4().hex[:8]}@example.com",
            "phone": "+57 300 000 0000",
            "sector": "Testing",
        }

        # Act
        response = await async_client.post(
            "/api/v1/stakeholders/",
            json=stakeholder_data,
            params={"created_by": str(uuid4())},
        )

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == stakeholder_data["name"]
        assert data["status"] == "active"
        assert data["expectations_documented"] is False

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_get_stakeholder(self, async_client: AsyncClient):
        """Test getting a stakeholder by ID."""
        # First create a stakeholder
        stakeholder_data = {
            "name": "Get Test Corp",
            "stakeholder_type": "company",
            "contact_person": "Get User",
            "email": f"get_{uuid4().hex[:8]}@example.com",
        }
        create_response = await async_client.post(
            "/api/v1/stakeholders/",
            json=stakeholder_data,
            params={"created_by": str(uuid4())},
        )
        stakeholder_id = create_response.json()["id"]

        # Act
        response = await async_client.get(f"/api/v1/stakeholders/{stakeholder_id}")

        # Assert
        assert response.status_code == 200
        assert response.json()["id"] == stakeholder_id

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_list_stakeholders(self, async_client: AsyncClient):
        """Test listing stakeholders."""
        # Act
        response = await async_client.get("/api/v1/stakeholders/")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_stakeholder_not_found(self, async_client: AsyncClient):
        """Test getting non-existent stakeholder returns 404."""
        # Act
        response = await async_client.get(f"/api/v1/stakeholders/{uuid4()}")

        # Assert
        assert response.status_code == 404

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_document_expectations(self, async_client: AsyncClient):
        """Test documenting stakeholder expectations."""
        # Create stakeholder first
        stakeholder_data = {
            "name": "Expectations Test Corp",
            "stakeholder_type": "company",
            "contact_person": "Test User",
            "email": f"exp_{uuid4().hex[:8]}@example.com",
        }
        create_response = await async_client.post(
            "/api/v1/stakeholders/",
            json=stakeholder_data,
            params={"created_by": str(uuid4())},
        )
        stakeholder_id = create_response.json()["id"]

        # Act
        expectations_data = {
            "expectations_summary": "El stakeholder espera un sistema de gestión de proyectos con funcionalidades avanzadas...",
            "scope_limitations": "No incluye integración con ERP",
            "deliverables_agreed": ["API REST", "Dashboard", "Documentación"],
        }
        response = await async_client.post(
            f"/api/v1/stakeholders/{stakeholder_id}/document-expectations",
            json=expectations_data,
            params={"documented_by": str(uuid4())},
        )

        # Assert
        assert response.status_code == 200
        assert response.json()["expectations_documented"] is True

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_acknowledge_limitations(self, async_client: AsyncClient):
        """Test acknowledging limitations."""
        # Create stakeholder first
        stakeholder_data = {
            "name": "Limitations Test Corp",
            "stakeholder_type": "company",
            "contact_person": "Test User",
            "email": f"lim_{uuid4().hex[:8]}@example.com",
        }
        create_response = await async_client.post(
            "/api/v1/stakeholders/",
            json=stakeholder_data,
            params={"created_by": str(uuid4())},
        )
        stakeholder_id = create_response.json()["id"]

        # Act
        acknowledgment_data = {
            "confirmation_text": "Confirmo que entiendo que este proyecto es desarrollado por aprendices en formación de OneVision, y que el alcance está limitado a las competencias del programa de formación. Acepto estas condiciones.",
            "digital_signature": "TEST-SIG-001",
        }
        response = await async_client.post(
            f"/api/v1/stakeholders/{stakeholder_id}/acknowledge-limitations",
            json=acknowledgment_data,
        )

        # Assert
        assert response.status_code == 200
        assert response.json()["limitations_acknowledged"] is True

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_establish_communication(self, async_client: AsyncClient):
        """Test establishing communication channel."""
        # Create stakeholder first
        stakeholder_data = {
            "name": "Communication Test Corp",
            "stakeholder_type": "company",
            "contact_person": "Test User",
            "email": f"com_{uuid4().hex[:8]}@example.com",
        }
        create_response = await async_client.post(
            "/api/v1/stakeholders/",
            json=stakeholder_data,
            params={"created_by": str(uuid4())},
        )
        stakeholder_id = create_response.json()["id"]

        # Act
        communication_data = {
            "primary_channel": "email",
            "secondary_channel": "teams",
            "meeting_frequency": "quincenal",
            "escalation_contact": "director@test.com",
        }
        response = await async_client.post(
            f"/api/v1/stakeholders/{stakeholder_id}/establish-communication",
            json=communication_data,
        )

        # Assert
        assert response.status_code == 200
        assert response.json()["communication_channel_established"] is True

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_collaboration_readiness(self, async_client: AsyncClient):
        """Test checking collaboration readiness."""
        # Create stakeholder first
        stakeholder_data = {
            "name": "Readiness Test Corp",
            "stakeholder_type": "company",
            "contact_person": "Test User",
            "email": f"ready_{uuid4().hex[:8]}@example.com",
        }
        create_response = await async_client.post(
            "/api/v1/stakeholders/",
            json=stakeholder_data,
            params={"created_by": str(uuid4())},
        )
        stakeholder_id = create_response.json()["id"]

        # Act
        response = await async_client.get(
            f"/api/v1/stakeholders/{stakeholder_id}/collaboration-readiness"
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "is_ready" in data
        assert "missing_requirements" in data
        assert "recommendations" in data
        # New stakeholder should not be ready
        assert data["is_ready"] is False

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_stakeholder_stats(self, async_client: AsyncClient):
        """Test getting stakeholder statistics."""
        # Act
        response = await async_client.get("/api/v1/stakeholders/stats/summary")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "total_stakeholders" in data
        assert "active_stakeholders" in data
        assert "collaboration_ready" in data
        assert "by_type" in data
        assert "by_status" in data

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_suspend_and_reactivate_stakeholder(self, async_client: AsyncClient):
        """Test suspending and reactivating a stakeholder."""
        # Create stakeholder first
        stakeholder_data = {
            "name": "Suspend Test Corp",
            "stakeholder_type": "company",
            "contact_person": "Test User",
            "email": f"susp_{uuid4().hex[:8]}@example.com",
        }
        create_response = await async_client.post(
            "/api/v1/stakeholders/",
            json=stakeholder_data,
            params={"created_by": str(uuid4())},
        )
        stakeholder_id = create_response.json()["id"]

        # Suspend
        suspend_data = {"reason": "Test suspension for integration testing"}
        suspend_response = await async_client.post(
            f"/api/v1/stakeholders/{stakeholder_id}/suspend",
            json=suspend_data,
        )
        assert suspend_response.status_code == 200
        assert suspend_response.json()["status"] == "suspended"

        # Reactivate
        reactivate_response = await async_client.post(
            f"/api/v1/stakeholders/{stakeholder_id}/reactivate"
        )
        assert reactivate_response.status_code == 200
        assert reactivate_response.json()["status"] == "active"
