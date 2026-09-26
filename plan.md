# YatraAI Assistant MVP Plan

## Goal

Build a lightweight multilingual AI tourism assistant for the hackathon. The first prototype will answer tourism questions and analyze a tourist's camera image. It will support English, Nepali, and Hindi.

Voice will use the browser's speech recognition and speech synthesis. The backend will receive the transcribed text through the normal chat endpoint, so we do not need a separate audio model or audio API in the first prototype.

## Scope for the first prototype

### Included

- Text questions about Bharatpur and nearby tourism.
- Camera image analysis with an optional question.
- English, Nepali, and Hindi responses.
- Local tourism context stored in JSON.
- Structured answers with confidence and suggested follow-up questions.
- Cultural significance and historical context for place-related questions.
- Fallback answers when the AI provider is unavailable.
- Compatibility with the frontend routes already used by the project.

### Deferred

- Itinerary recommendation.
- User accounts and authentication.
- Database and vector database.
- Live maps, weather, and real-time tourism data.
- Separate speech-to-text or text-to-speech backend services.
- Model fine-tuning and complex agent workflows.

## Architecture

```text
Next.js
  ├── Text input
  ├── Camera capture
  ├── Browser speech-to-text
  └── Browser text-to-speech
          |
          v
FastAPI
  ├── Request validation
  ├── Tourism context loader
  ├── Prompt builder
  ├── AI provider adapter
  ├── Response validator
  └── Local fallback provider
          |
          v
Local tourism_context.json + configurable vision-capable model
```

## Model decision

For the first prototype we will use **`gpt-4o-mini`** through an OpenAI-compatible chat-completions API because one model can handle both text and image input, which keeps the integration small.

The provider is configurable. If the team later chooses a self-hosted or another compatible vision model, only environment variables should change; route and frontend contracts should remain the same.

When no provider is configured, the local fallback provider will answer from the tourism JSON so the demo can still run locally.

## Environment variables

Create a local `.env` file from `backend/.env.example`.

```env
# FastAPI
APP_NAME=YatraAI API
DEBUG=false

# Next.js development origin
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# AI provider
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=replace_with_your_key
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_SECONDS=45

# Upload safety limit: 5 MiB
MAX_IMAGE_BYTES=5242880
```

`AI_API_KEY` may be empty during local fallback development. It must never be placed in a `NEXT_PUBLIC_*` variable or exposed to the browser.

## API contract

### Text question

```http
POST /api/assistant/chat
POST /api/guide/chat
```

```json
{
  "message": "What can I visit near Bharatpur?",
  "language": "en",
  "conversation": [],
  "context_id": null
}
```

The `question` field will also be accepted as an alias for `message` because the current frontend uses that name.

### Image question

```http
POST /api/assistant/analyze-image
POST /api/guide/analyze-image
```

Multipart fields:

- `image`: JPEG, PNG, or WebP image.
- `question`: optional question about the image.
- `language`: `en`, `ne`, or `hi`.
- `context_id`: optional known tourism topic.

### Response shape

```json
{
  "title": "Chitwan National Park",
  "summary": "...",
  "cultural_significance": "...",
  "historical_context": "...",
  "confidence": "high",
  "source_ids": ["chitwan-national-park"],
  "nearby": ["narayani-river"],
  "safety_tip": "...",
  "suggested_questions": ["..."]
}
```

## Delivery steps

### Step 1 — Backend foundation

Status: **complete**

- Create the FastAPI package.
- Add settings and environment loading.
- Add CORS for the Next.js development server.
- Add `GET /api/health`.
- Add dependency requirements and setup documentation.

Done: the API imports successfully, compiles, and `GET /api/health` returns `200` in fallback mode.

### Step 2 — Tourism context and fallback

Status: **complete**

- Add the first verified Bharatpur tourism records.
- Add keyword-based context selection.
- Add a local fallback answer provider.

Done: five Bharatpur context records, keyword search, multilingual fallback responses, and fallback tests are working without a remote API call.

### Step 3 — Text assistant

Status: **complete**

- Add request and response schemas.
- Add the provider adapter.
- Add `/api/assistant/chat` and `/api/guide/chat`.
- Validate and normalize model output.

Done: the configured OpenAI-compatible provider, deterministic fallback, structured output validation, and both assistant and frontend-compatible chat routes are implemented and tested.

### Step 4 — Frontend integration check

Status: **in progress**

- Connect the current scan page to the API.
- Verify loading, errors, and fallback behavior.
- Verify English, Nepali, and Hindi requests.

Progress: the scan page now uses the FastAPI API client instead of sending relative requests to the Next.js server. Browser verification remains.

Done when the text demo works from the browser.

### Step 5 — Vision assistant

Status: **complete**

- Validate image type and size.
- Add `/api/assistant/analyze-image` and `/api/guide/analyze-image`.
- Send image plus local context to the vision model.
- Return the same response shape as text chat.

Done: both vision route aliases validate uploads, send image data to the configured provider, return the shared response schema, and fall back safely.

### Step 6 — Voice demo and hardening

Status: **in progress**

- Verify browser speech-to-text with the chat endpoint.
- Verify browser speech synthesis.
- Add tests for provider failure, invalid images, and malformed model output.
- Prepare three repeatable presentation scenarios.

Progress: backend provider failure, malformed output, invalid image, file signature, and fallback tests are complete. Browser voice rehearsal remains frontend work.

Done when the complete text, voice, and camera demo can run reliably.

## Team split

### Backend and AI owner

- FastAPI implementation.
- Context data and prompt rules.
- Model provider integration.
- Structured output validation.
- Backend tests and demo data.

### Frontend owner

- Assistant screen and conversation states.
- Camera permissions and capture UX.
- Browser voice controls.
- API loading and error states.
- Mobile polish and presentation flow.

### Shared

- Verify Bharatpur facts.
- Choose the prepared landmark image.
- Test all three languages.
- Rehearse the final demo.

## Definition of done

- A text question returns a Bharatpur-focused answer.
- A camera image returns a tourism explanation.
- The assistant works in English, Nepali, and Hindi for prepared examples.
- The response has a confidence value and does not expose provider secrets.
- The fallback works without an AI key.
- The existing frontend routes continue to work.
