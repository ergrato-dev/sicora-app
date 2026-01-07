"""
Criterion Models - SQLAlchemy models for evaluation criteria.

Author: SICORA Team
Date: 2025
"""

from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Boolean,
    Integer,
    ForeignKey,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from .connection import Base
from ....domain.entities.evaluation_criterion import (
    CriterionStatus,
    CriterionCategory,
    ApprovalStatus,
)


class CriterionModel(Base):
    """SQLAlchemy model for evaluation criteria."""

    __tablename__ = "evaluation_criteria"
    __table_args__ = {"schema": "projectevalservice_schema"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(10), nullable=False, unique=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(CriterionCategory), nullable=False, index=True)
    status = Column(
        SQLEnum(CriterionStatus),
        nullable=False,
        default=CriterionStatus.DRAFT,
        index=True,
    )
    is_required = Column(Boolean, default=True)
    points = Column(Integer, nullable=False)
    version = Column(Integer, default=1)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    created_by = Column(UUID(as_uuid=True), nullable=False)

    # Approval tracking
    approved_by = Column(ARRAY(UUID(as_uuid=True)), default=[])
    rejection_reason = Column(Text, nullable=True)

    # Validity dates
    effective_date = Column(DateTime(timezone=True), nullable=True)
    expiration_date = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    approvals = relationship(
        "CriterionApprovalModel", back_populates="criterion", lazy="selectin"
    )
    change_history = relationship(
        "CriterionChangeHistoryModel", back_populates="criterion", lazy="selectin"
    )


class CriterionApprovalModel(Base):
    """SQLAlchemy model for criterion approvals."""

    __tablename__ = "criterion_approvals"
    __table_args__ = {"schema": "projectevalservice_schema"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    criterion_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projectevalservice_schema.evaluation_criteria.id"),
        nullable=False,
        index=True,
    )
    pedagogical_member_id = Column(UUID(as_uuid=True), nullable=False)
    approval_status = Column(SQLEnum(ApprovalStatus), nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    criterion = relationship("CriterionModel", back_populates="approvals")


class CriterionChangeHistoryModel(Base):
    """SQLAlchemy model for criterion change history."""

    __tablename__ = "criterion_change_history"
    __table_args__ = {"schema": "projectevalservice_schema"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    criterion_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projectevalservice_schema.evaluation_criteria.id"),
        nullable=False,
        index=True,
    )
    changed_by = Column(UUID(as_uuid=True), nullable=False)
    change_type = Column(
        String(50), nullable=False
    )  # CREATE, UPDATE, APPROVE, REJECT, DEACTIVATE
    old_version = Column(JSON, nullable=True)
    new_version = Column(JSON, nullable=False)
    change_reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    criterion = relationship("CriterionModel", back_populates="change_history")
