import httpx
import pytest

from backend.context import ContextStore
from backend.dependencies import get_assistant_service
from backend.main import app
from backend.provider import FallbackProvider
from backend.service import AssistantService


@pytest.fixture
def fallback_app():
    service = AssistantService(ContextStore(), FallbackProvider(), FallbackProvider())

    async def override_service():
        return service

    app.dependency_overrides[get_assistant_service] = override_service
    yield app
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_guide_chat_accepts_frontend_question_alias(fallback_app):
    transport = httpx.ASGITransport(app=fallback_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/guide/chat",
            json={"question": "Tell me about Devghat", "language": "ne"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "देवघाट"
    assert body["source_ids"] == ["devghat"]


@pytest.mark.asyncio
async def test_analyze_image_accepts_png_and_returns_same_shape(fallback_app):
    png = b"\x89PNG\r\n\x1a\n" + b"prototype"
    transport = httpx.ASGITransport(app=fallback_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/guide/analyze-image",
            files={"image": ("landmark.png", png, "image/png")},
            data={"question": "What is this place in Bharatpur?", "language": "en"},
        )

    assert response.status_code == 200
    assert response.json()["title"] == "Explore Bharatpur"


@pytest.mark.asyncio
async def test_analyze_image_rejects_wrong_file_signature(fallback_app):
    transport = httpx.ASGITransport(app=fallback_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/assistant/analyze-image",
            files={"image": ("not-an-image.png", b"plain text", "image/png")},
        )

    assert response.status_code == 415
