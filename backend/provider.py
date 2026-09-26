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
            "en": "I do not have enough verified local information for that question yet. Try asking about Bharatpur, Chitwan National Park, the Narayani River, Devghat, or Tharu culture.",
            "ne": "यस प्रश्नका लागि मसँग पर्याप्त प्रमाणित स्थानीय जानकारी छैन। भरतपुर, चितवन राष्ट्रिय निकुञ्ज, नारायणी नदी, देवघाट वा थारू संस्कृतिबारे सोध्नुहोस्।",
            "hi": "इस प्रश्न के लिए मेरे पास पर्याप्त सत्यापित स्थानीय जानकारी नहीं है। भरतपुर, चितवन राष्ट्रीय उद्यान, नारायणी नदी, देवघाट या थारू संस्कृति के बारे में पूछें।",
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
            return AssistantResponse.model_validate(parsed)
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
            "You are YatraAI, a concise and trustworthy tourism assistant for Bharatpur, "
            "Chitwan, Nepal. Use the supplied local context for local claims. Do not invent "
            "prices, opening hours, emergency numbers, distances, or historical facts. "
            "When the user asks about a specific place, landmark, cultural site, or object, "
            "prioritize its cultural significance and a brief historical context before "
            "current travel details. If reliable history is unavailable, say that clearly "
            "instead of guessing. Even when the user asks about current hours or prices, "
            "include a short cultural or historical explanation first when the subject is a "
            "place. "
            "If the context is insufficient, say so and use low confidence. Answer in the "
            "requested language. Return JSON only with exactly these fields: title, summary, "
            "cultural_significance, historical_context, confidence (high, medium, or low), "
            "source_ids, nearby, safety_tip, and suggested_questions."
        )

    @staticmethod
    def _context_text(contexts: list[dict[str, Any]]) -> str:
        return json.dumps(contexts, ensure_ascii=False)

    @staticmethod
    def _user_prompt(request: AssistantRequest, context_text: str) -> str:
        return (
            f"Requested language: {request.language}\n"
            f"Tourist question: {request.message}\n"
            f"Verified local context: {context_text}"
        )
