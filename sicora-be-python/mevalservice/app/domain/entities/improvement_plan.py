"""
ImprovementPlan entity for Monthly Evaluation Committee.

Represents improvement plans assigned to students who need
academic or disciplinary support.
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class PlanType(str, Enum):
    """Types of improvement plans."""

    ACADEMIC = "academic"  # Academic performance improvement
    DISCIPLINARY = "disciplinary"  # Behavior improvement
    MIXED = "mixed"  # Both academic and disciplinary


class PlanStatus(str, Enum):
    """Status of an improvement plan."""

    DRAFT = "draft"  # Plan being created
    ACTIVE = "active"  # Plan in progress
    COMPLETED = "completed"  # Successfully completed
    FAILED = "failed"  # Plan not completed successfully
    EXTENDED = "extended"  # Plan extended
    CANCELLED = "cancelled"  # Plan cancelled


@dataclass
class Objective:
    """Objective within an improvement plan."""

    objective_id: UUID = field(default_factory=uuid4)
    description: str = ""
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    is_completed: bool = False
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None

    def get_progress_percentage(self) -> float:
        """Calculate progress percentage."""
        if self.target_value is None or self.target_value == 0:
            return 100.0 if self.is_completed else 0.0
        if self.current_value is None:
            return 0.0
        return min((self.current_value / self.target_value) * 100, 100.0)

    def mark_completed(self) -> None:
        """Mark objective as completed."""
        self.is_completed = True
        self.completed_at = datetime.utcnow()


@dataclass
class Activity:
    """Activity within an improvement plan."""

    activity_id: UUID = field(default_factory=uuid4)
    name: str = ""
    description: str = ""
    responsible_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_completed: bool = False
    completion_notes: str = ""
    completed_at: Optional[datetime] = None

    def mark_completed(self, notes: str = "") -> None:
        """Mark activity as completed."""
        self.is_completed = True
        self.completion_notes = notes
        self.completed_at = datetime.utcnow()

    def is_overdue(self) -> bool:
        """Check if activity is overdue."""
        if self.end_date and not self.is_completed:
            return date.today() > self.end_date
        return False


@dataclass
class SuccessCriteria:
    """Success criteria for an improvement plan."""

    criteria_id: UUID = field(default_factory=uuid4)
    description: str = ""
    metric_type: str = ""  # e.g., "percentage", "count", "boolean"
    target_value: Optional[float] = None
    achieved_value: Optional[float] = None
    is_met: bool = False
    evaluated_at: Optional[datetime] = None

    def evaluate(self, achieved_value: float) -> bool:
        """Evaluate if criteria is met."""
        self.achieved_value = achieved_value
        self.evaluated_at = datetime.utcnow()
        if self.target_value is not None:
            self.is_met = achieved_value >= self.target_value
        return self.is_met


@dataclass
class ImprovementPlan:
    """
    Represents an improvement plan for a student.

    Plans are created as a result of committee decisions and include
    objectives, activities, and success criteria.
    """

    # Required fields first
    student_id: UUID
    student_case_id: UUID
    plan_type: PlanType
    title: str
    start_date: date
    end_date: date

    # Fields with defaults
    id: UUID = field(default_factory=uuid4)
    status: PlanStatus = field(default=PlanStatus.DRAFT)
    description: str = ""
    objectives: list[Objective] = field(default_factory=list)
    activities: list[Activity] = field(default_factory=list)
    success_criteria: list[SuccessCriteria] = field(default_factory=list)
    supervisor_id: Optional[UUID] = None
    program_id: Optional[UUID] = None
    progress_percentage: float = 0.0
    last_review_date: Optional[date] = None
    next_review_date: Optional[date] = None
    extension_count: int = 0
    max_extensions: int = 2
    notes: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def is_active(self) -> bool:
        """Check if plan is currently active."""
        return self.status == PlanStatus.ACTIVE

    def is_overdue(self) -> bool:
        """Check if plan is past end date."""
        return date.today() > self.end_date and self.status == PlanStatus.ACTIVE

    def can_be_extended(self) -> bool:
        """Check if plan can be extended."""
        return self.extension_count < self.max_extensions

    def calculate_compliance_percentage(self) -> float:
        """Calculate overall compliance percentage."""
        if not self.objectives:
            return 0.0
        total_progress = sum(obj.get_progress_percentage() for obj in self.objectives)
        return total_progress / len(self.objectives)

    def calculate_progress(self) -> None:
        """Recalculate progress percentage."""
        self.progress_percentage = self.calculate_compliance_percentage()
        self.updated_at = datetime.utcnow()

    def activate(self) -> None:
        """Activate the improvement plan."""
        if self.status != PlanStatus.DRAFT:
            raise ValueError("Can only activate draft plans")
        self.status = PlanStatus.ACTIVE
        self.updated_at = datetime.utcnow()

    def complete(self) -> None:
        """Mark plan as successfully completed."""
        self.status = PlanStatus.COMPLETED
        self.progress_percentage = 100.0
        self.updated_at = datetime.utcnow()

    def fail(self, reason: str = "") -> None:
        """Mark plan as failed."""
        self.status = PlanStatus.FAILED
        if reason:
            self.notes = f"Failed: {reason}\n{self.notes}"
        self.updated_at = datetime.utcnow()

    def extend(self, new_end_date: date, reason: str = "") -> None:
        """Extend the plan to a new end date."""
        if not self.can_be_extended():
            raise ValueError(f"Maximum extensions ({self.max_extensions}) reached")
        self.end_date = new_end_date
        self.extension_count += 1
        self.status = PlanStatus.EXTENDED
        if reason:
            self.notes = f"Extended ({self.extension_count}): {reason}\n{self.notes}"
        self.updated_at = datetime.utcnow()

    def add_objective(self, objective: Objective) -> None:
        """Add an objective to the plan."""
        self.objectives.append(objective)
        self.updated_at = datetime.utcnow()

    def add_activity(self, activity: Activity) -> None:
        """Add an activity to the plan."""
        self.activities.append(activity)
        self.updated_at = datetime.utcnow()

    def add_success_criteria(self, criteria: SuccessCriteria) -> None:
        """Add success criteria to the plan."""
        self.success_criteria.append(criteria)
        self.updated_at = datetime.utcnow()

    def get_completed_objectives_count(self) -> int:
        """Get count of completed objectives."""
        return sum(1 for obj in self.objectives if obj.is_completed)

    def get_completed_activities_count(self) -> int:
        """Get count of completed activities."""
        return sum(1 for act in self.activities if act.is_completed)

    def get_overdue_activities(self) -> list[Activity]:
        """Get list of overdue activities."""
        return [act for act in self.activities if act.is_overdue()]

    def get_days_remaining(self) -> int:
        """Get days remaining until end date."""
        delta = self.end_date - date.today()
        return max(delta.days, 0)

    def is_ending_soon(self, days_threshold: int = 7) -> bool:
        """Check if plan is ending within threshold days."""
        return 0 < self.get_days_remaining() <= days_threshold

    def evaluate_success_criteria(self) -> bool:
        """Check if all success criteria are met."""
        if not self.success_criteria:
            return self.progress_percentage >= 100
        return all(criteria.is_met for criteria in self.success_criteria)
