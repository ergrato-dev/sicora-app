from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from ..entities import Stakeholder, StakeholderStatus, StakeholderType


class StakeholderRepository(ABC):
    @abstractmethod
    async def create(self, stakeholder: Stakeholder) -> Stakeholder:
        """Create a new stakeholder"""
        pass

    @abstractmethod
    async def get_by_id(self, stakeholder_id: UUID) -> Optional[Stakeholder]:
        """Get stakeholder by ID"""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[Stakeholder]:
        """Get stakeholder by email"""
        pass

    @abstractmethod
    async def get_by_status(self, status: StakeholderStatus) -> List[Stakeholder]:
        """Get stakeholders by status"""
        pass

    @abstractmethod
    async def get_by_type(self, stakeholder_type: StakeholderType) -> List[Stakeholder]:
        """Get stakeholders by type"""
        pass

    @abstractmethod
    async def get_active_stakeholders(self) -> List[Stakeholder]:
        """Get all active stakeholders"""
        pass

    @abstractmethod
    async def update(self, stakeholder: Stakeholder) -> Stakeholder:
        """Update existing stakeholder"""
        pass

    @abstractmethod
    async def delete(self, stakeholder_id: UUID) -> bool:
        """Delete stakeholder"""
        pass

    @abstractmethod
    async def get_all(
        self,
        status: Optional[StakeholderStatus] = None,
        stakeholder_type: Optional[StakeholderType] = None,
        collaboration_ready: Optional[bool] = None,
    ) -> List[Stakeholder]:
        """Get all stakeholders with optional filters"""
        pass

    @abstractmethod
    async def search_stakeholders(
        self,
        name: Optional[str] = None,
        stakeholder_type: Optional[StakeholderType] = None,
        status: Optional[StakeholderStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Stakeholder], int]:
        """Search stakeholders with filters and pagination"""
        pass
