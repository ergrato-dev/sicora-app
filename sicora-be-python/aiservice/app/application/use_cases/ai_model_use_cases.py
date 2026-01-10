"""AI Model management use cases."""

import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from app.domain.entities.ai_model import AIModel, ModelType, ModelStatus
from app.domain.repositories.ai_model_repository import AIModelRepository
from app.domain.exceptions.ai_exceptions import (
    ModelNotAvailableError,
    InvalidModelConfigurationError,
)
from app.application.interfaces.ai_provider_interface import AIProviderInterface
from app.application.interfaces.cache_interface import CacheInterface
from app.application.dtos.ai_dtos import (
    AIModelCreateDTO,
    AIModelUpdateDTO,
    AIModelResponseDTO,
)

logger = logging.getLogger(__name__)


class AIModelManagementUseCase:
    """Use case for AI model management."""

    def __init__(
        self,
        ai_model_repo: AIModelRepository,
        ai_provider: AIProviderInterface,
        cache: CacheInterface,
    ):
        self.ai_model_repo = ai_model_repo
        self.ai_provider = ai_provider
        self.cache = cache

    async def create_ai_model(self, request: AIModelCreateDTO) -> AIModelResponseDTO:
        """Create a new AI model configuration."""
        try:
            # Validate model configuration
            await self._validate_model_config(request)

            # Create AI model entity
            model = AIModel(
                name=request.name,
                model_type=ModelType(request.model_type),
                model_name=request.model_name,
                api_endpoint=request.api_endpoint,
                api_key_name=request.api_key_name,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                context_window=request.context_window,
                cost_per_token=request.cost_per_token,
                supported_features=request.supported_features or [],
                metadata=request.metadata or {},
            )

            # Test model availability
            is_available = await self.ai_provider.check_model_availability(model)
            if not is_available:
                model.update_status(ModelStatus.ERROR)
                logger.warning(f"Model {request.name} is not available")

            # Save model
            saved_model = await self.ai_model_repo.create(model)

            # Clear model cache
            await self.cache.delete("active_models")

            return self._to_response_dto(saved_model)

        except Exception as e:
            logger.error(f"Error creating AI model: {str(e)}", exc_info=True)
            raise InvalidModelConfigurationError(f"Failed to create AI model: {str(e)}")

    async def update_ai_model(
        self, model_id: UUID, request: AIModelUpdateDTO
    ) -> AIModelResponseDTO:
        """Update an AI model configuration."""
        try:
            model = await self.ai_model_repo.get_by_id(model_id)
            if not model:
                raise ModelNotAvailableError(f"AI model {model_id} not found")

            # Update fields
            if request.name is not None:
                model.name = request.name
            if request.api_endpoint is not None:
                model.api_endpoint = request.api_endpoint
            if request.max_tokens is not None:
                model.max_tokens = request.max_tokens
            if request.temperature is not None:
                model.temperature = request.temperature
            if request.context_window is not None:
                model.context_window = request.context_window
            if request.cost_per_token is not None:
                model.cost_per_token = request.cost_per_token
            if request.status is not None:
                model.update_status(ModelStatus(request.status))
            if request.supported_features is not None:
                model.supported_features = request.supported_features
            if request.metadata is not None:
                model.metadata.update(request.metadata)

            # Test availability if configuration changed
            if any([request.api_endpoint is not None, request.status == "active"]):
                is_available = await self.ai_provider.check_model_availability(model)
                if not is_available and model.status == ModelStatus.ACTIVO:
                    model.update_status(ModelStatus.ERROR)

            # Save changes
            updated_model = await self.ai_model_repo.update(model)

            # Clear cache
            await self.cache.delete("active_models")
            await self.cache.delete(f"model:{model_id}")

            return self._to_response_dto(updated_model)

        except Exception as e:
            logger.error(f"Error updating AI model: {str(e)}", exc_info=True)
            raise InvalidModelConfigurationError(f"Failed to update AI model: {str(e)}")

    async def get_ai_model(self, model_id: UUID) -> AIModelResponseDTO:
        """Get an AI model by ID."""
        model = await self.ai_model_repo.get_by_id(model_id)
        if not model:
            raise ModelNotAvailableError(f"AI model {model_id} not found")

        return self._to_response_dto(model)

    async def get_ai_model_by_name(self, name: str) -> AIModelResponseDTO:
        """Get an AI model by name."""
        model = await self.ai_model_repo.get_by_name(name)
        if not model:
            raise ModelNotAvailableError(f"AI model '{name}' not found")

        return self._to_response_dto(model)

    async def list_ai_models(
        self,
        model_type: Optional[str] = None,
        status: Optional[str] = None,
        feature: Optional[str] = None,
    ) -> List[AIModelResponseDTO]:
        """List AI models with filters."""
        try:
            if feature:
                models = await self.ai_model_repo.get_models_by_feature(feature)
            elif model_type:
                models = await self.ai_model_repo.get_by_type(ModelType(model_type))
            elif status == "active":
                models = await self.ai_model_repo.get_active_models()
            elif status == "available":
                models = await self.ai_model_repo.get_available_models()
            else:
                models = await self.ai_model_repo.get_active_models()

            return [self._to_response_dto(model) for model in models]

        except Exception as e:
            logger.error(f"Error listing AI models: {str(e)}", exc_info=True)
            return []

    async def get_available_models(self) -> List[AIModelResponseDTO]:
        """Get all available AI models."""
        try:
            # Check cache first
            cached_models = await self.cache.get("available_models")
            if cached_models:
                return cached_models

            models = await self.ai_model_repo.get_available_models()

            # Verify actual availability
            available_models = []
            for model in models:
                try:
                    is_available = await self.ai_provider.check_model_availability(
                        model
                    )
                    if is_available:
                        available_models.append(model)
                    elif model.status == ModelStatus.ACTIVO:
                        # Update status if model is not actually available
                        model.update_status(ModelStatus.ERROR)
                        await self.ai_model_repo.update(model)
                except Exception as e:
                    logger.warning(f"Error checking model {model.name}: {str(e)}")

            result = [self._to_response_dto(model) for model in available_models]

            # Cache for 5 minutes
            await self.cache.set(
                "available_models", result, expire=timedelta(minutes=5)
            )

            return result

        except Exception as e:
            logger.error(f"Error getting available models: {str(e)}", exc_info=True)
            return []

    async def delete_ai_model(self, model_id: UUID) -> bool:
        """Delete an AI model configuration."""
        try:
            model = await self.ai_model_repo.get_by_id(model_id)
            if not model:
                raise ModelNotAvailableError(f"AI model {model_id} not found")

            # Check if model is being used (you might want to add this check)
            # For now, we'll allow deletion

            success = await self.ai_model_repo.delete(model_id)

            # Clear cache
            await self.cache.delete("active_models")
            await self.cache.delete("available_models")
            await self.cache.delete(f"model:{model_id}")

            return success

        except Exception as e:
            logger.error(f"Error deleting AI model: {str(e)}", exc_info=True)
            raise InvalidModelConfigurationError(f"Failed to delete AI model: {str(e)}")

    async def test_model_availability(self, model_id: UUID) -> Dict[str, Any]:
        """Test if a model is available and working."""
        try:
            model = await self.ai_model_repo.get_by_id(model_id)
            if not model:
                raise ModelNotAvailableError(f"AI model {model_id} not found")

            # Test availability
            is_available = await self.ai_provider.check_model_availability(model)

            # Get model info if available
            model_info = {}
            if is_available:
                try:
                    model_info = await self.ai_provider.get_model_info(model.model_name)
                except Exception as e:
                    logger.warning(f"Could not get model info: {str(e)}")

            # Update model status
            new_status = ModelStatus.ACTIVO if is_available else ModelStatus.ERROR
            if model.status != new_status:
                model.update_status(new_status)
                await self.ai_model_repo.update(model)

            return {
                "model_id": str(model_id),
                "model_name": model.name,
                "is_available": is_available,
                "status": model.status.value,
                "model_info": model_info,
                "last_tested": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error testing model availability: {str(e)}", exc_info=True)
            raise ModelNotAvailableError(f"Failed to test model: {str(e)}")

    async def get_model_statistics(self) -> Dict[str, Any]:
        """Get model usage statistics."""
        try:
            return await self.ai_model_repo.get_model_statistics()
        except Exception as e:
            logger.error(f"Error getting model statistics: {str(e)}", exc_info=True)
            return {}

    async def _validate_model_config(self, request: AIModelCreateDTO) -> None:
        """Validate model configuration."""
        # Check if name already exists
        existing_model = await self.ai_model_repo.get_by_name(request.name)
        if existing_model:
            raise InvalidModelConfigurationError(
                f"Model with name '{request.name}' already exists"
            )

        # Validate model type specific requirements
        if request.model_type in ["openai_gpt", "anthropic_claude"]:
            if not request.api_key_name:
                raise InvalidModelConfigurationError(
                    f"API key name is required for {request.model_type}"
                )

        # Validate numeric parameters
        if request.temperature < 0 or request.temperature > 2:
            raise InvalidModelConfigurationError("Temperature must be between 0 and 2")

        if request.max_tokens <= 0:
            raise InvalidModelConfigurationError("Max tokens must be greater than 0")

        if request.context_window <= 0:
            raise InvalidModelConfigurationError(
                "Context window must be greater than 0"
            )

    def _to_response_dto(self, model: AIModel) -> AIModelResponseDTO:
        """Convert AI model to response DTO."""
        return AIModelResponseDTO(
            model_id=model.model_id,
            name=model.name,
            model_type=model.model_type.value,
            model_name=model.model_name,
            api_endpoint=model.api_endpoint,
            max_tokens=model.max_tokens,
            temperature=model.temperature,
            context_window=model.context_window,
            cost_per_token=model.cost_per_token,
            status=model.status.value,
            supported_features=model.supported_features,
            metadata=model.metadata,
            created_at=model.created_at,
            updated_at=model.updated_at,
            is_available=model.is_available(),
        )
