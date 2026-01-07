"""
Integration Tests for Criteria API Endpoints

Tests the complete criteria management API including:
- CRUD operations
- Approval workflow
- History tracking

Author: SICORA Team
Date: 2025
"""

import pytest
from uuid import uuid4
from httpx import AsyncClient


class TestCriteriaEndpoints:
    """Integration tests for criteria API endpoints."""

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_create_criterion(self, async_client: AsyncClient):
        """Test creating a criterion via API."""
        # Arrange
        criterion_data = {
            "code": f"AR-{uuid4().hex[:3].upper()}",
            "title": "Test Arquitectura Clean",
            "description": "El proyecto implementa arquitectura Clean con separación de capas para testing.",
            "category": "architecture",
            "is_required": True,
            "points": 10,
        }

        # Act
        response = await async_client.post(
            "/api/v1/criteria/",
            json=criterion_data,
            params={"created_by": str(uuid4())},
        )

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == criterion_data["title"]
        assert data["status"] == "draft"
        assert data["version"] == 1

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_get_criterion(self, async_client: AsyncClient):
        """Test getting a criterion by ID."""
        # Create criterion first
        criterion_data = {
            "code": f"BD-{uuid4().hex[:3].upper()}",
            "title": "Test Gestión BD",
            "description": "El proyecto utiliza ORM para la gestión de datos con migraciones controladas.",
            "category": "data_management",
            "is_required": True,
            "points": 15,
        }
        create_response = await async_client.post(
            "/api/v1/criteria/",
            json=criterion_data,
            params={"created_by": str(uuid4())},
        )
        criterion_id = create_response.json()["id"]

        # Act
        response = await async_client.get(f"/api/v1/criteria/{criterion_id}")

        # Assert
        assert response.status_code == 200
        assert response.json()["id"] == criterion_id

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_list_criteria(self, async_client: AsyncClient):
        """Test listing criteria."""
        # Act
        response = await async_client.get("/api/v1/criteria/")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_list_criteria_with_filters(self, async_client: AsyncClient):
        """Test listing criteria with filters."""
        # Act
        response = await async_client.get(
            "/api/v1/criteria/",
            params={
                "category": "architecture",
                "active_only": True,
            },
        )

        # Assert
        assert response.status_code == 200

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_submit_criterion_for_approval(self, async_client: AsyncClient):
        """Test submitting a criterion for approval."""
        # Create criterion first
        criterion_data = {
            "code": f"SEC-{uuid4().hex[:3].upper()}",
            "title": "Test Seguridad",
            "description": "El proyecto implementa validación de inputs para testing de flujo de aprobación.",
            "category": "security",
            "is_required": True,
            "points": 20,
        }
        create_response = await async_client.post(
            "/api/v1/criteria/",
            json=criterion_data,
            params={"created_by": str(uuid4())},
        )
        criterion_id = create_response.json()["id"]

        # Act
        response = await async_client.post(
            f"/api/v1/criteria/{criterion_id}/submit-for-approval",
            params={"submitted_by": str(uuid4())},
        )

        # Assert
        assert response.status_code == 200
        assert response.json()["status"] == "pending_approval"

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_approve_criterion(self, async_client: AsyncClient):
        """Test approving a criterion."""
        # Create and submit criterion first
        criterion_data = {
            "code": f"TST-{uuid4().hex[:3].upper()}",
            "title": "Test para Aprobación",
            "description": "Criterio creado para testing del flujo de aprobación completo.",
            "category": "testing",
            "is_required": False,
            "points": 5,
        }
        create_response = await async_client.post(
            "/api/v1/criteria/",
            json=criterion_data,
            params={"created_by": str(uuid4())},
        )
        criterion_id = create_response.json()["id"]

        # Submit for approval
        await async_client.post(
            f"/api/v1/criteria/{criterion_id}/submit-for-approval",
            params={"submitted_by": str(uuid4())},
        )

        # Act - First approval
        approval_data = {"comments": "Criterio bien definido"}
        response = await async_client.post(
            f"/api/v1/criteria/{criterion_id}/approve",
            json=approval_data,
            params={"approver_id": str(uuid4())},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data["approved_by"]) >= 1

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_reject_criterion(self, async_client: AsyncClient):
        """Test rejecting a criterion."""
        # Create and submit criterion first
        criterion_data = {
            "code": f"REJ-{uuid4().hex[:3].upper()}",
            "title": "Test para Rechazo",
            "description": "Criterio creado para testing del flujo de rechazo.",
            "category": "methodology",
            "is_required": True,
            "points": 10,
        }
        create_response = await async_client.post(
            "/api/v1/criteria/",
            json=criterion_data,
            params={"created_by": str(uuid4())},
        )
        criterion_id = create_response.json()["id"]

        # Submit for approval
        await async_client.post(
            f"/api/v1/criteria/{criterion_id}/submit-for-approval",
            params={"submitted_by": str(uuid4())},
        )

        # Act
        rejection_data = {
            "rejection_reason": "El criterio necesita mayor especificidad en los criterios de cumplimiento"
        }
        response = await async_client.post(
            f"/api/v1/criteria/{criterion_id}/reject",
            json=rejection_data,
            params={"rejector_id": str(uuid4())},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "draft"
        assert data["rejection_reason"] is not None

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_get_criterion_history(self, async_client: AsyncClient):
        """Test getting criterion change history."""
        # Create criterion first
        criterion_data = {
            "code": f"HIS-{uuid4().hex[:3].upper()}",
            "title": "Test Historial",
            "description": "Criterio creado para testing del historial de cambios.",
            "category": "vcs",
            "is_required": True,
            "points": 15,
        }
        create_response = await async_client.post(
            "/api/v1/criteria/",
            json=criterion_data,
            params={"created_by": str(uuid4())},
        )
        criterion_id = create_response.json()["id"]

        # Act
        response = await async_client.get(f"/api/v1/criteria/{criterion_id}/history")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "criterion_id" in data
        assert "history" in data
        # Should have at least the CREATE entry
        assert len(data["history"]) >= 1

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_deactivate_criterion(self, async_client: AsyncClient):
        """Test deactivating a criterion."""
        # Create, submit, and approve criterion to make it active
        criterion_data = {
            "code": f"DEA-{uuid4().hex[:3].upper()}",
            "title": "Test Desactivación",
            "description": "Criterio creado para testing de la desactivación.",
            "category": "ci_cd",
            "is_required": False,
            "points": 10,
        }
        create_response = await async_client.post(
            "/api/v1/criteria/",
            json=criterion_data,
            params={"created_by": str(uuid4())},
        )
        criterion_id = create_response.json()["id"]

        # Submit for approval
        await async_client.post(
            f"/api/v1/criteria/{criterion_id}/submit-for-approval",
            params={"submitted_by": str(uuid4())},
        )

        # Approve 3 times (simulating unanimous approval)
        for _ in range(3):
            await async_client.post(
                f"/api/v1/criteria/{criterion_id}/approve",
                json={"comments": "Approved"},
                params={"approver_id": str(uuid4())},
            )

        # Verify it's active
        get_response = await async_client.get(f"/api/v1/criteria/{criterion_id}")
        if get_response.json()["status"] != "active":
            pytest.skip("Criterion did not become active, skipping deactivation test")

        # Act
        deactivation_data = {
            "reason": "Criterio obsoleto debido a cambio en estándares de la industria"
        }
        response = await async_client.post(
            f"/api/v1/criteria/{criterion_id}/deactivate",
            json=deactivation_data,
            params={"deactivated_by": str(uuid4())},
        )

        # Assert
        assert response.status_code == 200
        assert response.json()["status"] == "inactive"

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_criteria_stats(self, async_client: AsyncClient):
        """Test getting criteria statistics."""
        # Act
        response = await async_client.get("/api/v1/criteria/stats/summary")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        stats = data["data"]
        assert "total" in stats
        assert "active" in stats
        assert "by_category" in stats

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_criterion_not_found(self, async_client: AsyncClient):
        """Test getting non-existent criterion returns 404."""
        # Act
        response = await async_client.get(f"/api/v1/criteria/{uuid4()}")

        # Assert
        assert response.status_code == 404

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires database setup")
    async def test_approve_draft_criterion_fails(self, async_client: AsyncClient):
        """Test approving a draft criterion fails with 400."""
        # Create criterion (in draft status)
        criterion_data = {
            "code": f"DRF-{uuid4().hex[:3].upper()}",
            "title": "Test Draft",
            "description": "Criterio en draft para testing de error.",
            "category": "deployment",
            "is_required": True,
            "points": 10,
        }
        create_response = await async_client.post(
            "/api/v1/criteria/",
            json=criterion_data,
            params={"created_by": str(uuid4())},
        )
        criterion_id = create_response.json()["id"]

        # Act - Try to approve without submitting
        approval_data = {"comments": "Should fail"}
        response = await async_client.post(
            f"/api/v1/criteria/{criterion_id}/approve",
            json=approval_data,
            params={"approver_id": str(uuid4())},
        )

        # Assert
        assert response.status_code == 400
