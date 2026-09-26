from backend.context import ContextStore
from backend.provider import FallbackProvider
from backend.schemas import AssistantRequest


def test_context_search_finds_narayani_river():
    store = ContextStore()

    matches = store.search("Where can I watch the sunset near the river?")

    assert matches
    assert matches[0]["id"] == "narayani-river"


def test_fallback_provider_returns_requested_language():
    store = ContextStore()
    request = AssistantRequest(message="Tell me about Devghat", language="ne")
    provider = FallbackProvider()

    import asyncio

    response = asyncio.run(provider.answer_text(request, store.search(request.message)))

    assert response.confidence == "medium"
    assert "देवघाट" in response.title
    assert response.source_ids == ["devghat"]


def test_context_search_does_not_guess_for_unrelated_question():
    store = ContextStore()

    assert store.search("What is the current weather forecast?") == []
