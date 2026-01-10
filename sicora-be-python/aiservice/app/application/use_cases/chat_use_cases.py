"""Chat use cases for AI Service."""

import logging
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from app.domain.entities.conversation import Conversation
from app.domain.entities.ai_model import AIModel
from app.domain.value_objects.message import Message, MessageRole, MessageType
from app.domain.repositories.conversation_repository import ConversationRepository
from app.domain.repositories.ai_model_repository import AIModelRepository
from app.domain.repositories.knowledge_repository import KnowledgeRepository
from app.domain.exceptions.ai_exceptions import (
    ConversationNotFoundError,
    ModelNotAvailableError,
)
from app.application.interfaces.ai_provider_interface import AIProviderInterface
from app.application.interfaces.vector_store_interface import VectorStoreInterface
from app.application.interfaces.cache_interface import CacheInterface
from app.application.dtos.ai_dtos import (
    ChatRequestDTO,
    ChatResponseDTO,
    ConversationCreateDTO,
    ConversationResponseDTO,
)

logger = logging.getLogger(__name__)


class ChatUseCase:
    """Use case for chat interactions."""

    def __init__(
        self,
        conversation_repo: ConversationRepository,
        ai_model_repo: AIModelRepository,
        knowledge_repo: KnowledgeRepository,
        ai_provider: AIProviderInterface,
        vector_store: VectorStoreInterface,
        cache: CacheInterface,
    ):
        self.conversation_repo = conversation_repo
        self.ai_model_repo = ai_model_repo
        self.knowledge_repo = knowledge_repo
        self.ai_provider = ai_provider
        self.vector_store = vector_store
        self.cache = cache

    async def send_message(self, request: ChatRequestDTO) -> ChatResponseDTO:
        """Send a message and get AI response."""
        start_time = datetime.utcnow()

        try:
            # Get or create conversation
            conversation = await self._get_or_create_conversation(
                request.conversation_id, request.user_id
            )

            # Get AI model
            model = await self._get_ai_model(request.model_name)

            # Create user message
            user_message = Message(
                content=request.message,
                role=MessageRole.USUARIO,
                message_type=MessageType.TEXTO,
            )

            # Add user message to conversation
            conversation.add_message(user_message)

            # Get conversation context
            context_messages = conversation.get_context_window(
                max_messages=model.context_window // 100  # Estimate based on tokens
            )

            # Enhance with knowledge base if requested
            if request.use_knowledge_base:
                context_messages = await self._enhance_with_knowledge(
                    request.message, context_messages
                )

            # Generate AI response
            ai_response = await self.ai_provider.generate_response(
                messages=context_messages,
                model=model,
                temperature=request.temperature or model.temperature,
                max_tokens=request.max_tokens or model.max_tokens,
            )

            # Add AI response to conversation
            conversation.add_message(ai_response)

            # Update conversation in repository
            await self.conversation_repo.update(conversation)

            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds()

            # Cache recent conversation for faster access
            await self._cache_conversation(conversation)

            return ChatResponseDTO(
                conversation_id=conversation.conversation_id,
                message_id=ai_response.message_id,
                response=ai_response.content,
                model_used=ai_response.model_used or model.name,
                tokens_used=ai_response.tokens or 0,
                processing_time=processing_time,
                knowledge_sources=ai_response.metadata.get("knowledge_sources", []),
                timestamp=ai_response.timestamp,
            )

        except Exception as e:
            logger.error(f"Error in send_message: {str(e)}", exc_info=True)
            raise

    async def create_conversation(
        self, request: ConversationCreateDTO
    ) -> ConversationResponseDTO:
        """Create a new conversation."""
        try:
            conversation = Conversation(
                user_id=request.user_id, title=request.title or "Nueva Conversación"
            )

            # Add initial message if provided
            if request.initial_message:
                initial_message = Message(
                    content=request.initial_message,
                    role=MessageRole.USUARIO,
                    message_type=MessageType.TEXTO,
                )
                conversation.add_message(initial_message)

            # Save conversation
            saved_conversation = await self.conversation_repo.create(conversation)

            return ConversationResponseDTO(
                conversation_id=saved_conversation.conversation_id,
                user_id=saved_conversation.user_id,
                title=saved_conversation.title,
                message_count=saved_conversation.get_messages_count(),
                total_tokens=saved_conversation.get_total_tokens(),
                created_at=saved_conversation.created_at,
                updated_at=saved_conversation.updated_at,
                is_active=saved_conversation.is_active,
                metadata=saved_conversation.metadata.to_dict(),
            )

        except Exception as e:
            logger.error(f"Error creating conversation: {str(e)}", exc_info=True)
            raise

    async def get_conversation(
        self, conversation_id: UUID, user_id: UUID
    ) -> ConversationResponseDTO:
        """Get a conversation by ID."""
        conversation = await self.conversation_repo.get_by_id(conversation_id)

        if not conversation:
            raise ConversationNotFoundError(f"Conversation {conversation_id} not found")

        # Verify user ownership
        if conversation.user_id != user_id:
            raise ConversationNotFoundError(f"Conversation {conversation_id} not found")

        last_message = conversation.get_last_message()
        last_message_dto = None
        if last_message:
            last_message_dto = last_message.to_dict()

        return ConversationResponseDTO(
            conversation_id=conversation.conversation_id,
            user_id=conversation.user_id,
            title=conversation.title,
            message_count=conversation.get_messages_count(),
            total_tokens=conversation.get_total_tokens(),
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            is_active=conversation.is_active,
            last_message=last_message_dto,
            metadata=conversation.metadata.to_dict(),
        )

    async def list_conversations(
        self, user_id: UUID, limit: int = 10, offset: int = 0
    ) -> List[ConversationResponseDTO]:
        """List conversations for a user."""
        conversations = await self.conversation_repo.get_by_user_id(
            user_id=user_id, limit=limit, offset=offset
        )

        result = []
        for conversation in conversations:
            last_message = conversation.get_last_message()
            last_message_dto = None
            if last_message:
                last_message_dto = last_message.to_dict()

            result.append(
                ConversationResponseDTO(
                    conversation_id=conversation.conversation_id,
                    user_id=conversation.user_id,
                    title=conversation.title,
                    message_count=conversation.get_messages_count(),
                    total_tokens=conversation.get_total_tokens(),
                    created_at=conversation.created_at,
                    updated_at=conversation.updated_at,
                    is_active=conversation.is_active,
                    last_message=last_message_dto,
                    metadata=conversation.metadata.to_dict(),
                )
            )

        return result

    async def _get_or_create_conversation(
        self, conversation_id: Optional[UUID], user_id: UUID
    ) -> Conversation:
        """Get existing conversation or create new one."""
        if conversation_id:
            conversation = await self.conversation_repo.get_by_id(conversation_id)
            if not conversation or conversation.user_id != user_id:
                raise ConversationNotFoundError(
                    f"Conversation {conversation_id} not found"
                )
            return conversation
        else:
            # Create new conversation
            conversation = Conversation(user_id=user_id)
            return await self.conversation_repo.create(conversation)

    async def _get_ai_model(self, model_name: Optional[str]) -> AIModel:
        """Get AI model configuration."""
        if model_name:
            model = await self.ai_model_repo.get_by_name(model_name)
            if not model:
                raise ModelNotAvailableError(f"Model {model_name} not found")
        else:
            model = await self.ai_model_repo.get_default_model()
            if not model:
                raise ModelNotAvailableError("No default model available")

        if not model.is_available():
            raise ModelNotAvailableError(f"Model {model.name} is not available")

        return model

    async def _enhance_with_knowledge(
        self, query: str, messages: List[Message]
    ) -> List[Message]:
        """Enhance conversation with knowledge base context."""
        try:
            # Generate embedding for the query
            query_embedding = await self.ai_provider.generate_embedding(query)

            # Search similar knowledge entries
            similar_entries = await self.vector_store.search_similar(
                query_embedding=query_embedding, limit=3, similarity_threshold=0.7
            )

            if similar_entries:
                # Create context from knowledge base
                knowledge_context = "\n\n".join(
                    [
                        f"Fuente: {entry.title}\nContenido: {entry.content}"
                        for entry, score in similar_entries
                    ]
                )

                # Add system message with knowledge context
                system_message = Message(
                    content=f"Contexto de la base de conocimiento:\n{knowledge_context}",
                    role=MessageRole.SISTEMA,
                    message_type=MessageType.TEXTO,
                )

                # Add system message at the beginning
                enhanced_messages = [system_message] + messages

                # Update last message metadata with sources
                if messages:
                    last_message = messages[-1]
                    last_message.add_metadata(
                        "knowledge_sources",
                        [entry.title for entry, _ in similar_entries],
                    )

                return enhanced_messages

        except Exception as e:
            logger.warning(f"Failed to enhance with knowledge base: {str(e)}")

        return messages

    async def _cache_conversation(self, conversation: Conversation) -> None:
        """Cache conversation for faster access."""
        try:
            cache_key = f"conversation:{conversation.conversation_id}"
            await self.cache.set(
                key=cache_key, value=conversation.to_dict(), expire=timedelta(hours=1)
            )
        except Exception as e:
            logger.warning(f"Failed to cache conversation: {str(e)}")


