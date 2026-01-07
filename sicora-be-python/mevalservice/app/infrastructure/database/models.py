"""
SQLAlchemy models for MEvalService.

Database ORM models for persistence layer.
"""

from enum import Enum as PyEnum
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from ..database.base import Base


# Enums for database columns
class CommitteeTypeDB(str, PyEnum):
    """Committee types for database."""

    MONTHLY = "MONTHLY"
    EXTRAORDINARY = "EXTRAORDINARY"
    APPEALS = "APPEALS"
    SPECIAL = "SPECIAL"


class CommitteeStatusDB(str, PyEnum):
    """Committee status for database."""

    SCHEDULED = "SCHEDULED"
    IN_SESSION = "IN_SESSION"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    POSTPONED = "POSTPONED"


class MemberRoleDB(str, PyEnum):
    """Member roles for database."""

    COORDINATOR = "COORDINATOR"
    INSTRUCTOR = "INSTRUCTOR"
    REPRESENTATIVE = "REPRESENTATIVE"
    SECRETARY = "SECRETARY"
    PRESIDENT = "PRESIDENT"
    GUEST = "GUEST"


class DecisionTypeDB(str, PyEnum):
    """Decision types for database."""

    IMPROVEMENT_PLAN = "IMPROVEMENT_PLAN"
    SANCTION = "SANCTION"
    CONDITIONAL = "CONDITIONAL"
    DISMISSAL = "DISMISSAL"
    ACQUITTAL = "ACQUITTAL"
    DEFERRED = "DEFERRED"


class CaseTypeDB(str, PyEnum):
    """Case types for database."""

    ACADEMIC = "ACADEMIC"
    DISCIPLINARY = "DISCIPLINARY"
    ATTENDANCE = "ATTENDANCE"
    COMBINED = "COMBINED"


class CaseStatusDB(str, PyEnum):
    """Case status for database."""

    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    ASSIGNED_TO_COMMITTEE = "ASSIGNED_TO_COMMITTEE"
    IN_DELIBERATION = "IN_DELIBERATION"
    DECIDED = "DECIDED"
    APPEALED = "APPEALED"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class PlanTypeDB(str, PyEnum):
    """Plan types for database."""

    ACADEMIC = "ACADEMIC"
    DISCIPLINARY = "DISCIPLINARY"
    ATTENDANCE = "ATTENDANCE"
    COMPREHENSIVE = "COMPREHENSIVE"


class PlanStatusDB(str, PyEnum):
    """Plan status for database."""

    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    EXTENDED = "EXTENDED"
    CANCELLED = "CANCELLED"


class SanctionTypeDB(str, PyEnum):
    """Sanction types for database - per Acuerdo 009/2024."""

    VERBAL_WARNING = "VERBAL_WARNING"
    WRITTEN_WARNING = "WRITTEN_WARNING"
    CONDITIONAL_ENROLLMENT = "CONDITIONAL_ENROLLMENT"
    TRAINING_SUSPENSION = "TRAINING_SUSPENSION"
    CANCELLATION_CURRENT_TRAINING = "CANCELLATION_CURRENT_TRAINING"
    CANCELLATION_ALL_TRAININGS = "CANCELLATION_ALL_TRAININGS"
    PERMANENT_BAN = "PERMANENT_BAN"


class SeverityLevelDB(str, PyEnum):
    """Severity levels for database."""

    MINOR = "MINOR"
    MODERATE = "MODERATE"
    SERIOUS = "SERIOUS"
    VERY_SERIOUS = "VERY_SERIOUS"


class ComplianceStatusDB(str, PyEnum):
    """Compliance status for database."""

    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED"
    FAILED = "FAILED"


class AdmissibilityStatusDB(str, PyEnum):
    """Admissibility status for database."""

    PENDING = "PENDING"
    ADMITTED = "ADMITTED"
    REJECTED = "REJECTED"
    REQUIRES_ADDITIONAL_INFO = "REQUIRES_ADDITIONAL_INFO"


class AppealDecisionDB(str, PyEnum):
    """Appeal decisions for database."""

    PENDING = "PENDING"
    UPHELD = "UPHELD"
    MODIFIED = "MODIFIED"
    REVOKED = "REVOKED"
    DISMISSED = "DISMISSED"


