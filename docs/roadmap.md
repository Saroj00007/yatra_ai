# YatraAI Build Roadmap

## 1. Goal

Build a focused AI tourism assistant for Bharatpur with two connected features:

1. **AI Tourism Assistant:** accepts text, voice, and camera input and answers tourism questions.
2. **Offline SOS:** provides emergency information and call/SMS actions without depending on the internet.

The itinerary recommendation system, user accounts, live tracking, maps, weather, and admin dashboard are outside this prototype.

## 2. Locked prototype decisions

- Next.js is the frontend.
- FastAPI is the backend.
- You own the backend and AI integration.
- Your teammate owns the Next.js interface and PWA behavior.
- Local facts live in JSON files first.
- The AI provider is accessed only from FastAPI.
- Voice starts with browser speech-to-text and text-to-speech.
- No vector database, authentication, or production database for the first demo.
- The first working slice is text question → FastAPI → AI answer → Next.js display.

## 3. Work ownership

### You — Backend and AI integration

You own:

- FastAPI setup and configuration.
- AI provider adapter.
- Tourism context data and prompt design.
- Text assistant endpoint.
- Image assistant endpoint.
- Structured response validation.
- Confidence and fallback behavior.
- Emergency data API and optional SOS synchronization.
- Backend tests and integration documentation.

### Teammate — Frontend and PWA

Your teammate owns:

- Mobile-first Next.js screens.
- Text, voice, and camera interactions.
- API client and loading/error states.
- Assistant conversation display.
- Browser speech input and output.
- Service worker and offline cache.
- Emergency contacts, geolocation, call, and SMS actions.
- Mobile polish and presentation flow.

### Shared ownership

Both people own:

- Choosing and verifying Bharatpur facts.
- Deciding the supported demo scenarios.
- Testing English, Nepali, and Hindi.
- Testing with airplane mode enabled.
- Final presentation and judging story.

## 4. Milestone roadmap

### Milestone 0 — Scope and contract

**Goal:** agree on exactly what the first demo does.

You:

- Confirm the four API routes.
- Choose the initial AI model/provider.
- Define the assistant response schema.
- Create the first tourism context format.

Teammate:

- Confirm the screen list and navigation.
- Create mocked assistant responses using the agreed schema.
- Decide the camera and voice interaction states.

Shared output:

- Five supported Bharatpur examples.
- Three supported languages: English, Nepali, Hindi.
- Three scripted questions.
- One scripted image demo.
- One offline SOS scenario.

**Done when:** both people can build against the same JSON response without guessing field names.

### Milestone 1 — Backend foundation

**Owner:** You

Create:

```text
backend/
  main.py
  config.py
  routes/
    assistant.py
    sos.py
  services/
    assistant_service.py
    context_service.py
  schemas/
    assistant.py
  data/
    tourism_context.json
    emergency.json
```

Implement:

- `GET /api/health`
- Environment variable loading.
- CORS for the local Next.js app.
- Pydantic request and response models.
- A provider interface so route code does not depend on one model SDK.
- A local mock provider for development when no AI key exists.

**Done when:** FastAPI starts, health returns successfully, and the mock assistant response is valid JSON.

### Milestone 2 — Text assistant vertical slice

**Owners:** You and your teammate together

You:

- Implement `POST /api/assistant/chat`.
- Load relevant local context from `tourism_context.json`.
- Send the question, language, context, and conversation history to the model.
- Validate the model output before returning it.
- Return a friendly fallback when the provider fails.

Teammate:

- Build the assistant page.
- Add text input and submit action.
- Display answer, confidence, sources, follow-up questions, and errors.
- Add a mocked mode while the endpoint is being completed.

**Done when:** a tourist types a question and sees a Bharatpur-specific answer in the browser.

### Milestone 3 — Grounding and trust

**Owner:** You, with shared data review

Add to each local context record:

- `id`
- `topic`
- `names`
- `facts`
- `keywords`
- `nearby`
- `safety_tip`
- `source`
- `verified_at`

Add prompt rules:

- Use local context for Bharatpur-specific claims.
- Never invent emergency numbers, prices, opening hours, or historical dates.
- Explain when current information may have changed.
- Answer in the requested language.
- Keep the answer short and useful.
- Return low confidence when the evidence is weak.

**Done when:** the assistant gives reliable answers for the selected examples and has a clear response when it does not know something.

### Milestone 4 — Vision assistant

**Owner:** You for backend; teammate for frontend

You:

