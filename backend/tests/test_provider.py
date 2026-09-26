import pytest

from backend.config import Settings
from backend.context import ContextStore
from backend.provider import FallbackProvider, OpenAICompatibleProvider, ProviderError
from backend.schemas import AssistantRequest, AssistantResponse
from backend.service import AssistantService


class FakeResponse:
    def raise_for_status(self):
        return None

    def json(self):
        return {
            "choices": [
                {
                    "message": {
                        "content": "```json\n"
                        '{"title":"Devghat","summary":"A cultural destination.",'
                        '"confidence":"high","source_ids":["devghat"],'
                        '"nearby":[],"safety_tip":null,"suggested_questions":[]}'
                        "\n```"
                    }
                }
            ]
        }


class FakeAsyncClient:
    response = FakeResponse()

    def __init__(self, **kwargs):
        self.kwargs = kwargs
        self.payload = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return None

    async def post(self, url, headers, json):
        self.payload = json
        return self.response


@pytest.mark.asyncio
async def test_openai_compatible_provider_parses_json_code_fence(monkeypatch):
    client = FakeAsyncClient()
    monkeypatch.setattr("backend.provider.httpx.AsyncClient", lambda **kwargs: client)
    settings = Settings(ai_base_url="http://localhost:11434/v1", ai_model="local-model")
    provider = OpenAICompatibleProvider(settings)
    context = ContextStore().get("devghat")

    response = await provider.answer_text(
        AssistantRequest(message="Tell me about Devghat"),
        [context],
    )

    assert response.title == "Devghat"
    assert response.confidence == "high"


class BrokenProvider:
    async def answer_text(self, request, contexts):
        raise ProviderError("simulated provider failure")


class IncompleteProvider:
    async def answer_text(self, request, contexts):
        return AssistantResponse(
            title="Devghat",
            summary="A cultural destination.",
            confidence="high",
        )

    async def answer_image(self, request, image_bytes, content_type, contexts):
        return await self.answer_text(request, contexts)

    async def answer_image(self, request, image_bytes, content_type, contexts):
        raise ProviderError("simulated provider failure")


@pytest.mark.asyncio
async def test_service_uses_fallback_when_provider_fails():
    service = AssistantService(ContextStore(), BrokenProvider(), FallbackProvider())

    response = await service.chat(AssistantRequest(message="Tell me about Devghat"))

    assert response.title == "Devghat"
    assert response.cultural_significance
    assert response.historical_context
    assert response.confidence == "medium"


@pytest.mark.asyncio
async def test_service_fills_missing_place_context_from_verified_record():
    service = AssistantService(ContextStore(), IncompleteProvider(), FallbackProvider())

    response = await service.chat(AssistantRequest(message="Tell me about Devghat"))

    assert response.cultural_significance
    assert response.historical_context
    assert response.source_ids == ["devghat"]
