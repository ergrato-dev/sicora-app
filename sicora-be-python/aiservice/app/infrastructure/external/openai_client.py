"""
OpenAI Client for Enhanced Chat Service
Cliente simplificado de OpenAI para el servicio de chat mejorado
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.infrastructure.adapters.openai_adapter import OpenAIAdapter
from app.domain.entities.ai_model import AIModel
from app.domain.value_objects.message import Message, MessageType
from app.domain.exceptions.ai_exceptions import (
    ModelNotAvailableError,
    AIProviderError,
    RateLimitError,
)

logger = logging.getLogger(__name__)


class OpenAIClient:
    """
    Cliente simplificado de OpenAI para el chat service.
    Wrapper del OpenAIAdapter existente para uso directo.
    """

    def __init__(self, api_key: str, organization: Optional[str] = None):
        self.adapter = OpenAIAdapter(api_key=api_key, organization=organization)
        self.default_models = {
            "gpt-4": AIModel(
                model_name="gpt-4",
                provider="openai",
                model_type="chat",
                max_tokens=8192,
                cost_per_token=0.00003,
            ),
            "gpt-3.5-turbo": AIModel(
                model_name="gpt-3.5-turbo",
                provider="openai",
                model_type="chat",
                max_tokens=4096,
                cost_per_token=0.000002,
            ),
        }

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Realizar completación de chat con OpenAI.

        Args:
            messages: Lista de mensajes en formato OpenAI
            model: Nombre del modelo a usar
            temperature: Temperatura para creatividad
            max_tokens: Máximo número de tokens
            **kwargs: Parámetros adicionales

        Returns:
            Respuesta de OpenAI en formato dict

        Raises:
            ModelNotAvailableError: Modelo no disponible
            AIProviderError: Error del proveedor de IA
            RateLimitError: Límite de tasa excedido
        """
        try:
            # Convertir mensajes dict a objetos Message
            message_objects = []
            for msg in messages:
                message_obj = Message(
                    content=msg["content"],
                    role=msg["role"],
                    message_type=MessageType.TEXTO,
                    timestamp=datetime.utcnow(),
                )
                message_objects.append(message_obj)

            # Obtener modelo
            if model not in self.default_models:
                raise ModelNotAvailableError(f"Model {model} not available")

            model_obj = self.default_models[model]

            # Generar respuesta usando el adapter
            response_message = await self.adapter.generate_response(
                messages=message_objects,
                model=model_obj,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs,
            )

            # Convertir respuesta a formato compatible
            return {
                "choices": [
                    {
                        "message": {
                            "content": response_message.content,
                            "role": response_message.role,
                        }
                    }
                ],
                "model": model,
                "usage": {
                    "total_tokens": response_message.metadata.get("tokens", 0)
                    if response_message.metadata
                    else 0
                },
            }

        except Exception as e:
            logger.error(f"OpenAI chat completion failed: {str(e)}")
            if "rate limit" in str(e).lower():
                raise RateLimitError(f"Rate limit exceeded: {str(e)}")
            elif "model" in str(e).lower():
                raise ModelNotAvailableError(f"Model error: {str(e)}")
            else:
                raise AIProviderError(f"OpenAI API error: {str(e)}")

    async def create_embeddings(
        self, texts: List[str], model: str = "text-embedding-ada-002"
    ) -> List[List[float]]:
        """
        Crear embeddings usando OpenAI.

        Args:
            texts: Lista de textos para crear embeddings
            model: Modelo de embeddings

        Returns:
            Lista de vectores de embeddings
        """
        try:
            embeddings = await self.adapter.create_embeddings(texts=texts, model=model)
            return embeddings

        except Exception as e:
            logger.error(f"Failed to create embeddings: {str(e)}")
            raise AIProviderError(f"Embedding creation failed: {str(e)}")

    async def health_check(self) -> bool:
        """
        Verificar conectividad con OpenAI.

        Returns:
            True si la conexión está funcionando
        """
        try:
            # Realizar una consulta simple para verificar conectividad
            test_messages = [{"role": "user", "content": "Hello"}]

            await self.chat_completion(
                messages=test_messages, model="gpt-3.5-turbo", max_tokens=5
            )

            return True

        except Exception as e:
            logger.error(f"OpenAI health check failed: {str(e)}")
            return False

    def get_available_models(self) -> List[str]:
        """Obtener lista de modelos disponibles."""
        return list(self.default_models.keys())

    def get_model_info(self, model_name: str) -> Optional[Dict[str, Any]]:
        """Obtener información de un modelo específico."""
        if model_name in self.default_models:
            model = self.default_models[model_name]
            return {
                "name": model.model_name,
                "provider": model.provider,
                "type": model.model_type,
                "max_tokens": model.max_tokens,
                "cost_per_token": model.cost_per_token,
            }
        return None
