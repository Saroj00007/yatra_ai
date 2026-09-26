from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError

from ..config import get_settings
from ..dependencies import get_assistant_service
from ..schemas import AssistantRequest, AssistantResponse, Language
from ..service import AssistantService


router = APIRouter(prefix="/api")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/assistant/chat", response_model=AssistantResponse)
@router.post("/guide/chat", response_model=AssistantResponse)
async def chat(
    payload: AssistantRequest,
    service: Annotated[AssistantService, Depends(get_assistant_service)],
) -> AssistantResponse:
    return await service.chat(payload)


@router.post("/assistant/analyze-image", response_model=AssistantResponse)
@router.post("/guide/analyze-image", response_model=AssistantResponse)
async def analyze_image(
    image: Annotated[UploadFile, File(...)],
    question: Annotated[str, Form()] = "Describe the tourism-related subject in this image.",
    language: Annotated[Language, Form()] = "en",
    context_id: Annotated[str | None, Form()] = None,
    service: AssistantService = Depends(get_assistant_service),
) -> AssistantResponse:
    content_type = (image.content_type or "").lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, and WebP images are supported.",
        )

    settings = get_settings()
    image_bytes = await image.read(settings.max_image_bytes + 1)
    if len(image_bytes) > settings.max_image_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds the 5 MiB upload limit.",
        )
    if not _has_valid_signature(image_bytes, content_type):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Image content does not match its declared type.",
        )

    try:
        payload = AssistantRequest(
            message=question.strip() or "Describe the tourism-related subject in this image.",
            language=language,
            context_id=context_id,
        )
    except ValidationError as error:
        raise HTTPException(status_code=422, detail="Invalid image question.") from error

    return await service.analyze_image(payload, image_bytes, content_type)


def _has_valid_signature(data: bytes, content_type: str) -> bool:
    if content_type == "image/jpeg":
        return data.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    return False
