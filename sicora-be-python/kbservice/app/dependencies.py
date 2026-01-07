"""Dependencies for Knowledge Base Service."""

from typing import Dict, Any, Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from datetime import datetime

from app.config import settings
from app.infrastructure.config.database import get_db_session
from app.infrastructure.repositories.kb_repositories_impl import (
    SQLAlchemyKnowledgeItemRepository,
    SQLAlchemyCategoryRepository,
    SQLAlchemySearchQueryRepository,
    SQLAlchemyFeedbackRepository
)
from app.infrastructure.services.kb_services_impl import (
    OpenAIEmbeddingService,
    HybridSearchService,
    HTTPChatbotIntegrationService,
    QueryAnalyticsService
)
from app.domain.services.kb_domain_services import (
    ContentValidationService,
    PersonalizationService
)
from app.application.use_cases.kb_use_cases import (
    CreateKnowledgeItemUseCase,
    GetKnowledgeItemUseCase,
    UpdateKnowledgeItemUseCase,
    SearchKnowledgeUseCase,
    ListKnowledgeItemsUseCase,
    CreateFeedbackUseCase,
    DeleteKnowledgeItemUseCase
)
from app.domain.entities.kb_entities import UserRole


class TokenData:
    """Token data structure."""
    def __init__(self, user_id: UUID, email: str, role: str, exp: datetime):
        self.user_id = user_id
        self.email = email
        self.role = role
        self.exp = exp


async def verify_token(authorization: Optional[str] = Header(None)) -> TokenData:
    """Verify JWT token and extract user information."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        # Extract user information
        user_id = UUID(payload.get("sub"))
        email = payload.get("email")
        role = payload.get("role", "student")
        exp = datetime.fromtimestamp(payload.get("exp"))

        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        # Check if token is expired
        if exp < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )

        return TokenData(user_id=user_id, email=email, role=role, exp=exp)

    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token_data: TokenData = Depends(verify_token)) -> Dict[str, Any]:
    """Get current user information."""
    return {
        "user_id": token_data.user_id,
        "email": token_data.email,
        "role": token_data.role
    }


async def get_admin_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Ensure current user is an admin."""
    if current_user["role"] != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# Repository Dependencies
def get_knowledge_item_repository(
    session: AsyncSession = Depends(get_db_session)
) -> SQLAlchemyKnowledgeItemRepository:
    """Get knowledge item repository."""
    return SQLAlchemyKnowledgeItemRepository(session)


def get_category_repository(
    session: AsyncSession = Depends(get_db_session)
) -> SQLAlchemyCategoryRepository:
    """Get category repository."""
    return SQLAlchemyCategoryRepository(session)


def get_search_query_repository(
    session: AsyncSession = Depends(get_db_session)
) -> SQLAlchemySearchQueryRepository:
    """Get search query repository."""
    return SQLAlchemySearchQueryRepository(session)


def get_feedback_repository(
    session: AsyncSession = Depends(get_db_session)
) -> SQLAlchemyFeedbackRepository:
    """Get feedback repository."""
    return SQLAlchemyFeedbackRepository(session)


# Service Dependencies
def get_embedding_service() -> OpenAIEmbeddingService:
    """Get embedding service."""
    return OpenAIEmbeddingService()


def get_content_validation_service() -> ContentValidationService:
    """Get content validation service."""
    return ContentValidationService()


def get_personalization_service() -> PersonalizationService:
    """Get personalization service."""
    return PersonalizationService()


def get_chatbot_integration_service() -> HTTPChatbotIntegrationService:
    """Get chatbot integration service."""
    return HTTPChatbotIntegrationService()


def get_search_service(
    knowledge_item_repo: SQLAlchemyKnowledgeItemRepository = Depends(get_knowledge_item_repository),
    embedding_service: OpenAIEmbeddingService = Depends(get_embedding_service)
) -> HybridSearchService:
    """Get search service."""
    return HybridSearchService(knowledge_item_repo, embedding_service)


# Use Case Dependencies
def get_create_knowledge_item_use_case(
    knowledge_item_repo: SQLAlchemyKnowledgeItemRepository = Depends(get_knowledge_item_repository),
    embedding_service: OpenAIEmbeddingService = Depends(get_embedding_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service)
) -> CreateKnowledgeItemUseCase:
    """Get create knowledge item use case."""
    return CreateKnowledgeItemUseCase(knowledge_item_repo, embedding_service, validation_service)