class ConversationManagementUseCase:
    """Use case for conversation management operations."""

    def __init__(self, conversation_repo: ConversationRepository):
        self.conversation_repo = conversation_repo

    async def update_conversation_title(
        self, conversation_id: UUID, user_id: UUID, new_title: str
    ) -> ConversationResponseDTO:
        """Update conversation title."""
        conversation = await self.conversation_repo.get_by_id(conversation_id)

        if not conversation or conversation.user_id != user_id:
            raise ConversationNotFoundError(f"Conversation {conversation_id} not found")

        conversation.update_title(new_title)
        updated_conversation = await self.conversation_repo.update(conversation)

        return ConversationResponseDTO(
            conversation_id=updated_conversation.conversation_id,
            user_id=updated_conversation.user_id,
            title=updated_conversation.title,
            message_count=updated_conversation.get_messages_count(),
            total_tokens=updated_conversation.get_total_tokens(),
            created_at=updated_conversation.created_at,
            updated_at=updated_conversation.updated_at,
            is_active=updated_conversation.is_active,
            metadata=updated_conversation.metadata.to_dict(),
        )

    async def archive_conversation(self, conversation_id: UUID, user_id: UUID) -> bool:
        """Archive a conversation."""
        conversation = await self.conversation_repo.get_by_id(conversation_id)

        if not conversation or conversation.user_id != user_id:
            raise ConversationNotFoundError(f"Conversation {conversation_id} not found")

        conversation.archive()
        await self.conversation_repo.update(conversation)
        return True

    async def delete_conversation(self, conversation_id: UUID, user_id: UUID) -> bool:
        """Delete a conversation."""
        conversation = await self.conversation_repo.get_by_id(conversation_id)

        if not conversation or conversation.user_id != user_id:
            raise ConversationNotFoundError(f"Conversation {conversation_id} not found")

        return await self.conversation_repo.delete(conversation_id)
