from functools import lru_cache

from .config import get_settings
from .context import ContextStore
from .provider import FallbackProvider, OpenAICompatibleProvider
from .service import AssistantService


@lru_cache
def get_context_store() -> ContextStore:
    return ContextStore()


@lru_cache
def _build_assistant_service() -> AssistantService:
    settings = get_settings()
    fallback = FallbackProvider()
    provider = OpenAICompatibleProvider(settings) if settings.ai_configured else fallback
    return AssistantService(get_context_store(), provider, fallback)


async def get_assistant_service() -> AssistantService:
    return _build_assistant_service()
