from typing import Any, Protocol

from .context import ContextStore
from .provider import ProviderError
from .schemas import AssistantRequest, AssistantResponse


class AssistantProvider(Protocol):
    async def answer_text(
        self, request: AssistantRequest, contexts: list[dict[str, Any]]
    ) -> AssistantResponse: ...

    async def answer_image(
        self,
        request: AssistantRequest,
        image_bytes: bytes,
        content_type: str,
        contexts: list[dict[str, Any]],
    ) -> AssistantResponse: ...


class AssistantService:
    def __init__(
        self,
        context_store: ContextStore,
        provider: AssistantProvider,
        fallback: AssistantProvider,
    ) -> None:
        self.context_store = context_store
        self.provider = provider
        self.fallback = fallback

    async def chat(self, request: AssistantRequest) -> AssistantResponse:
        contexts = self.context_store.search(request.message, request.context_id)
        try:
            response = await self.provider.answer_text(request, contexts)
        except ProviderError:
            response = await self.fallback.answer_text(request, contexts)
        return self._ground_response(response, contexts, request.language)

    async def analyze_image(
        self,
        request: AssistantRequest,
        image_bytes: bytes,
        content_type: str,
    ) -> AssistantResponse:
        contexts = self.context_store.search(request.message, request.context_id)
        try:
            response = await self.provider.answer_image(
                request, image_bytes, content_type, contexts
            )
        except ProviderError:
            response = await self.fallback.answer_image(
                request, image_bytes, content_type, contexts
            )
        return self._ground_response(response, contexts, request.language)

    def _ground_response(
        self,
        response: AssistantResponse,
        contexts: list[dict[str, Any]],
        language: str,
    ) -> AssistantResponse:
        known_ids = self.context_store.ids
        source_ids = [source_id for source_id in response.source_ids if source_id in known_ids]
        nearby = [place_id for place_id in response.nearby if place_id in known_ids]
        if not source_ids and contexts:
            source_ids = [contexts[0]["id"]]

        update: dict[str, Any] = {"source_ids": source_ids, "nearby": nearby}
        if contexts:
            record = contexts[0]
            for field in ("cultural_significance", "historical_context"):
                if getattr(response, field) is None:
                    values = record.get(field, {})
                    if isinstance(values, dict):
                        update[field] = values.get(language) or values.get("en")

        return response.model_copy(update=update)
