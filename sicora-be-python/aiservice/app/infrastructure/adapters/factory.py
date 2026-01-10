"""AI Provider factory for managing different AI service adapters."""

from typing import Dict, Optional, Any
from enum import Enum

from app.application.interfaces.ai_provider_interface import AIProviderInterface
from app.application.interfaces.vector_store_interface import VectorStoreInterface
from app.application.interfaces.cache_interface import CacheInterface
from app.infrastructure.adapters.openai_adapter import OpenAIAdapter
from app.infrastructure.adapters.anthropic_adapter import AnthropicAdapter
from app.infrastructure.adapters.huggingface_adapter import HuggingFaceAdapter
# from app.infrastructure.adapters.chromadb_adapter import ChromaDBAdapter  # Temporarily disabled
from app.infrastructure.adapters.redis_adapter import RedisAdapter
from app.domain.exceptions.ai_exceptions import AIProviderError


class AIProviderType(Enum):
    """Available AI provider types."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    HUGGINGFACE = "huggingface"


class VectorStoreType(Enum):
    """Available vector store types."""
    # CHROMADB = "chromadb"  # Temporarily disabled
    pass  # Placeholder until we add other vector stores


class CacheType(Enum):
    """Available cache types."""
    REDIS = "redis"


class AIServiceFactory:
    """Factory for creating AI service adapters."""
    
    def __init__(self):
        self._ai_providers: Dict[str, AIProviderInterface] = {}
        self._vector_stores: Dict[str, VectorStoreInterface] = {}
        self._caches: Dict[str, CacheInterface] = {}
    
    def create_ai_provider(
        self,
        provider_type: AIProviderType,
        config: Dict[str, Any],
        instance_name: str = "default"
    ) -> AIProviderInterface:
        """Create and register an AI provider adapter."""
        
        cache_key = f"{provider_type.value}_{instance_name}"
        
        if cache_key in self._ai_providers:
            return self._ai_providers[cache_key]
        
        try:
            if provider_type == AIProviderType.OPENAI:
                adapter = OpenAIAdapter(
                    api_key=config["api_key"],
                    organization=config.get("organization")
                )
            elif provider_type == AIProviderType.ANTHROPIC:
                adapter = AnthropicAdapter(
                    api_key=config["api_key"]
                )
            elif provider_type == AIProviderType.HUGGINGFACE:
                adapter = HuggingFaceAdapter(
                    device=config.get("device", "auto")
                )
            else:
                raise AIProviderError(f"Unsupported AI provider type: {provider_type}")
            
            self._ai_providers[cache_key] = adapter
            return adapter
            
        except Exception as e:
            raise AIProviderError(f"Failed to create AI provider {provider_type}: {str(e)}")
    
    def create_vector_store(
        self,
        store_type: VectorStoreType,
        config: Dict[str, Any],
        instance_name: str = "default"
    ) -> VectorStoreInterface:
        """Create and register a vector store adapter."""
        
        cache_key = f"{store_type.value}_{instance_name}"
        
        if cache_key in self._vector_stores:
            return self._vector_stores[cache_key]
        
        try:
            # Vector stores no implementados en esta versión
            raise AIProviderError(f"Unsupported vector store type: {store_type}")
            
        except AIProviderError:
            raise
        except Exception as e:
            raise AIProviderError(f"Failed to create vector store {store_type}: {str(e)}")
    
    def create_cache(
        self,
        cache_type: CacheType,
        config: Dict[str, Any],
        instance_name: str = "default"
    ) -> CacheInterface:
        """Create and register a cache adapter."""
        
        cache_key = f"{cache_type.value}_{instance_name}"
        
        if cache_key in self._caches:
            return self._caches[cache_key]
        
        try:
            if cache_type == CacheType.REDIS:
                adapter = RedisAdapter(
                    host=config.get("host", "localhost"),
                    port=config.get("port", 6379),
                    db=config.get("db", 0),
                    password=config.get("password"),
                    max_connections=config.get("max_connections", 10),
                    key_prefix=config.get("key_prefix", "aiservice:")
                )
            else:
                raise AIProviderError(f"Unsupported cache type: {cache_type}")
            
            self._caches[cache_key] = adapter
            return adapter
            
        except Exception as e:
            raise AIProviderError(f"Failed to create cache {cache_type}: {str(e)}")
    
    def get_ai_provider(self, instance_name: str = "default") -> Optional[AIProviderInterface]:
        """Get a registered AI provider."""
        for key, provider in self._ai_providers.items():
            if key.endswith(f"_{instance_name}"):
                return provider
        return None
    
    def get_vector_store(self, instance_name: str = "default") -> Optional[VectorStoreInterface]:
        """Get a registered vector store."""
        for key, store in self._vector_stores.items():
            if key.endswith(f"_{instance_name}"):
                return store
        return None
    
    def get_cache(self, instance_name: str = "default") -> Optional[CacheInterface]:
        """Get a registered cache."""
        for key, cache in self._caches.items():
            if key.endswith(f"_{instance_name}"):
                return cache
        return None
    
    def list_ai_providers(self) -> Dict[str, str]:
        """List all registered AI providers."""
        return {
            name: type(provider).__name__ 
            for name, provider in self._ai_providers.items()
        }
    
    def list_vector_stores(self) -> Dict[str, str]:
        """List all registered vector stores."""
        return {
            name: type(store).__name__ 
            for name, store in self._vector_stores.items()
        }
    
    def list_caches(self) -> Dict[str, str]:
        """List all registered caches."""
        return {
            name: type(cache).__name__ 
            for name, cache in self._caches.items()
        }
    
    def clear_cache(self):
        """Clear all cached adapters."""
        self._ai_providers.clear()
        self._vector_stores.clear()
        self._caches.clear()


# Global factory instance
ai_service_factory = AIServiceFactory()
