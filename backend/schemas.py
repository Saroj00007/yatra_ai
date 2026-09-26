from typing import Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


Language = Literal["en", "ne", "hi"]
Confidence = Literal["high", "medium", "low"]


class ConversationTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class AssistantRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message: str = Field(
        min_length=1,
        max_length=2000,
        validation_alias=AliasChoices("message", "question"),
    )
    language: Language = "en"
    conversation: list[ConversationTurn] = Field(default_factory=list, max_length=12)
    context_id: str | None = Field(default=None, max_length=100)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class AssistantResponse(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    summary: str = Field(min_length=1, max_length=4000)
    cultural_significance: str | None = Field(default=None, max_length=1600)
    historical_context: str | None = Field(default=None, max_length=1600)
    confidence: Confidence
    source_ids: list[str] = Field(default_factory=list, max_length=8)
    nearby: list[str] = Field(default_factory=list, max_length=8)
    safety_tip: str | None = Field(default=None, max_length=500)
    suggested_questions: list[str] = Field(default_factory=list, max_length=5)
