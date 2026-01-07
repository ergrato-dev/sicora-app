"""
FastAPI routers for MEvalService.
"""

from .committee_router import router as committee_router
from .student_case_router import router as student_case_router
from .improvement_plan_router import router as improvement_plan_router
from .sanction_router import router as sanction_router
from .appeal_router import router as appeal_router

__all__ = [
    "committee_router",
    "student_case_router",
    "improvement_plan_router",
    "sanction_router",
    "appeal_router",
]