class CommitteeModel(Base):
    """SQLAlchemy model for Committee entity."""

    __tablename__ = "committees"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    committee_type = Column(
        Enum(CommitteeTypeDB),
        nullable=False,
        default=CommitteeTypeDB.MONTHLY,
    )
    status = Column(
        Enum(CommitteeStatusDB),
        nullable=False,
        default=CommitteeStatusDB.SCHEDULED,
    )
    scheduled_date = Column(Date, nullable=False)
    actual_start_time = Column(DateTime, nullable=True)
    actual_end_time = Column(DateTime, nullable=True)
    location = Column(String(255), nullable=True)
    is_virtual = Column(Boolean, default=False)
    virtual_meeting_link = Column(String(500), nullable=True)
    training_center_id = Column(PGUUID(as_uuid=True), nullable=False)
    agenda = Column(Text, nullable=True)
    minutes = Column(Text, nullable=True)
    minutes_approved_at = Column(DateTime, nullable=True)
    minutes_approved_by = Column(PGUUID(as_uuid=True), nullable=True)
    created_by = Column(PGUUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    members = relationship(
        "CommitteeMemberModel", back_populates="committee", cascade="all, delete-orphan"
    )
    decisions = relationship(
        "CommitteeDecisionModel",
        back_populates="committee",
        cascade="all, delete-orphan",
    )
    student_cases = relationship("StudentCaseModel", back_populates="committee")


class CommitteeMemberModel(Base):
    """SQLAlchemy model for CommitteeMember entity."""

    __tablename__ = "committee_members"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    committee_id = Column(
        PGUUID(as_uuid=True), ForeignKey("committees.id"), nullable=False
    )
    user_id = Column(PGUUID(as_uuid=True), nullable=False)
    role = Column(
        Enum(MemberRoleDB),
        nullable=False,
        default=MemberRoleDB.INSTRUCTOR,
    )
    is_present = Column(Boolean, default=False)
    attendance_time = Column(DateTime, nullable=True)
    has_voting_rights = Column(Boolean, default=True)
    vote_recorded = Column(Boolean, default=False)
    justification_for_absence = Column(Text, nullable=True)
    delegate_user_id = Column(PGUUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    committee = relationship("CommitteeModel", back_populates="members")


class CommitteeDecisionModel(Base):
    """SQLAlchemy model for CommitteeDecision entity."""

    __tablename__ = "committee_decisions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    committee_id = Column(
        PGUUID(as_uuid=True), ForeignKey("committees.id"), nullable=False
    )
    student_case_id = Column(
        PGUUID(as_uuid=True), ForeignKey("student_cases.id"), nullable=False
    )
    decision_type = Column(
        Enum(DecisionTypeDB),
        nullable=False,
    )
    votes_in_favor = Column(Integer, default=0)
    votes_against = Column(Integer, default=0)
    abstentions = Column(Integer, default=0)
    is_unanimous = Column(Boolean, default=False)
    rationale = Column(Text, nullable=True)
    conditions = Column(JSON, nullable=True)  # List of conditions as JSON
    follow_up_date = Column(Date, nullable=True)
    notified_to_student = Column(Boolean, default=False)
    notification_date = Column(DateTime, nullable=True)
    notification_method = Column(String(50), nullable=True)
    student_acknowledgement = Column(Boolean, default=False)
    acknowledgement_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    committee = relationship("CommitteeModel", back_populates="decisions")
    student_case = relationship("StudentCaseModel", back_populates="decision")


class StudentCaseModel(Base):
    """SQLAlchemy model for StudentCase entity."""

    __tablename__ = "student_cases"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    case_number = Column(String(50), unique=True, nullable=False)
    student_id = Column(PGUUID(as_uuid=True), nullable=False)
    program_id = Column(PGUUID(as_uuid=True), nullable=False)
    case_type = Column(
        Enum(CaseTypeDB),
        nullable=False,
    )
    status = Column(
        Enum(CaseStatusDB),
        nullable=False,
        default=CaseStatusDB.PENDING,
    )
    description = Column(Text, nullable=False)
    is_auto_detected = Column(Boolean, default=False)
    detection_criteria = Column(JSON, nullable=True)  # DetectionCriteria as JSON
    detection_date = Column(DateTime, nullable=True)
    reported_by = Column(PGUUID(as_uuid=True), nullable=True)
    evidence_documents = Column(JSON, nullable=True)  # List of EvidenceDocument as JSON
    committee_id = Column(
        PGUUID(as_uuid=True), ForeignKey("committees.id"), nullable=True
    )
    priority_level = Column(Integer, default=3)  # 1-5, 1 being highest
    previous_cases_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    committee = relationship("CommitteeModel", back_populates="student_cases")
    decision = relationship(
        "CommitteeDecisionModel", back_populates="student_case", uselist=False
    )
    improvement_plan = relationship(
        "ImprovementPlanModel", back_populates="student_case", uselist=False
    )
    sanctions = relationship("SanctionModel", back_populates="student_case")


class ImprovementPlanModel(Base):
    """SQLAlchemy model for ImprovementPlan entity."""

    __tablename__ = "improvement_plans"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    student_case_id = Column(
        PGUUID(as_uuid=True), ForeignKey("student_cases.id"), nullable=False
    )
    student_id = Column(PGUUID(as_uuid=True), nullable=False)
    plan_type = Column(
        Enum(PlanTypeDB),
        nullable=False,
    )
    status = Column(
        Enum(PlanStatusDB),
        nullable=False,
        default=PlanStatusDB.DRAFT,
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    objectives = Column(JSON, nullable=True)  # List of Objective as JSON
    activities = Column(JSON, nullable=True)  # List of Activity as JSON
    success_criteria = Column(JSON, nullable=True)  # List of SuccessCriteria as JSON
    supervisor_id = Column(PGUUID(as_uuid=True), nullable=False)
    support_instructor_id = Column(PGUUID(as_uuid=True), nullable=True)
    compliance_percentage = Column(Float, default=0.0)
    last_review_date = Column(Date, nullable=True)
    next_review_date = Column(Date, nullable=True)
    review_notes = Column(Text, nullable=True)
    student_commitment_signed = Column(Boolean, default=False)
    commitment_signed_date = Column(DateTime, nullable=True)
    extension_count = Column(Integer, default=0)
    max_extensions = Column(Integer, default=2)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    student_case = relationship("StudentCaseModel", back_populates="improvement_plan")


class SanctionModel(Base):
    """SQLAlchemy model for Sanction entity."""

    __tablename__ = "sanctions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    student_case_id = Column(
        PGUUID(as_uuid=True), ForeignKey("student_cases.id"), nullable=False
    )
    student_id = Column(PGUUID(as_uuid=True), nullable=False)
    sanction_type = Column(
        Enum(SanctionTypeDB),
        nullable=False,
    )
    severity_level = Column(
        Enum(SeverityLevelDB),
        nullable=False,
    )
    compliance_status = Column(
        Enum(ComplianceStatusDB),
        nullable=False,
        default=ComplianceStatusDB.NOT_STARTED,
    )
    description = Column(Text, nullable=False)
    legal_basis = Column(Text, nullable=False)  # Legal article reference
    effective_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_appealable = Column(Boolean, default=True)
    appeal_deadline = Column(Date, nullable=True)
    imposed_by = Column(PGUUID(as_uuid=True), nullable=False)
    conditions = Column(JSON, nullable=True)  # List of conditions as JSON
    compliance_notes = Column(Text, nullable=True)
    notified_to_student = Column(Boolean, default=False)
    notification_date = Column(DateTime, nullable=True)
    notified_to_parent = Column(Boolean, default=False)
    parent_notification_date = Column(DateTime, nullable=True)
    recidivism_factor = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    student_case = relationship("StudentCaseModel", back_populates="sanctions")
    appeal = relationship("AppealModel", back_populates="sanction", uselist=False)


class AppealModel(Base):
    """SQLAlchemy model for Appeal entity."""

    __tablename__ = "appeals"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    sanction_id = Column(
        PGUUID(as_uuid=True), ForeignKey("sanctions.id"), nullable=False
    )
    student_id = Column(PGUUID(as_uuid=True), nullable=False)
    filed_by = Column(PGUUID(as_uuid=True), nullable=False)
    filing_date = Column(DateTime, default=func.now(), nullable=False)
    grounds = Column(Text, nullable=False)
    supporting_documents = Column(
        JSON, nullable=True
    )  # List of SupportingDocument as JSON
    admissibility_status = Column(
        Enum(AdmissibilityStatusDB),
        nullable=False,
        default=AdmissibilityStatusDB.PENDING,
    )
    admissibility_reviewer = Column(PGUUID(as_uuid=True), nullable=True)
    admissibility_date = Column(DateTime, nullable=True)
    admissibility_notes = Column(Text, nullable=True)
    appeal_committee_id = Column(PGUUID(as_uuid=True), nullable=True)
    hearing_date = Column(DateTime, nullable=True)
    decision = Column(
        Enum(AppealDecisionDB),
        nullable=False,
        default=AppealDecisionDB.PENDING,
    )
    decision_rationale = Column(Text, nullable=True)
    decision_date = Column(DateTime, nullable=True)
    decided_by = Column(PGUUID(as_uuid=True), nullable=True)
    new_sanction_id = Column(PGUUID(as_uuid=True), nullable=True)  # If modified
    is_final = Column(Boolean, default=False)
    student_notified = Column(Boolean, default=False)
    notification_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    sanction = relationship("SanctionModel", back_populates="appeal")
