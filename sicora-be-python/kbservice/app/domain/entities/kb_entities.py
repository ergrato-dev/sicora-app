"""Domain entities for Knowledge Base Service."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4

from app.domain.value_objects.kb_value_objects import (
    KnowledgeItemId,
    Content,
    Title,
    CategoryName,
    TagName,
    Vector
)


class UserRole(str, Enum):
    """User roles for knowledge base access."""
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"


class ContentType(str, Enum):
    """Types of knowledge content."""
    ARTICLE = "article"
    FAQ = "faq"
    GUIDE = "guide"
    PROCEDURE = "procedure"
    TUTORIAL = "tutorial"
    POLICY = "policy"


class ContentStatus(str, Enum):
    """Status of knowledge content."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    UNDER_REVIEW = "under_review"


class TargetAudience(str, Enum):
    """Target audience for knowledge content."""
    ALL = "all"
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"
    ADMIN_INSTRUCTOR = "admin_instructor"


class KnowledgeItem:
    """Knowledge base item entity."""
    
    def __init__(
        self,
        title: Title,
        content: Content,
        content_type: ContentType,
        category: CategoryName,
        target_audience: TargetAudience,
        author_id: UUID,
        id: Optional[KnowledgeItemId] = None,
        status: ContentStatus = ContentStatus.DRAFT,
        tags: Optional[List[TagName]] = None,
        embedding: Optional[Vector] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        published_at: Optional[datetime] = None,
        view_count: int = 0,
        helpful_count: int = 0,
        unhelpful_count: int = 0,
        version: int = 1
    ):
        """Initialize a knowledge item."""
        self._id = id or KnowledgeItemId(uuid4())
        self._title = title
        self._content = content
        self._content_type = content_type
        self._category = category
        self._target_audience = target_audience
        self._author_id = author_id
        self._status = status
        self._tags = tags or []
        self._embedding = embedding
        self._created_at = created_at or datetime.utcnow()
        self._updated_at = updated_at or datetime.utcnow()
        self._published_at = published_at
        self._view_count = view_count
        self._helpful_count = helpful_count
        self._unhelpful_count = unhelpful_count
        self._version = version
    
    @property
    def id(self) -> KnowledgeItemId:
        """Get the knowledge item ID."""
        return self._id
    
    @property
    def title(self) -> Title:
        """Get the title."""
        return self._title
    
    @property
    def content(self) -> Content:
        """Get the content."""
        return self._content
    
    @property
    def content_type(self) -> ContentType:
        """Get the content type."""
        return self._content_type
    
    @property
    def category(self) -> CategoryName:
        """Get the category."""
        return self._category
    
    @property
    def target_audience(self) -> TargetAudience:
        """Get the target audience."""
        return self._target_audience
    
    @property
    def author_id(self) -> UUID:
        """Get the author ID."""
        return self._author_id
    
    @property
    def status(self) -> ContentStatus:
        """Get the status."""
        return self._status
    
    @property
    def tags(self) -> List[TagName]:
        """Get the tags."""
        return self._tags.copy()
    
    @property
    def embedding(self) -> Optional[Vector]:
        """Get the embedding vector."""
        return self._embedding
    
    @property
    def created_at(self) -> datetime:
        """Get the creation timestamp."""
        return self._created_at
    
    @property
    def updated_at(self) -> datetime:
        """Get the last update timestamp."""
        return self._updated_at
    
    @property
    def published_at(self) -> Optional[datetime]:
        """Get the publication timestamp."""
        return self._published_at
    
    @property
    def view_count(self) -> int:
        """Get the view count."""
        return self._view_count
    
    @property
    def helpful_count(self) -> int:
        """Get the helpful count."""
        return self._helpful_count
    
    @property
    def unhelpful_count(self) -> int:
        """Get the unhelpful count."""
        return self._unhelpful_count
    
    @property
    def version(self) -> int:
        """Get the version number."""
        return self._version
    
    def update_content(self, title: Title, content: Content, tags: Optional[List[TagName]] = None) -> None:
        """Update the content of the knowledge item."""
        self._title = title
        self._content = content
        if tags is not None:
            self._tags = tags
        self._updated_at = datetime.utcnow()
        self._version += 1
    
    def publish(self) -> None:
        """Publish the knowledge item."""
        if self._status == ContentStatus.DRAFT:
            self._status = ContentStatus.PUBLISHED
            self._published_at = datetime.utcnow()
            self._updated_at = datetime.utcnow()
    
    def archive(self) -> None:
        """Archive the knowledge item."""
        self._status = ContentStatus.ARCHIVED
        self._updated_at = datetime.utcnow()
    
    def set_under_review(self) -> None:
        """Set the knowledge item under review."""
        self._status = ContentStatus.UNDER_REVIEW
        self._updated_at = datetime.utcnow()
    
    def update_embedding(self, embedding: Vector) -> None:
        """Update the embedding vector."""
        self._embedding = embedding
        self._updated_at = datetime.utcnow()
    
    def increment_view_count(self) -> None:
        """Increment the view count."""
        self._view_count += 1
    
    def add_helpful_feedback(self) -> None:
        """Add helpful feedback."""
        self._helpful_count += 1
    
    def add_unhelpful_feedback(self) -> None:
        """Add unhelpful feedback."""
        self._unhelpful_count += 1
    
    def is_accessible_by(self, user_role: UserRole) -> bool:
        """Check if the content is accessible by the given user role.
        
        - Admins can access any content regardless of status
        - Other users can only access published content for their target audience
        """
        # Admins can access everything
        if user_role == UserRole.ADMIN:
            return True
        
        # Non-admins can only access published content
        if self._status != ContentStatus.PUBLISHED:
            return False
        
        # Check target audience
        if self._target_audience == TargetAudience.ALL:
            return True
        
        role_mapping = {
            TargetAudience.ADMIN: [UserRole.ADMIN],
            TargetAudience.INSTRUCTOR: [UserRole.INSTRUCTOR],
            TargetAudience.STUDENT: [UserRole.STUDENT],
            TargetAudience.ADMIN_INSTRUCTOR: [UserRole.ADMIN, UserRole.INSTRUCTOR]
        }
        
        allowed_roles = role_mapping.get(self._target_audience, [])
        return user_role in allowed_roles
    
    def can_be_edited_by(self, user_id: UUID, user_role: UserRole) -> bool:
        """Check if the content can be edited by the given user.
        
        - Admins can edit any content
        - Authors can edit their own content
        """
        if user_role == UserRole.ADMIN:
            return True
        return user_id == self._author_id
    
    def is_published(self) -> bool:
        """Check if the knowledge item is published."""
        return self._status == ContentStatus.PUBLISHED


