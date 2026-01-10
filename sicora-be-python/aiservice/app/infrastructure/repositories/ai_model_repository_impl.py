"""SQLAlchemy implementation of AIModelRepository."""

import logging
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, and_

from app.domain.entities.ai_model import AIModel, ModelType, ModelStatus
from app.domain.repositories.ai_model_repository import AIModelRepository
from app.infrastructure.models.ai_model_model import AIModelModel

logger = logging.getLogger(__name__)


class SQLAlchemyAIModelRepository(AIModelRepository):
    """SQLAlchemy implementation of AI model repository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, model: AIModel) -> AIModel:
        """Create a new AI model configuration."""
        try:
            ai_model_model = AIModelModel(
                id=model.model_id,
                name=model.name,
                model_type=model.model_type.value,
                model_name=model.model_name,
                api_endpoint=model.api_endpoint,
                api_key_name=model.api_key_name,
                max_tokens=model.max_tokens,
                temperature=model.temperature,
                top_p=model.top_p,
                frequency_penalty=model.frequency_penalty,
                presence_penalty=model.presence_penalty,
                context_window=model.context_window,
                cost_per_token=model.cost_per_token,
                status=model.status.value,
                supported_features=model.supported_features,
                metadata=model.metadata,
                created_at=model.created_at,
                updated_at=model.updated_at,
                is_active=True,
            )

            self.session.add(ai_model_model)
            await self.session.commit()
            await self.session.refresh(ai_model_model)

            return self._model_to_entity(ai_model_model)

        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error creating AI model: {str(e)}", exc_info=True)
            raise

    async def get_by_id(self, model_id: UUID) -> Optional[AIModel]:
        """Get AI model by ID."""
        try:
            stmt = select(AIModelModel).where(
                and_(AIModelModel.id == model_id, AIModelModel.is_active.is_(True))
            )

            result = await self.session.execute(stmt)
            model = result.scalar_one_or_none()

            if not model:
                return None

            return self._model_to_entity(model)

        except Exception as e:
            logger.error(
                f"Error getting AI model by ID {model_id}: {str(e)}", exc_info=True
            )
            return None

    async def get_by_name(self, name: str) -> Optional[AIModel]:
        """Get AI model by name."""
        try:
            stmt = select(AIModelModel).where(
                and_(AIModelModel.name == name, AIModelModel.is_active.is_(True))
            )

            result = await self.session.execute(stmt)
            model = result.scalar_one_or_none()

            if not model:
                return None

            return self._model_to_entity(model)

        except Exception as e:
            logger.error(
                f"Error getting AI model by name {name}: {str(e)}", exc_info=True
            )
            return None

    async def get_by_type(self, model_type: ModelType) -> List[AIModel]:
        """Get AI models by type."""
        try:
            stmt = (
                select(AIModelModel)
                .where(
                    and_(
                        AIModelModel.model_type == model_type.value,
                        AIModelModel.is_active.is_(True),
                    )
                )
                .order_by(AIModelModel.name)
            )

            result = await self.session.execute(stmt)
            models = result.scalars().all()

            return [self._model_to_entity(model) for model in models]

        except Exception as e:
            logger.error(
                f"Error getting AI models by type {model_type}: {str(e)}", exc_info=True
            )
            return []

    async def get_active_models(self) -> List[AIModel]:
        """Get all active AI models."""
        try:
            stmt = (
                select(AIModelModel)
                .where(
                    and_(
                        AIModelModel.status == ModelStatus.ACTIVO.value,
                        AIModelModel.is_active.is_(True),
                    )
                )
                .order_by(AIModelModel.name)
            )

            result = await self.session.execute(stmt)
            models = result.scalars().all()

            return [self._model_to_entity(model) for model in models]

        except Exception as e:
            logger.error(f"Error getting active AI models: {str(e)}", exc_info=True)
            return []

    async def get_available_models(self) -> List[AIModel]:
        """Get all available AI models."""
        try:
            stmt = (
                select(AIModelModel)
                .where(
                    and_(
                        AIModelModel.status.in_(
                            [ModelStatus.ACTIVO.value, ModelStatus.MANTENIMIENTO.value]
                        ),
                        AIModelModel.is_active.is_(True),
                    )
                )
                .order_by(AIModelModel.name)
            )

            result = await self.session.execute(stmt)
            models = result.scalars().all()

            return [self._model_to_entity(model) for model in models]

        except Exception as e:
            logger.error(f"Error getting available AI models: {str(e)}", exc_info=True)
            return []

    async def update(self, model: AIModel) -> AIModel:
        """Update an existing AI model."""
        try:
            stmt = (
                update(AIModelModel)
                .where(AIModelModel.id == model.model_id)
                .values(
                    name=model.name,
                    model_type=model.model_type.value,
                    model_name=model.model_name,
                    api_endpoint=model.api_endpoint,
                    api_key_name=model.api_key_name,
                    max_tokens=model.max_tokens,
                    temperature=model.temperature,
                    top_p=model.top_p,
                    frequency_penalty=model.frequency_penalty,
                    presence_penalty=model.presence_penalty,
                    context_window=model.context_window,
                    cost_per_token=model.cost_per_token,
                    status=model.status.value,
                    supported_features=model.supported_features,
                    metadata=model.metadata,
                    updated_at=model.updated_at,
                )
            )

            await self.session.execute(stmt)
            await self.session.commit()

            # Return updated model
            return await self.get_by_id(model.model_id)

        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error updating AI model: {str(e)}", exc_info=True)
            raise

    async def delete(self, model_id: UUID) -> bool:
        """Delete an AI model configuration."""
        try:
            # Soft delete by setting is_active to False
            stmt = (
                update(AIModelModel)
                .where(AIModelModel.id == model_id)
                .values(is_active=False, updated_at=func.now())
            )

            result = await self.session.execute(stmt)
            await self.session.commit()

            return result.rowcount > 0

        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error deleting AI model {model_id}: {str(e)}", exc_info=True)
            return False

    async def update_status(self, model_id: UUID, status: ModelStatus) -> bool:
        """Update model status."""
        try:
            stmt = (
                update(AIModelModel)
                .where(AIModelModel.id == model_id)
                .values(status=status.value, updated_at=func.now())
            )

            result = await self.session.execute(stmt)
            await self.session.commit()

            return result.rowcount > 0

        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error updating AI model status: {str(e)}", exc_info=True)
            return False

    async def get_models_by_feature(self, feature: str) -> List[AIModel]:
        """Get models that support a specific feature."""
        try:
            # For PostgreSQL, you could use proper JSON array queries
            # For SQLite, we'll use a simple LIKE query
            stmt = (
                select(AIModelModel)
                .where(
                    and_(
                        func.json_extract(AIModelModel.supported_features, "$").like(
                            f'%"{feature}"%'
                        ),
                        AIModelModel.is_active.is_(True),
                        AIModelModel.status == ModelStatus.ACTIVO.value,
                    )
                )
                .order_by(AIModelModel.name)
            )

            result = await self.session.execute(stmt)
            models = result.scalars().all()

            # Additional filtering to ensure exact match
            filtered_models = []
            for model in models:
                if feature in (model.supported_features or []):
                    filtered_models.append(self._model_to_entity(model))

            return filtered_models

        except Exception as e:
            logger.error(
                f"Error getting models by feature {feature}: {str(e)}", exc_info=True
            )
            return []

    async def get_default_model(
        self, model_type: Optional[ModelType] = None
    ) -> Optional[AIModel]:
        """Get the default model for a type."""
        try:
            conditions = [
                AIModelModel.is_active.is_(True),
                AIModelModel.status == ModelStatus.ACTIVO.value,
            ]

            if model_type:
                conditions.append(AIModelModel.model_type == model_type.value)

            # Get the first available model, ordered by name
            # In a real implementation, you might have a 'is_default' flag
            stmt = (
                select(AIModelModel)
                .where(and_(*conditions))
                .order_by(AIModelModel.name)
                .limit(1)
            )

            result = await self.session.execute(stmt)
            model = result.scalar_one_or_none()

            if not model:
                return None

            return self._model_to_entity(model)

        except Exception as e:
            logger.error(f"Error getting default model: {str(e)}", exc_info=True)
            return None

    async def get_model_statistics(self) -> dict:
        """Get model usage statistics."""
        try:
            # Total models
            total_stmt = select(func.count(AIModelModel.id)).where(
                AIModelModel.is_active.is_(True)
            )
            total_result = await self.session.execute(total_stmt)
            total_models = total_result.scalar() or 0

            # Active models
            active_stmt = select(func.count(AIModelModel.id)).where(
                and_(
                    AIModelModel.is_active.is_(True),
                    AIModelModel.status == ModelStatus.ACTIVO.value,
                )
            )
            active_result = await self.session.execute(active_stmt)
            active_models = active_result.scalar() or 0

            # Models by type
            type_stmt = (
                select(AIModelModel.model_type, func.count(AIModelModel.id))
                .where(AIModelModel.is_active.is_(True))
                .group_by(AIModelModel.model_type)
            )

            type_result = await self.session.execute(type_stmt)
            models_by_type = dict(type_result.fetchall())

            # Models by status
            status_stmt = (
                select(AIModelModel.status, func.count(AIModelModel.id))
                .where(AIModelModel.is_active.is_(True))
                .group_by(AIModelModel.status)
            )

            status_result = await self.session.execute(status_stmt)
            models_by_status = dict(status_result.fetchall())

            return {
                "total_models": total_models,
                "active_models": active_models,
                "models_by_type": models_by_type,
                "models_by_status": models_by_status,
                "availability_rate": (active_models / max(total_models, 1)) * 100,
            }

        except Exception as e:
            logger.error(f"Error getting model statistics: {str(e)}", exc_info=True)
            return {}

    def _model_to_entity(self, model: AIModelModel) -> AIModel:
        """Convert SQLAlchemy model to domain entity."""
        return AIModel(
            model_id=model.id,
            name=model.name,
            model_type=ModelType(model.model_type),
            model_name=model.model_name,
            api_endpoint=model.api_endpoint,
            api_key_name=model.api_key_name,
            max_tokens=model.max_tokens,
            temperature=model.temperature,
            top_p=model.top_p,
            frequency_penalty=model.frequency_penalty,
            presence_penalty=model.presence_penalty,
            context_window=model.context_window,
            cost_per_token=model.cost_per_token,
            status=ModelStatus(model.status),
            metadata=model.metadata or {},
            supported_features=model.supported_features or [],
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
