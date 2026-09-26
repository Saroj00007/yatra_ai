import json
import re
from typing import Any

import httpx

from .config import Settings
from .schemas import AssistantRequest, AssistantResponse


class ProviderError(RuntimeError):
    """Raised when the configured model cannot produce a valid answer."""


class FallbackProvider:
    """Small deterministic provider used when no remote model is available."""

    async def answer_text(
        self,
        request: AssistantRequest,
        contexts: list[dict[str, Any]],
    ) -> AssistantResponse:
        record = contexts[0] if contexts else {}
        language = request.language
        default_titles = {"en": "YatraAI", "ne": "YatraAI सहायक", "hi": "YatraAI सहायक"}
        default_summaries = {
            "en": "I’m running in offline fallback mode, so I can only give reliable answers from the verified local context currently available. General conversation will work when the AI provider is connected.",
            "ne": "म अहिले अफलाइन fallback मोडमा छु, त्यसैले उपलब्ध प्रमाणित स्थानीय सन्दर्भबाट मात्र भरपर्दो उत्तर दिन सक्छु। AI provider जडान भएपछि सामान्य कुराकानी पनि गर्न सक्छु।",
            "hi": "मैं अभी offline fallback mode में हूँ, इसलिए उपलब्ध सत्यापित स्थानीय संदर्भ से ही भरोसेमंद उत्तर दे सकता हूँ। AI provider जुड़ने पर सामान्य बातचीत भी कर सकता हूँ।",
        }
        title = record.get("title", {}).get(language) or record.get("topic", default_titles[language])
        summary = record.get("summary", {}).get(language) or record.get("summary", {}).get("en")
        if not summary:
            summary = default_summaries[language]

        return AssistantResponse(
            title=title,
            summary=summary,
            cultural_significance=record.get("cultural_significance", {}).get(language)
            or record.get("cultural_significance", {}).get("en"),
            historical_context=record.get("historical_context", {}).get(language)
            or record.get("historical_context", {}).get("en"),
            confidence="medium" if record else "low",
            source_ids=[record["id"]] if record.get("id") else [],
            nearby=record.get("nearby", [])[:4],
            safety_tip=record.get("safety_tip", {}).get(language)
            or record.get("safety_tip", {}).get("en"),
            suggested_questions=record.get("suggested_questions", {}).get(language)
            or record.get("suggested_questions", {}).get("en", []),
        )

    async def answer_image(
        self,
        request: AssistantRequest,
        image_bytes: bytes,
        content_type: str,
        contexts: list[dict[str, Any]],
    ) -> AssistantResponse:
        del image_bytes, content_type
        return await self.answer_text(
            request.model_copy(
                update={
                    "message": request.message
                    or "Describe the tourism-related subject in this image."
                }
            ),
            contexts,
        )


class OpenAICompatibleProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def answer_text(
        self,
        request: AssistantRequest,
        contexts: list[dict[str, Any]],
    ) -> AssistantResponse:
        messages = self._text_messages(request, contexts)
        return await self._complete(messages)

    async def answer_image(
        self,
        request: AssistantRequest,
        image_bytes: bytes,
        content_type: str,
        contexts: list[dict[str, Any]],
    ) -> AssistantResponse:
        context_text = self._context_text(contexts)
        image_data = f"data:{content_type};base64,{self._encode(image_bytes)}"
        user_text = self._user_prompt(request, context_text)
        messages: list[dict[str, Any]] = [
            {"role": "system", "content": self._system_prompt()},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_text},
                    {"type": "image_url", "image_url": {"url": image_data}},
                ],
            },
        ]
        return await self._complete(messages)

    async def _complete(self, messages: list[dict[str, Any]]) -> AssistantResponse:
        url = self.settings.ai_base_url.rstrip("/")
        if not url.endswith("/chat/completions"):
            url = f"{url}/chat/completions"

        headers = {"Content-Type": "application/json"}
        if self.settings.ai_api_key:
            headers["Authorization"] = f"Bearer {self.settings.ai_api_key}"

        payload = {
            "model": self.settings.ai_model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 600,
        }

        try:
            async with httpx.AsyncClient(timeout=self.settings.ai_timeout_seconds) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                body = response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise ProviderError("AI provider request failed") from error

        try:
            content = body["choices"][0]["message"]["content"]
            if isinstance(content, list):
                content = "".join(
                    part.get("text", "") for part in content if isinstance(part, dict)
                )
            parsed = json.loads(self._strip_code_fence(str(content)))
            if not isinstance(parsed, dict):
                raise TypeError("AI provider response must be a JSON object")
            return AssistantResponse.model_validate(self._normalize_payload(parsed))
        except (KeyError, IndexError, TypeError, ValueError) as error:
            raise ProviderError("AI provider returned an invalid response") from error

    @staticmethod
    def _encode(image_bytes: bytes) -> str:
        import base64

        return base64.b64encode(image_bytes).decode("ascii")

    @staticmethod
    def _strip_code_fence(content: str) -> str:
        content = content.strip()
        match = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", content, flags=re.DOTALL | re.IGNORECASE)
        return match.group(1).strip() if match else content

    @staticmethod
    def _confidence_label(value: Any) -> str:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"high", "medium", "low"}:
                return normalized
            try:
                value = float(normalized)
            except ValueError as error:
                raise ValueError("confidence must be high, medium, low, or a numeric score") from error

        if isinstance(value, (int, float)) and not isinstance(value, bool):
            score = float(value)
            if score > 1:
                score /= 100
            if 0 <= score <= 1:
                if score >= 0.8:
                    return "high"
                if score >= 0.5:
                    return "medium"
                return "low"

        raise ValueError("confidence must be high, medium, low, or a numeric score")

    @classmethod
    def _normalize_payload(cls, payload: dict[str, Any]) -> dict[str, Any]:
        normalized = dict(payload)
        normalized["confidence"] = cls._confidence_label(normalized.get("confidence"))
        for field in ("source_ids", "nearby", "suggested_questions"):
            value = normalized.get(field)
            if value is None or (isinstance(value, str) and not value.strip()):
                normalized[field] = []
            elif isinstance(value, str):
                normalized[field] = [value]
            elif not isinstance(value, list):
                raise TypeError(f"{field} must be a list")
        return normalized

    def _text_messages(
        self,
        request: AssistantRequest,
        contexts: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        messages: list[dict[str, Any]] = [{"role": "system", "content": self._system_prompt()}]
        messages.extend(
            {"role": turn.role, "content": turn.content} for turn in request.conversation
        )
        messages.append(
            {
                "role": "user",
                "content": self._user_prompt(request, self._context_text(contexts)),
            }
        )
        return messages

    @staticmethod
    def _system_prompt() -> str:
        return (
            "You are YatraAI, a helpful and concise general-purpose conversational assistant "
            "with strong local knowledge support for Bharatpur, Chitwan, and Nepal. Answer "
            "ordinary questions, casual conversation, explanations, brainstorming, and travel "
            "questions naturally. Do not assume every request is tourism-related, and do not "
            "force cultural or historical sections onto general questions. Use the supplied "
            "verified local context when the user asks about Bharatpur or another context-specific "
            "local fact. For claims about prices, opening hours, emergency numbers, distances, "
            "current events, or historical facts, do not invent details; state when live or "
            "verified information is unavailable. If local context is insufficient, explain that "
            "limitation, then answer from general knowledge when appropriate. Answer in the "
            "requested language. Return JSON only with exactly these fields: title, summary, "
            "cultural_significance, historical_context, confidence (the string high, medium, "
            "or low; never a number), "
            "source_ids, nearby, safety_tip, and suggested_questions."
        )

    @staticmethod
    def _context_text(contexts: list[dict[str, Any]]) -> str:
        return json.dumps(contexts, ensure_ascii=False)

    @staticmethod
    def _user_prompt(request: AssistantRequest, context_text: str) -> str:
        return (
            f"Requested language: {request.language}\n"
            f"User message: {request.message}\n"
            f"Verified local context, use only when relevant: {context_text}"
        )
