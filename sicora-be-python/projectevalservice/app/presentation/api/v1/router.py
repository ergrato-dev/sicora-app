"""
API Router v1 - ProjectEvalService REST API routes.

Author: SICORA Team
Date: 2025
"""

from fastapi import APIRouter

from ....presentation.controllers.project_controller import router as project_router
from ....presentation.controllers.evaluation_controller import (
    router as evaluation_router,
)
from ....presentation.controllers.criterion_controller import router as criterion_router
from ....presentation.controllers.stakeholder_controller import (
    router as stakeholder_router,
)

api_router = APIRouter()

# Include all routers
api_router.include_router(project_router)
api_router.include_router(evaluation_router)
api_router.include_router(criterion_router)
api_router.include_router(stakeholder_router)

# TODO: Include additional routers when implemented
# api_router.include_router(group_router)
# api_router.include_router(voice_note_router)
