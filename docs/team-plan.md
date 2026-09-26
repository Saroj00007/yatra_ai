# YatraAI Two-Person Team Plan

The team should work across one shared API contract:

- **Person A — Backend and AI:** FastAPI, recommendation logic, guide API, prototype data, and AI integration.
- **Person B — Frontend and PWA:** Next.js screens, camera experience, offline SOS, browser storage, and visual polish.

This split lets both people work in parallel while keeping each feature connected through small, predictable JSON responses.

## Person A — Backend and AI owner

### Responsibilities

- Create the `backend/` FastAPI application.
- Add `/api/health`.
- Add `places.json`, `guide.json`, and `emergency.json`.
- Implement `POST /api/recommendations`.
- Implement `POST /api/guide/chat`.
- Implement `POST /api/guide/analyze-image`.
- Implement `POST /api/sos/sync` as an optional best-effort endpoint.
- Keep AI API keys only in backend environment variables.
- Write the prompts for concise English, Nepali, and Hindi answers.
- Add fallback responses when the AI provider fails or confidence is low.
- Document how to run FastAPI and configure environment variables.

### Recommendation work

- Define the place JSON shape.
- Seed 15–25 verified Bharatpur places.
- Filter by interest, budget, traveler type, and available days.
- Return a simple itinerary with a reason for each place.
- Keep the ranking deterministic so the demo works even if the AI provider is unavailable.

### Guide work

- Define the guide response shape.
- Seed facts for a small set of supported places and objects.
- Implement text chat first.
- Add image analysis for a few known landmarks.
- Limit the AI prompt to the curated local context.

## Person B — Frontend and PWA owner

### Responsibilities

- Replace the starter Next.js page with a mobile-first home screen.
- Build the Discover, Virtual Guide, SOS, and Settings screens.
- Create shared components for cards, buttons, loading states, errors, and language selection.
- Build the API client in `lib/api.ts`.
- Build the camera capture flow for the virtual guide.
- Add text input and optional browser speech input/output.
- Add the service worker and cache the SOS route and emergency pack.
- Store emergency contacts and queued SOS events locally.
- Add `tel:` and `sms:` actions.
- Add the airplane-mode demo and visible offline state.
- Make the interface usable on a mobile phone.

### SOS work

- Keep SOS visible from the home screen.
- Load emergency data from the cached emergency pack first.
- Try browser geolocation without blocking the emergency actions.
- Save the local SOS event before attempting network sync.
- Call `/api/sos/sync` only when connectivity returns.

## Shared API contract

Person A owns the implementation. Person B uses these shapes without duplicating backend logic.

### Recommendation request

```json
{
  "days": 2,
  "budget": "medium",
  "interests": ["culture", "nature"],
  "traveler_type": "family",
  "language": "en"
}
```

### Recommendation response

```json
{
  "days": [
    {
      "day": 1,
      "places": [
        {
          "id": "bharatpur-museum",
          "name": "Bharatpur Museum",
          "reason": "Matches your culture interest and family group."
        }
      ]
    }
  ]
}
```

### Guide response

Both guide endpoints should return the same shape:

```json
{
  "title": "Bharatpur Museum",
  "summary": "A short explanation in the selected language.",
  "confidence": "high",
  "suggested_questions": ["What should I see here?"]
}
```

### Error response

```json
{
  "error": "human_readable_error",
  "message": "The guide is temporarily unavailable."
}
```

The frontend should show a useful message and allow the tourist to retry. It should not expose stack traces or provider errors.

## Parallel work order

### First session

Person A:

- Create the FastAPI skeleton.
- Add the JSON data files.
- Implement health and recommendation endpoints.

Person B:

- Build the mobile home screen.
- Create the navigation and feature routes.
- Add the recommendation form using mocked response data.

### Second session

Person A:

- Implement guide chat and image endpoints.
- Add AI prompts and fallback behavior.

Person B:

- Connect the recommendation screen to FastAPI.
- Build the guide chat and camera UI.

### Third session

Person A:

- Add SOS sync and finalize emergency data.
- Test all API responses and provider failure behavior.

Person B:

- Build offline SOS caching, contacts, location, call, and SMS actions.
- Test the SOS flow in airplane mode.

### Final session

Both people:

- Test the three complete flows on the same phone.
- Fix integration issues and loading states.
- Seed the exact places used in the presentation.
- Prepare a two-minute demo script.

## Integration rules

- Person A does not change frontend components without coordinating with Person B.
- Person B does not invent a different API response shape in the frontend.
- Keep commits focused by feature.
- Merge or integrate at the end of each working session.
- Test against the same local FastAPI URL before presenting.
- Keep one known-good demo path working at all times.

## Definition of done

The team is ready to present when:

1. Recommendation form → FastAPI → itinerary cards works.
2. Guide text question → FastAPI → multilingual answer works.
3. Camera image → FastAPI → supported place summary works.
4. Airplane mode → cached SOS screen → emergency actions works.
5. A provider failure shows a friendly fallback instead of breaking the app.
