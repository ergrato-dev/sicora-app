"""
Repository interfaces for MEvalService.

Defines abstract interfaces for data access following Clean Architecture.
"""

from abc import ABC, abstractmethod
from datetime import date
from typing import Optional
from uuid import UUID

from .entities import (
    Appeal,
    Committee,
    CommitteeDecision,
    CommitteeMember,
    ImprovementPlan,
    Sanction,
    StudentCase,
    CaseStatus,
    CaseType,
    CommitteeStatus,
    CommitteeType,
    PlanStatus,
    SanctionType,
    ComplianceStatus,
    AdmissibilityStatus,
    AppealDecision,
)


class CommitteeRepository(ABC):
    """Repository interface for Committee entity."""

    @abstractmethod
    async def create(self, committee: Committee) -> Committee:
        """Create a new committee."""
        pass

    @abstractmethod
    async def get_by_id(self, committee_id: UUID) -> Optional[Committee]:
        """Get committee by ID."""
        pass

    @abstractmethod
    async def update(self, committee: Committee) -> Committee:
        """Update an existing committee."""
        pass

    @abstractmethod
    async def delete(self, committee_id: UUID) -> bool:
        """Delete a committee."""
        pass

    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Committee]:
        """Get all committees with pagination."""
        pass

    @abstractmethod
    async def get_by_date_range(
        self,
        start_date: date,
        end_date: date,
    ) -> list[Committee]:
        """Get committees within a date range."""
        pass

    @abstractmethod
    async def get_by_type(
        self,
        committee_type: CommitteeType,
    ) -> list[Committee]:
        """Get committees by type."""
        pass

    @abstractmethod
    async def get_by_status(
        self,
        status: CommitteeStatus,
    ) -> list[Committee]:
        """Get committees by status."""
        pass

    @abstractmethod
    async def get_by_training_center(
        self,
        training_center_id: UUID,
    ) -> list[Committee]:
        """Get committees by training center."""
        pass

    @abstractmethod
    async def get_monthly_for_date(
        self,
        year: int,
        month: int,
        training_center_id: UUID,
    ) -> Optional[Committee]:
        """Get the monthly committee for a specific month."""
        pass

    @abstractmethod
    async def get_next_scheduled(
        self,
        training_center_id: UUID,
    ) -> Optional[Committee]:
        """Get the next scheduled committee for a training center."""
        pass


class CommitteeMemberRepository(ABC):
    """Repository interface for CommitteeMember entity."""

    @abstractmethod
    async def create(self, member: CommitteeMember) -> CommitteeMember:
        """Create a new committee member."""
        pass

    @abstractmethod
    async def get_by_id(self, member_id: UUID) -> Optional[CommitteeMember]:
        """Get member by ID."""
        pass

    @abstractmethod
    async def update(self, member: CommitteeMember) -> CommitteeMember:
        """Update an existing member."""
        pass

    @abstractmethod
    async def delete(self, member_id: UUID) -> bool:
        """Delete a member."""
        pass

    @abstractmethod
    async def get_by_committee(
        self,
        committee_id: UUID,
    ) -> list[CommitteeMember]:
        """Get all members of a committee."""
        pass

    @abstractmethod
    async def get_present_members(
        self,
        committee_id: UUID,
    ) -> list[CommitteeMember]:
        """Get present members of a committee."""
        pass

    @abstractmethod
    async def get_voting_members(
        self,
        committee_id: UUID,
    ) -> list[CommitteeMember]:
        """Get members with voting rights."""
        pass

    @abstractmethod
    async def get_quorum_count(
        self,
        committee_id: UUID,
    ) -> int:
        """Get count of members required for quorum."""
        pass


