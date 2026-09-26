# YatraAI Two-Person Team Plan

The team will build two deeply polished features:

1. A Bharatpur-focused AI tourism assistant.
2. An offline-friendly emergency mode.

The itinerary recommendation system is out of scope for this prototype.

## Person A — Backend and AI owner

### Main responsibility

Own the FastAPI service, local tourism data, AI integration, and assistant behavior.

### Work items

- Create the `backend/` FastAPI application.
- Add `GET /api/health`.
- Add `tourism_context.json` with five to eight verified Bharatpur examples and common tourism topics.
- Add `emergency.json` with verified emergency information.
- Implement `POST /api/assistant/chat`.
- Implement `POST /api/assistant/analyze-image`.
- Implement `GET /api/emergency-pack`.
- Implement `POST /api/sos/sync` as best-effort telemetry.
- Keep AI API keys in backend environment variables.
- Write prompts for concise English, Nepali, and Hindi answers to broad tourism questions.
- Add confidence and fallback behavior when the AI provider fails.
- Document FastAPI setup and environment variables.

### Assistant quality goals

- Use curated Bharatpur context for local factual claims.
- Answer general tourism questions through the AI model.
- Support text, voice-to-text, and image input.
- Support only a small set of local places and objects for high-confidence vision results.
- Prevent invented emergency numbers, historical facts, or locations.
- Return one stable response shape for text and image requests.
- Include nearby suggestions only from verified local data.

## Person B — Frontend and PWA owner

### Main responsibility

Own the Next.js mobile experience, camera interaction, offline behavior, and SOS actions.

### Work items

- Replace the starter page with a mobile-first home screen.
- Build the AI Tourism Assistant screen.
- Build the SOS screen.
- Build the Settings screen for language and emergency contacts.
- Create the API client in `lib/api.ts`.
- Build camera capture and image preview.
- Add text input, browser voice input, and speech output.
- Display assistant answers, confidence, nearby suggestions, and fallback states.
- Add a service worker to cache the SOS route and emergency pack.
- Store contacts and SOS events in IndexedDB.
- Add geolocation, `tel:`, and `sms:` actions.
- Add a visible online/offline indicator.
- Make the main actions usable with one hand on a phone.

### SOS quality goals

- SOS is reachable immediately from the home screen.
- Emergency information loads locally before any network request.
- Location lookup never blocks the call or SMS actions.
- The SOS event is saved locally before sync is attempted.
- The airplane-mode flow is tested on the actual presentation device.

## Shared API contract

Person A owns the implementation. Person B uses these shapes without creating a second format.

### Assistant chat request

```json
{
  "message": "What is special about this place?",
  "language": "ne",
  "context_id": "bharatpur-museum"
}
```

### Assistant image request

`POST /api/assistant/analyze-image` accepts:

- Compressed image.
- Optional question.
- Selected language.
- Optional browser location.

### Assistant response

Both guide endpoints return:

```json
{
  "title": "Bharatpur Museum",
  "summary": "A short answer in the selected language.",
  "confidence": "high",
  "nearby": [
    {
      "id": "nearby-place-id",
      "name": "Nearby place",
      "reason": "Why it is relevant"
    }
  ],
  "suggested_questions": ["What should I see here?"]
}
```

### Error response

```json
{
  "error": "assistant_unavailable",
  "message": "The AI assistant is temporarily unavailable. Please try again."
}
```

The frontend shows the message and retry action. It does not show provider errors or stack traces.

## Parallel work order

### Session 1 — Working skeleton

Person A:

- Create the FastAPI skeleton and health endpoint.
- Create the first `tourism_context.json` and `emergency.json` files.
- Implement a mock `/api/assistant/chat` response.

Person B:

- Build the home screen and navigation.
- Build the assistant screen with mocked assistant data.
- Build the SOS screen layout.

Shared checkpoint:

- Agree on the guide response JSON before replacing mock data.

### Session 2 — Text guide

Person A:

- Connect `/api/assistant/chat` to the curated context and AI provider.
- Add language handling and fallback behavior.

Person B:

- Connect the assistant screen to FastAPI.
- Add loading, retry, confidence, and empty states.
- Add language switching.

Shared checkpoint:

- Test the same question in English, Nepali, and Hindi.

### Session 3 — Camera guide and SOS

Person A:

- Implement `/api/assistant/analyze-image`.
- Finalize emergency data and `/api/sos/sync`.
- Test provider failure and low-confidence responses.

Person B:

- Add camera capture, image preview, voice input, and speech output.
- Add service worker caching.
- Add contacts, geolocation, call, SMS, and local event storage.

Shared checkpoint:

- Test image analysis online and SOS in airplane mode.

### Session 4 — Proof and presentation

Both people:

- Test the three supported languages.
- Verify every fact used in the demo.
- Test with a provider failure and no internet.
- Improve mobile layout and accessibility.
- Prepare one two-minute story and one backup demo path.

## Integration rules

- Person A owns API response shapes.
- Person B owns frontend interaction and presentation behavior.
- Keep guide data and emergency data small and reviewable.
- Do not add a new feature unless the two required flows already work.
- Keep commits focused by guide, SOS, data, or polish.
- Run both apps locally before merging work.
- Keep a known-good demo path working after every session.

## What will make the project stand out

### 1. Bharatpur-specific knowledge

Use local names, verified cultural facts, practical visitor tips, and a few examples that generic chatbots do not answer well. Let the AI answer broad tourism questions while grounding local claims in verified context.

### 2. Multilingual interaction

Let judges ask the same question by text and voice in English, Nepali, and Hindi. Add voice output if it is stable on the presentation device.

### 3. Real offline proof

Turn on airplane mode during the demo and show that SOS still opens, emergency data is visible, location is attempted, and call/SMS actions remain available.

### 4. Trustworthy AI behavior

Show confidence and a clear fallback for unknown images. Keep the answer short and grounded in the team’s verified data.

### 5. Simple human-centered UX

Use large buttons, minimal typing, a visible SOS button, short answers, and one obvious next action on every screen.

### 6. One connected story

1. The tourist asks a tourism question or shows a Bharatpur landmark.
2. The AI assistant explains it in the tourist’s language and voice.
3. The assistant suggests one or two nearby experiences.
4. The tourist loses internet access.
5. SOS still provides emergency help.

## Demo definition of done

The team is ready to present when:

1. A broad tourism question returns a concise answer.
2. A voice question returns a text or spoken answer.
3. A supported landmark photo returns a summary and confidence state.
4. The assistant works in English, Nepali, and Hindi.
5. SOS opens and displays emergency information with airplane mode enabled.
6. Call and prepared SMS actions are available from the offline screen.
7. Provider failure produces a friendly fallback instead of breaking the app.
