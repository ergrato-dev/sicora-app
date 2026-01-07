"""
Improvement plan repository implementation.
"""

from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ...domain.entities import (
    ImprovementPlan,
    PlanType,
    PlanStatus,
    Objective,
    Activity,
    SuccessCriteria,
)
from ...domain.repositories import ImprovementPlanRepository
from ..database.models import ImprovementPlanModel, PlanTypeDB, PlanStatusDB


class ImprovementPlanRepositoryImpl(ImprovementPlanRepository):
    """SQLAlchemy implementation of ImprovementPlanRepository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: ImprovementPlanModel) -> ImprovementPlan:
        objectives = []
        if model.objectives:
            for obj in model.objectives:
                objectives.append(
                    Objective(
                        id=UUID(obj["id"]) if obj.get("id") else None,
                        description=obj.get("description", ""),
                        target_value=obj.get("target_value"),
                        current_value=obj.get("current_value"),
                        is_completed=obj.get("is_completed", False),
                    )
                )

        activities = []
        if model.activities:
            for act in model.activities:
                activities.append(
                    Activity(
                        id=UUID(act["id"]) if act.get("id") else None,
                        description=act.get("description", ""),
                        due_date=act.get("due_date"),
                        completed_date=act.get("completed_date"),
                        responsible_id=UUID(act["responsible_id"])
                        if act.get("responsible_id")
                        else None,
                        status=act.get("status", "PENDING"),
                        notes=act.get("notes"),
                    )
                )

        criteria = []
        if model.success_criteria:
            for crit in model.success_criteria:
                criteria.append(
                    SuccessCriteria(
                        id=UUID(crit["id"]) if crit.get("id") else None,
                        description=crit.get("description", ""),
                        measurement_method=crit.get("measurement_method", ""),
                        target_value=crit.get("target_value", 0.0),
                        achieved_value=crit.get("achieved_value"),
                        is_met=crit.get("is_met", False),
                    )
                )

        return ImprovementPlan(
            id=model.id,
            student_case_id=model.student_case_id,
            student_id=model.student_id,
            plan_type=PlanType(model.plan_type.value),
            status=PlanStatus(model.status.value),
            title=model.title,
            description=model.description,
            start_date=model.start_date,
            end_date=model.end_date,
            objectives=objectives,
            activities=activities,
            success_criteria=criteria,
            supervisor_id=model.supervisor_id,
            support_instructor_id=model.support_instructor_id,
            compliance_percentage=model.compliance_percentage,
            last_review_date=model.last_review_date,
            next_review_date=model.next_review_date,
            review_notes=model.review_notes,
            student_commitment_signed=model.student_commitment_signed,
            commitment_signed_date=model.commitment_signed_date,
            extension_count=model.extension_count,
            max_extensions=model.max_extensions,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: ImprovementPlan) -> ImprovementPlanModel:
        objectives_list = [
            {
                "id": str(obj.id) if obj.id else None,
                "description": obj.description,
                "target_value": obj.target_value,
                "current_value": obj.current_value,
                "is_completed": obj.is_completed,
            }
            for obj in entity.objectives
        ]

        activities_list = [
            {
                "id": str(act.id) if act.id else None,
                "description": act.description,
                "due_date": str(act.due_date) if act.due_date else None,
                "completed_date": str(act.completed_date)
                if act.completed_date
                else None,
                "responsible_id": str(act.responsible_id)
                if act.responsible_id
                else None,
                "status": act.status,
                "notes": act.notes,
            }
            for act in entity.activities
        ]

        criteria_list = [
            {
                "id": str(crit.id) if crit.id else None,
                "description": crit.description,
                "measurement_method": crit.measurement_method,
                "target_value": crit.target_value,
                "achieved_value": crit.achieved_value,
                "is_met": crit.is_met,
            }
            for crit in entity.success_criteria
        ]

        return ImprovementPlanModel(
            id=entity.id,
            student_case_id=entity.student_case_id,
            student_id=entity.student_id,
            plan_type=PlanTypeDB(entity.plan_type.value),
            status=PlanStatusDB(entity.status.value),
            title=entity.title,
            description=entity.description,
            start_date=entity.start_date,
            end_date=entity.end_date,
            objectives=objectives_list,
            activities=activities_list,
            success_criteria=criteria_list,
            supervisor_id=entity.supervisor_id,
            support_instructor_id=entity.support_instructor_id,
            compliance_percentage=entity.compliance_percentage,
            last_review_date=entity.last_review_date,
            next_review_date=entity.next_review_date,
            review_notes=entity.review_notes,
            student_commitment_signed=entity.student_commitment_signed,
            commitment_signed_date=entity.commitment_signed_date,
            extension_count=entity.extension_count,
            max_extensions=entity.max_extensions,
        )

    async def create(self, plan: ImprovementPlan) -> ImprovementPlan:
        model = self._to_model(plan)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, plan_id: UUID) -> Optional[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(ImprovementPlanModel.id == plan_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, plan: ImprovementPlan) -> ImprovementPlan:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(ImprovementPlanModel.id == plan.id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.status = PlanStatusDB(plan.status.value)
            model.compliance_percentage = plan.compliance_percentage
            model.last_review_date = plan.last_review_date
            model.next_review_date = plan.next_review_date
            model.review_notes = plan.review_notes
            model.extension_count = plan.extension_count
            model.end_date = plan.end_date
            await self.session.commit()
            await self.session.refresh(model)
            return self._to_entity(model)
        raise ValueError(f"ImprovementPlan {plan.id} not found")

    async def delete(self, plan_id: UUID) -> bool:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(ImprovementPlanModel.id == plan_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).offset(skip).limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_student(self, student_id: UUID) -> list[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(
                ImprovementPlanModel.student_id == student_id
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_student_case(
        self, student_case_id: UUID
    ) -> Optional[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(
                ImprovementPlanModel.student_case_id == student_case_id
            )
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_supervisor(self, supervisor_id: UUID) -> list[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(
                ImprovementPlanModel.supervisor_id == supervisor_id
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_status(self, status: PlanStatus) -> list[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(
                ImprovementPlanModel.status == PlanStatusDB(status.value)
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_active_plans(self) -> list[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(
                ImprovementPlanModel.status == PlanStatusDB.ACTIVE
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_overdue_plans(self) -> list[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(
                and_(
                    ImprovementPlanModel.status == PlanStatusDB.ACTIVE,
                    ImprovementPlanModel.end_date < date.today(),
                )
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_plans_ending_soon(
        self, days_threshold: int = 7
    ) -> list[ImprovementPlan]:
        threshold_date = date.today() + timedelta(days=days_threshold)
        result = await self.session.execute(
            select(ImprovementPlanModel).where(
                and_(
                    ImprovementPlanModel.status == PlanStatusDB.ACTIVE,
                    ImprovementPlanModel.end_date <= threshold_date,
                    ImprovementPlanModel.end_date >= date.today(),
                )
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_compliance_range(
        self, min_compliance: float, max_compliance: float
    ) -> list[ImprovementPlan]:
        result = await self.session.execute(
            select(ImprovementPlanModel).where(
                and_(
                    ImprovementPlanModel.compliance_percentage >= min_compliance,
                    ImprovementPlanModel.compliance_percentage <= max_compliance,
                )
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]