class CommitteeDecisionRepository(ABC):
    """Repository interface for CommitteeDecision entity."""

    @abstractmethod
    async def create(self, decision: CommitteeDecision) -> CommitteeDecision:
        """Create a new decision."""
        pass

    @abstractmethod
    async def get_by_id(self, decision_id: UUID) -> Optional[CommitteeDecision]:
        """Get decision by ID."""
        pass

    @abstractmethod
    async def update(self, decision: CommitteeDecision) -> CommitteeDecision:
        """Update an existing decision."""
        pass

    @abstractmethod
    async def delete(self, decision_id: UUID) -> bool:
        """Delete a decision."""
        pass

    @abstractmethod
    async def get_by_committee(
        self,
        committee_id: UUID,
    ) -> list[CommitteeDecision]:
        """Get all decisions from a committee."""
        pass

    @abstractmethod
    async def get_by_student_case(
        self,
        student_case_id: UUID,
    ) -> Optional[CommitteeDecision]:
        """Get decision for a student case."""
        pass

    @abstractmethod
    async def get_unanimous_decisions(
        self,
        committee_id: UUID,
    ) -> list[CommitteeDecision]:
        """Get unanimous decisions from a committee."""
        pass

    @abstractmethod
    async def get_approval_rate(
        self,
        committee_id: UUID,
    ) -> float:
        """Get the approval rate for a committee."""
        pass


class StudentCaseRepository(ABC):
    """Repository interface for StudentCase entity."""

    @abstractmethod
    async def create(self, case: StudentCase) -> StudentCase:
        """Create a new student case."""
        pass

    @abstractmethod
    async def get_by_id(self, case_id: UUID) -> Optional[StudentCase]:
        """Get case by ID."""
        pass

    @abstractmethod
    async def update(self, case: StudentCase) -> StudentCase:
        """Update an existing case."""
        pass

    @abstractmethod
    async def delete(self, case_id: UUID) -> bool:
        """Delete a case."""
        pass

    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[StudentCase]:
        """Get all cases with pagination."""
        pass

    @abstractmethod
    async def get_by_student(
        self,
        student_id: UUID,
    ) -> list[StudentCase]:
        """Get all cases for a student."""
        pass

    @abstractmethod
    async def get_by_committee(
        self,
        committee_id: UUID,
    ) -> list[StudentCase]:
        """Get all cases assigned to a committee."""
        pass

    @abstractmethod
    async def get_by_status(
        self,
        status: CaseStatus,
    ) -> list[StudentCase]:
        """Get cases by status."""
        pass

    @abstractmethod
    async def get_by_type(
        self,
        case_type: CaseType,
    ) -> list[StudentCase]:
        """Get cases by type."""
        pass

    @abstractmethod
    async def get_pending_cases(self) -> list[StudentCase]:
        """Get all pending cases."""
        pass

    @abstractmethod
    async def get_auto_detected_cases(self) -> list[StudentCase]:
        """Get auto-detected cases."""
        pass

    @abstractmethod
    async def get_by_program(
        self,
        program_id: UUID,
    ) -> list[StudentCase]:
        """Get cases by program."""
        pass


class ImprovementPlanRepository(ABC):
    """Repository interface for ImprovementPlan entity."""

    @abstractmethod
    async def create(self, plan: ImprovementPlan) -> ImprovementPlan:
        """Create a new improvement plan."""
        pass

    @abstractmethod
    async def get_by_id(self, plan_id: UUID) -> Optional[ImprovementPlan]:
        """Get plan by ID."""
        pass

    @abstractmethod
    async def update(self, plan: ImprovementPlan) -> ImprovementPlan:
        """Update an existing plan."""
        pass

    @abstractmethod
    async def delete(self, plan_id: UUID) -> bool:
        """Delete a plan."""
        pass

    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[ImprovementPlan]:
        """Get all plans with pagination."""
        pass

    @abstractmethod
    async def get_by_student(
        self,
        student_id: UUID,
    ) -> list[ImprovementPlan]:
        """Get all plans for a student."""
        pass

    @abstractmethod
    async def get_by_student_case(
        self,
        student_case_id: UUID,
    ) -> Optional[ImprovementPlan]:
        """Get plan for a student case."""
        pass

    @abstractmethod
    async def get_by_supervisor(
        self,
        supervisor_id: UUID,
    ) -> list[ImprovementPlan]:
        """Get plans supervised by a user."""
        pass

    @abstractmethod
    async def get_by_status(
        self,
        status: PlanStatus,
    ) -> list[ImprovementPlan]:
        """Get plans by status."""
        pass

    @abstractmethod
    async def get_active_plans(self) -> list[ImprovementPlan]:
        """Get all active plans."""
        pass

    @abstractmethod
    async def get_overdue_plans(self) -> list[ImprovementPlan]:
        """Get all overdue plans."""
        pass

    @abstractmethod
    async def get_plans_ending_soon(
        self,
        days_threshold: int = 7,
    ) -> list[ImprovementPlan]:
        """Get plans ending within threshold days."""
        pass

    @abstractmethod
    async def get_by_compliance_range(
        self,
        min_compliance: float,
        max_compliance: float,
    ) -> list[ImprovementPlan]:
        """Get plans within a compliance percentage range."""
        pass