def get_get_knowledge_item_use_case(
    knowledge_item_repo: SQLAlchemyKnowledgeItemRepository = Depends(get_knowledge_item_repository)
) -> GetKnowledgeItemUseCase:
    """Get knowledge item use case."""
    return GetKnowledgeItemUseCase(knowledge_item_repo)


def get_update_knowledge_item_use_case(
    knowledge_item_repo: SQLAlchemyKnowledgeItemRepository = Depends(get_knowledge_item_repository),
    embedding_service: OpenAIEmbeddingService = Depends(get_embedding_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service)
) -> UpdateKnowledgeItemUseCase:
    """Get update knowledge item use case."""
    return UpdateKnowledgeItemUseCase(knowledge_item_repo, embedding_service, validation_service)


def get_search_knowledge_use_case(
    knowledge_item_repo: SQLAlchemyKnowledgeItemRepository = Depends(get_knowledge_item_repository),
    search_query_repo: SQLAlchemySearchQueryRepository = Depends(get_search_query_repository),
    search_service: HybridSearchService = Depends(get_search_service),
    personalization_service: PersonalizationService = Depends(get_personalization_service)
) -> SearchKnowledgeUseCase:
    """Get search knowledge use case."""
    return SearchKnowledgeUseCase(
        knowledge_item_repo, search_query_repo, search_service, personalization_service
    )


def get_list_knowledge_items_use_case(
    knowledge_item_repo: SQLAlchemyKnowledgeItemRepository = Depends(get_knowledge_item_repository)
) -> ListKnowledgeItemsUseCase:
    """Get list knowledge items use case."""
    return ListKnowledgeItemsUseCase(knowledge_item_repo)


def get_create_feedback_use_case(
    knowledge_item_repo: SQLAlchemyKnowledgeItemRepository = Depends(get_knowledge_item_repository),
    feedback_repo: SQLAlchemyFeedbackRepository = Depends(get_feedback_repository)
) -> CreateFeedbackUseCase:
    """Get create feedback use case."""
    return CreateFeedbackUseCase(knowledge_item_repo, feedback_repo)


def get_delete_knowledge_item_use_case(
    knowledge_item_repo: SQLAlchemyKnowledgeItemRepository = Depends(get_knowledge_item_repository)
) -> DeleteKnowledgeItemUseCase:
    """Get delete knowledge item use case."""
    return DeleteKnowledgeItemUseCase(knowledge_item_repo)


# Additional Service Dependencies for Admin
def get_embeddings_service() -> OpenAIEmbeddingService:
    """Get embeddings service (alias for get_embedding_service)."""
    return OpenAIEmbeddingService()


def get_kb_repository(
    session: AsyncSession = Depends(get_db_session)
) -> SQLAlchemyKnowledgeItemRepository:
    """Get KB repository (alias for get_knowledge_item_repository)."""
    return SQLAlchemyKnowledgeItemRepository(session)


def get_query_analytics_service(
    search_query_repo: SQLAlchemySearchQueryRepository = Depends(get_search_query_repository)
) -> QueryAnalyticsService:
    """Get query analytics service."""
    return QueryAnalyticsService(search_query_repo)


# KB Use Cases Container for PDF Router
class KBUseCases:
    """Container for KB use cases used in PDF processing."""
    
    def __init__(
        self,
        create_use_case: CreateKnowledgeItemUseCase,
        get_use_case: GetKnowledgeItemUseCase,
        update_use_case: UpdateKnowledgeItemUseCase,
        delete_use_case: DeleteKnowledgeItemUseCase
    ):
        self.create = create_use_case
        self.get = get_use_case
        self.update = update_use_case
        self.delete = delete_use_case


async def get_kb_use_cases(
    session: AsyncSession = Depends(get_db_session)
) -> KBUseCases:
    """Get KB use cases container for PDF processing."""
    # Create repositories
    knowledge_item_repo = SQLAlchemyKnowledgeItemRepository(session)
    
    # Create services
    embedding_service = OpenAIEmbeddingService()
    validation_service = ContentValidationService()
    
    # Create use cases
    create_use_case = CreateKnowledgeItemUseCase(
        knowledge_item_repo, embedding_service, validation_service
    )
    get_use_case = GetKnowledgeItemUseCase(knowledge_item_repo)
    update_use_case = UpdateKnowledgeItemUseCase(
        knowledge_item_repo, embedding_service, validation_service
    )
    delete_use_case = DeleteKnowledgeItemUseCase(knowledge_item_repo)
    
    return KBUseCases(
        create_use_case=create_use_case,
        get_use_case=get_use_case,
        update_use_case=update_use_case,
        delete_use_case=delete_use_case
    )