- Implement `POST /api/assistant/analyze-image`.
- Accept a compressed image, language, optional question, and optional location.
- Send the image and local context to the vision-capable model.
- Return the same response shape as text chat.
- Add an image-size limit and safe error handling.

Teammate:

- Add camera permission handling.
- Add capture, preview, retake, and submit states.
- Display identification confidence and fallback text.

**Done when:** the team can scan one supported Bharatpur landmark and receive a grounded explanation.

### Milestone 5 — Voice assistant

**Owner:** Teammate, with your API support

Use browser speech first:

```text
SpeechRecognition → text → /api/assistant/chat → answer → SpeechSynthesis
```

You:

- Ensure the chat endpoint accepts normal text from speech recognition.
- Keep the response short enough for audio playback.
- Add language-aware response instructions.

Teammate:

- Add microphone permission handling.
- Add listening, processing, and speaking states.
- Add replay and stop controls.
- Keep typed input available as a fallback.

**Done when:** a tourist can ask a question by voice and hear the answer in at least one reliable language on the presentation device.

### Milestone 6 — Offline SOS

**Owner:** Teammate for the client; you for optional sync

You:

- Add `GET /api/emergency-pack` for online refresh.
- Add `POST /api/sos/sync` for queued event telemetry.
- Verify emergency numbers and hospital information.

Teammate:

- Cache the SOS page and emergency pack with a service worker.
- Store contacts and SOS events in IndexedDB.
- Add geolocation without blocking emergency actions.
- Add `tel:` and `sms:` actions.
- Add a visible offline indicator.

**Done when:** SOS opens in airplane mode and displays emergency information with call and prepared SMS actions available.

### Milestone 7 — Integration and demo hardening

**Owners:** Both

- Run the frontend and backend on the presentation setup.
- Test the exact demo images and questions.
- Test AI provider failure.
- Test an unknown image.
- Test English, Nepali, and Hindi.
- Test the app with internet disabled.
- Remove unnecessary loading delays and debug output.
- Add a clear “AI may be uncertain” state.
- Verify no API keys are exposed to the browser.

**Done when:** the complete demo works three times in a row without manual repair.

## 5. API contract

### Text question

```text
POST /api/assistant/chat
```

Request:

```json
{
  "message": "What is special about this place?",
  "language": "ne",
  "context_id": "bharatpur-museum",
  "conversation": []
}
```

### Image question

```text
POST /api/assistant/analyze-image
```

Request: multipart form containing a compressed image, language, optional question, and optional location.

### Shared assistant response

```json
{
  "title": "Bharatpur Museum",
  "summary": "A concise answer in the selected language.",
  "confidence": "high",
  "source_ids": ["bharatpur-museum-001"],
  "nearby": [],
  "safety_tip": "Follow site instructions.",
  "suggested_questions": ["What should I see here?"]
}
```

### Error response

```json
{
  "error": "assistant_unavailable",
  "message": "The assistant is temporarily unavailable. Please try again."
}
```

## 6. Demo story

The presentation should follow one tourist journey:

1. The tourist opens YatraAI without signing in.
2. The tourist points the camera at a Bharatpur landmark.
3. The assistant explains its cultural importance.
4. The tourist asks a follow-up question by voice.
5. The assistant answers in Nepali or Hindi.
6. The assistant shows a safety tip and one nearby experience.
7. Internet access is disabled.
8. The tourist opens SOS and still sees emergency information and call/SMS actions.

## 7. What makes the prototype competitive

- Bharatpur-specific, verified knowledge.
- Text, voice, and camera in one conversation.
- English, Nepali, and Hindi support.
- Confidence and source information.
- Honest fallback for unknown images.
- Live proof of offline SOS.
- A simple mobile experience with no account setup.

## 8. Scope guard

Do not add these before the complete flow works:

- Itinerary recommendations.
- User accounts.
- Human guide marketplace or verification.
- Live maps, weather, or crowd APIs.
- Background tracking.
- Vector databases or complex RAG.
- Admin dashboards.
- Model fine-tuning.

## 9. Completion checklist

- [ ] FastAPI health endpoint works.
- [ ] Text assistant works with mock provider.
- [ ] Text assistant works with the real provider.
- [ ] Local Bharatpur context is grounded and sourced.
- [ ] Vision endpoint works for selected demo images.
- [ ] Voice input and output work on the presentation device.
- [ ] SOS works in airplane mode.
- [ ] Call and prepared SMS actions work.
- [ ] Provider and network failures have friendly fallbacks.
- [ ] Final demo works repeatedly.
