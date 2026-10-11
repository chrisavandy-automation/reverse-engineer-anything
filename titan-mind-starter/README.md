# Titan Mind — starter

A rebuild scaffold of `mind.titanmastermind.com`: a private, password-gated **RAG
app** over a mastermind's call archive. Ask a question → it retrieves relevant
sessions → streams a synthesized, cited answer.

Reverse-engineered stack, reproduced here: **Next.js (App Router) + React 19 +
Tailwind v4**, a shared-password **cookie-session gate**, and a custom
**Server-Sent Events** `/api/chat` endpoint that streams `sources → delta → done`
(the exact protocol the real app uses), answered by **Claude** (`claude-opus-5-5`).

## Run it

```bash
cp .env.example .env.local      # set ACCESS_PASSWORD + SESSION_SECRET
npm install
npm run dev                     # http://localhost:3000
```

Log in with the `ACCESS_PASSWORD` you set. It runs **with no external services**:
retrieval uses the in-memory seed archive (`src/lib/data.ts`) and `/api/chat`
streams a canned answer. Set `ANTHROPIC_API_KEY` to get real answers from Claude.

## The `/api/chat` contract (matches the original)

Request: `POST /api/chat` → `{ "messages": [{ "role": "user", "content": "…" }], "mode": "detailed" | "fast" }`

Response: `text/event-stream`
```
event: sources
data: [ { id, title, memberName, sessionDate, thumbnailUrl, tags:[{name,slug}] }, … ]

event: delta
data: " token"          ← one JSON-encoded string per token (many)

event: done
data: true
```

## Map of the code

| Path | Role |
|---|---|
| `src/middleware.ts` | Gate — redirects unauthenticated requests to `/login?next=…` |
| `src/lib/session.ts` | Signed HttpOnly cookie (Web Crypto HMAC) |
| `src/app/api/auth/{login,logout}` | Password check → set/clear cookie |
| `src/app/api/chat/route.ts` | **The engine** — retrieve → SSE `sources`/`delta`/`done`, streamed from Claude |
| `src/lib/retrieval.ts` | Retrieval (in-memory now; pgvector schema + query in the comment) |
| `src/lib/data.ts` | Seed archive + example prompts |
| `src/app/ask-experience.tsx` | Composer: mode toggle, mic (Web Speech API), SSE parsing, source cards |
| `src/app/library/page.tsx` | Browse the archive, filter by tag slug |

## Going to production

1. **Postgres + pgvector** — swap the in-memory `retrieve()` for the SQL in
   `src/lib/retrieval.ts` (schema + similarity query included). Railway has managed Postgres.
2. **Ingestion pipeline** — transcribe recordings → chunk (~800 tokens, overlap) →
   embed → insert; flag rows `processing`/`ready` (drives the "still processing" state).
3. **Object storage** — put thumbnails in a bucket (Vercel Blob / UploadThing / S3)
   and add its host to `next.config.ts` `images.remotePatterns`.
4. **Deploy** — Railway (Next.js service + Postgres plugin) or Vercel; set env vars.

> Models: uses `claude-opus-5-5` with adaptive thinking; `detailed` runs higher
> effort + deeper retrieval, `fast` runs lower. Tune in `src/app/api/chat/route.ts`.