class Category:
    """Knowledge base category entity."""
    
    def __init__(
        self,
        name: CategoryName,
        description: str,
        id: Optional[UUID] = None,
        parent_id: Optional[UUID] = None,
        sort_order: int = 0,
        is_active: bool = True,
        created_at: Optional[datetime] = None
    ):
        """Initialize a category."""
        self._id = id or uuid4()
        self._name = name
        self._description = description
        self._parent_id = parent_id
        self._sort_order = sort_order
        self._is_active = is_active
        self._created_at = created_at or datetime.utcnow()
    
    @property
    def id(self) -> UUID:
        """Get the category ID."""
        return self._id
    
    @property
    def name(self) -> CategoryName:
        """Get the category name."""
        return self._name
    
    @property
    def description(self) -> str:
        """Get the description."""
        return self._description
    
    @property
    def parent_id(self) -> Optional[UUID]:
        """Get the parent category ID."""
        return self._parent_id
    
    @property
    def sort_order(self) -> int:
        """Get the sort order."""
        return self._sort_order
    
    @property
    def is_active(self) -> bool:
        """Check if the category is active."""
        return self._is_active
    
    @property
    def created_at(self) -> datetime:
        """Get the creation timestamp."""
        return self._created_at


class SearchQuery:
    """Search query entity."""
    
    def __init__(
        self,
        query_text: str,
        user_id: UUID,
        user_role: UserRole,
        id: Optional[UUID] = None,
        filters: Optional[dict] = None,
        created_at: Optional[datetime] = None
    ):
        """Initialize a search query."""
        self._id = id or uuid4()
        self._query_text = query_text
        self._user_id = user_id
        self._user_role = user_role
        self._filters = filters or {}
        self._created_at = created_at or datetime.utcnow()
    
    @property
    def id(self) -> UUID:
        """Get the query ID."""
        return self._id
    
    @property
    def query_text(self) -> str:
        """Get the query text."""
        return self._query_text
    
    @property
    def user_id(self) -> UUID:
        """Get the user ID."""
        return self._user_id
    
    @property
    def user_role(self) -> UserRole:
        """Get the user role."""
        return self._user_role
    
    @property
    def filters(self) -> dict:
        """Get the search filters."""
        return self._filters.copy()
    
    @property
    def created_at(self) -> datetime:
        """Get the creation timestamp."""
        return self._created_at


class Feedback:
    """Feedback entity for user feedback on knowledge items."""
    
    def __init__(
        self,
        item_id: UUID,
        user_id: UUID,
        feedback_type: str,
        comment: Optional[str] = None,
        id: Optional[UUID] = None,
        created_at: Optional[datetime] = None
    ):
        self.id = id or uuid4()
        self.item_id = item_id
        self.user_id = user_id
        self.feedback_type = feedback_type  # "helpful" or "unhelpful"
        self.comment = comment
        self.created_at = created_at or datetime.now(timezone.utc)
    
    def is_helpful(self) -> bool:
        """Check if feedback is helpful."""
        return self.feedback_type == "helpful"
    
    def is_valid_type(self) -> bool:
        """Validate feedback type."""
        return self.feedback_type in ["helpful", "unhelpful"]
