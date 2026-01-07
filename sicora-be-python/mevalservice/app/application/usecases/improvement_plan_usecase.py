"""
Improvement plan use case - business logic for improvement plan management.
"""

from datetime import date
from typing import Optional
from uuid import UUID, uuid4

from ...domain.entities import (
    ImprovementPlan,
    PlanType,
    PlanStatus,
    Objective,
    Activity,
    SuccessCriteria,
)
from ...domain.repositories import ImprovementPlanRepository


class ImprovementPlanUseCase:
    """Use case for improvement plan operations."""

    def __init__(self, plan_repo: ImprovementPlanRepository):
        self.plan_repo = plan_repo

    async def create_plan(
        self,
        student_case_id: UUID,
        student_id: UUID,
        plan_type: str,
        title: str,
        start_date: date,
        end_date: date,
        supervisor_id: UUID,
        description: Optional[str] = None,
        support_instructor_id: Optional[UUID] = None,
        objectives: Optional[list[Objective]] = None,
        activities: Optional[list[Activity]] = None,
        success_criteria: Optional[list[SuccessCriteria]] = None,
    ) -> ImprovementPlan:
        """Create a new improvement plan."""
        plan = ImprovementPlan(
            id=uuid4(),
            student_case_id=student_case_id,
            student_id=student_id,
            plan_type=PlanType(plan_type),
            status=PlanStatus.DRAFT,
            title=title,
            description=description,
            start_date=start_date,
            end_date=end_date,
            objectives=objectives or [],
            activities=activities or [],
            success_criteria=success_criteria or [],
            supervisor_id=supervisor_id,
            support_instructor_id=support_instructor_id,
        )
        return await self.plan_repo.create(plan)

    async def get_plan(self, plan_id: UUID) -> Optional[ImprovementPlan]:
        """Get plan by ID."""
        return await self.plan_repo.get_by_id(plan_id)

    async def list_plans(
        self, skip: int = 0, limit: int = 100
    ) -> list[ImprovementPlan]:
        """List all plans with pagination."""
        return await self.plan_repo.get_all(skip, limit)

    async def get_student_plans(self, student_id: UUID) -> list[ImprovementPlan]:
        """Get all plans for a student."""
        return await self.plan_repo.get_by_student(student_id)

    async def activate_plan(self, plan_id: UUID) -> ImprovementPlan:
        """Activate a draft plan."""
        plan = await self.plan_repo.get_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")

        plan.activate()
        return await self.plan_repo.update(plan)

    async def review_plan(
        self,
        plan_id: UUID,
        compliance_percentage: float,
        review_notes: str,
        next_review_date: Optional[date] = None,
    ) -> ImprovementPlan:
        """Review and update plan compliance."""
        plan = await self.plan_repo.get_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")

        plan.update_compliance(compliance_percentage)
        plan.review_notes = review_notes
        plan.last_review_date = date.today()
        plan.next_review_date = next_review_date
        return await self.plan_repo.update(plan)

    async def complete_plan(self, plan_id: UUID) -> ImprovementPlan:
        """Mark a plan as completed."""
        plan = await self.plan_repo.get_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")

        plan.complete()
        return await self.plan_repo.update(plan)

    async def fail_plan(self, plan_id: UUID, reason: str) -> ImprovementPlan:
        """Mark a plan as failed."""
        plan = await self.plan_repo.get_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")

        plan.fail()
        plan.review_notes = reason
        return await self.plan_repo.update(plan)

    async def extend_plan(
        self, plan_id: UUID, new_end_date: date, reason: str
    ) -> ImprovementPlan:
        """Extend plan duration."""
        plan = await self.plan_repo.get_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")

        if not plan.can_extend():
            raise ValueError(f"Plan has reached max extensions ({plan.max_extensions})")

        plan.extend(new_end_date)
        plan.review_notes = f"Extended: {reason}"
        return await self.plan_repo.update(plan)

    async def sign_commitment(self, plan_id: UUID) -> ImprovementPlan:
        """Record student commitment signature."""
        plan = await self.plan_repo.get_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")

        plan.sign_commitment()
        return await self.plan_repo.update(plan)

    async def cancel_plan(self, plan_id: UUID) -> ImprovementPlan:
        """Cancel a plan."""
        plan = await self.plan_repo.get_by_id(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")

        plan.status = PlanStatus.CANCELLED
        return await self.plan_repo.update(plan)

    async def get_active_plans(self) -> list[ImprovementPlan]:
        """Get all active plans."""
        return await self.plan_repo.get_active_plans()

    async def get_overdue_plans(self) -> list[ImprovementPlan]:
        """Get all overdue plans."""
        return await self.plan_repo.get_overdue_plans()

    async def get_plans_ending_soon(self, days: int = 7) -> list[ImprovementPlan]:
        """Get plans ending within specified days."""
        return await self.plan_repo.get_plans_ending_soon(days)

    async def get_supervisor_plans(self, supervisor_id: UUID) -> list[ImprovementPlan]:
        """Get plans supervised by a user."""
        return await self.plan_repo.get_by_supervisor(supervisor_id)