class SanctionRepository(ABC):
    """Repository interface for Sanction entity."""

    @abstractmethod
    async def create(self, sanction: Sanction) -> Sanction:
        """Create a new sanction."""
        pass

    @abstractmethod
    async def get_by_id(self, sanction_id: UUID) -> Optional[Sanction]:
        """Get sanction by ID."""
        pass

    @abstractmethod
    async def update(self, sanction: Sanction) -> Sanction:
        """Update an existing sanction."""
        pass

    @abstractmethod
    async def delete(self, sanction_id: UUID) -> bool:
        """Delete a sanction."""
        pass

    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Sanction]:
        """Get all sanctions with pagination."""
        pass

    @abstractmethod
    async def get_by_student(
        self,
        student_id: UUID,
    ) -> list[Sanction]:
        """Get all sanctions for a student."""
        pass

    @abstractmethod
    async def get_by_type(
        self,
        sanction_type: SanctionType,
    ) -> list[Sanction]:
        """Get sanctions by type."""
        pass

    @abstractmethod
    async def get_by_compliance_status(
        self,
        status: ComplianceStatus,
    ) -> list[Sanction]:
        """Get sanctions by compliance status."""
        pass

    @abstractmethod
    async def get_active_sanctions(self) -> list[Sanction]:
        """Get all active sanctions."""
        pass

    @abstractmethod
    async def get_appealable_sanctions(self) -> list[Sanction]:
        """Get sanctions that can still be appealed."""
        pass

    @abstractmethod
    async def get_recidivism_count(
        self,
        student_id: UUID,
    ) -> int:
        """Get the number of previous sanctions for a student."""
        pass

    @abstractmethod
    async def get_expiring_soon(
        self,
        days_threshold: int = 7,
    ) -> list[Sanction]:
        """Get sanctions expiring within threshold days."""
        pass


class AppealRepository(ABC):
    """Repository interface for Appeal entity."""

    @abstractmethod
    async def create(self, appeal: Appeal) -> Appeal:
        """Create a new appeal."""
        pass

    @abstractmethod
    async def get_by_id(self, appeal_id: UUID) -> Optional[Appeal]:
        """Get appeal by ID."""
        pass

    @abstractmethod
    async def update(self, appeal: Appeal) -> Appeal:
        """Update an existing appeal."""
        pass

    @abstractmethod
    async def delete(self, appeal_id: UUID) -> bool:
        """Delete an appeal."""
        pass

    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Appeal]:
        """Get all appeals with pagination."""
        pass

    @abstractmethod
    async def get_by_sanction(
        self,
        sanction_id: UUID,
    ) -> Optional[Appeal]:
        """Get appeal for a sanction."""
        pass

    @abstractmethod
    async def get_by_student(
        self,
        student_id: UUID,
    ) -> list[Appeal]:
        """Get all appeals for a student."""
        pass

    @abstractmethod
    async def get_by_admissibility_status(
        self,
        status: AdmissibilityStatus,
    ) -> list[Appeal]:
        """Get appeals by admissibility status."""
        pass

    @abstractmethod
    async def get_by_decision(
        self,
        decision: AppealDecision,
    ) -> list[Appeal]:
        """Get appeals by final decision."""
        pass

    @abstractmethod
    async def get_pending_appeals(self) -> list[Appeal]:
        """Get all pending appeals."""
        pass

    @abstractmethod
    async def get_admitted_appeals(self) -> list[Appeal]:
        """Get all admitted appeals."""
        pass

    @abstractmethod
    async def get_appeals_near_deadline(
        self,
        days_threshold: int = 3,
    ) -> list[Appeal]:
        """Get appeals near processing deadline."""
        pass
