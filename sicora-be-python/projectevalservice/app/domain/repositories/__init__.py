from .project_repository import ProjectRepository
from .evaluation_repository import EvaluationRepository
from .stakeholder_repository import StakeholderRepository
from .evaluation_criterion_repository import (
    EvaluationCriterionRepository,
    CriterionApprovalRepository,
    CriterionChangeHistoryRepository,
)

# Alias for compatibility
CriterionRepository = EvaluationCriterionRepository

__all__ = [
    "ProjectRepository",
    "EvaluationRepository",
    "StakeholderRepository",
    "EvaluationCriterionRepository",
    "CriterionRepository",
    "CriterionApprovalRepository",
    "CriterionChangeHistoryRepository",
]
