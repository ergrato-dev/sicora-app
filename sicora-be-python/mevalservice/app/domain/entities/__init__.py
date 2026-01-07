"""
Domain entities for MEvalService.

This module contains all business entities for the Monthly Evaluation Committee
system according to Acuerdo OneVision 009/2024.
"""

from .committee import Committee, CommitteeType, CommitteeStatus
from .committee_member import CommitteeMember, MemberRole
from .committee_decision import CommitteeDecision, DecisionType
from .student_case import (
    StudentCase,
    CaseType,
    CaseStatus,
    DetectionCriteria,
    EvidenceDocument,
)
from .improvement_plan import (
    ImprovementPlan,
    PlanType,
    PlanStatus,
    Objective,
    Activity,
    SuccessCriteria,
)
from .sanction import Sanction, SanctionType, SeverityLevel, ComplianceStatus
from .appeal import Appeal, AdmissibilityStatus, AppealDecision

__all__ = [
    # Committee
    "Committee",
    "CommitteeType",
    "CommitteeStatus",
    # CommitteeMember
    "CommitteeMember",
    "MemberRole",
    # CommitteeDecision
    "CommitteeDecision",
    "DecisionType",
    # StudentCase
    "StudentCase",
    "CaseType",
    "CaseStatus",
    "DetectionCriteria",
    "EvidenceDocument",
    # ImprovementPlan
    "ImprovementPlan",
    "PlanType",
    "PlanStatus",
    "Objective",
    "Activity",
    "SuccessCriteria",
    # Sanction
    "Sanction",
    "SanctionType",
    "SeverityLevel",
    "ComplianceStatus",
    # Appeal
    "Appeal",
    "AdmissibilityStatus",
    "AppealDecision",
]
