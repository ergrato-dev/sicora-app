from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from ..entities import EvaluationSession, EvaluationStatus


class EvaluationRepository(ABC):
    @abstractmethod
    async def create(self, evaluation: EvaluationSession) -> EvaluationSession:
        """Create a new evaluation"""
        pass

    @abstractmethod
    async def get_by_id(self, evaluation_id: UUID) -> Optional[EvaluationSession]:
        """Get evaluation by ID"""
        pass

    @abstractmethod
    async def get_by_project_id(self, project_id: UUID) -> List[EvaluationSession]:
        """Get evaluations by project ID"""
        pass

    @abstractmethod
    async def get_by_evaluator_id(self, evaluator_id: UUID) -> List[EvaluationSession]:
        """Get evaluations by evaluator ID"""
        pass

    @abstractmethod
    async def get_by_status(self, status: EvaluationStatus) -> List[EvaluationSession]:
        """Get evaluations by status"""
        pass

    @abstractmethod
    async def get_by_trimester(self, trimester_type: str) -> List[EvaluationSession]:
        """Get evaluations by trimester type"""
        pass

    @abstractmethod
    async def get_scheduled_evaluations(
        self, evaluator_id: Optional[UUID] = None
    ) -> List[EvaluationSession]:
        """Get scheduled evaluations, optionally filtered by evaluator"""
        pass

    @abstractmethod
    async def get_evaluations_by_period(
        self, academic_year: int, trimester: int
    ) -> List[EvaluationSession]:
        """Get evaluations by academic period"""
        pass

    @abstractmethod
    async def update(self, evaluation: EvaluationSession) -> EvaluationSession:
        """Update existing evaluation"""
        pass

    @abstractmethod
    async def delete(self, evaluation_id: UUID) -> bool:
        """Delete evaluation"""
        pass

    @abstractmethod
    async def get_project_evaluation_history(
        self, project_id: UUID
    ) -> List[EvaluationSession]:
        """Get complete evaluation history for a project"""
        pass
