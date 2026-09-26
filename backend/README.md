# YatraAI backend

## Local setup

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example .env
uvicorn backend.main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/api/health` to verify the API.

The API runs in fallback mode until `AI_BASE_URL` and `AI_MODEL` are configured. Hosted OpenAI requests also require `AI_API_KEY`; local OpenAI-compatible servers may leave it empty. Keep the API key in the backend `.env` file only; never use a `NEXT_PUBLIC_*` variable for it.

## API smoke tests

Text chat:

```bash
curl -X POST http://127.0.0.1:8000/api/guide/chat \
  -H 'Content-Type: application/json' \
  -d '{"question":"What can I visit near Bharatpur?","language":"en"}'
```

Image analysis:

```bash
curl -X POST http://127.0.0.1:8000/api/guide/analyze-image \
  -F 'image=@/absolute/path/to/landmark.jpg' \
  -F 'question=What is this place?' \
  -F 'language=en'
```

The canonical route names are `/api/assistant/chat` and `/api/assistant/analyze-image`. The `/api/guide/*` routes are aliases for the current Next.js frontend.

## Runtime behavior

- If the configured provider returns a valid structured answer, the API returns it after validating and grounding its source IDs.
- If the provider times out, returns an error, or returns malformed JSON, the API returns a deterministic local answer instead of exposing the provider error.
- Image uploads are limited to 5 MiB and checked against JPEG, PNG, or WebP file signatures. Images are processed in memory and are not stored.
- This prototype has no authentication or rate limiter. Keep the API private during the hackathon and add both before public deployment.
