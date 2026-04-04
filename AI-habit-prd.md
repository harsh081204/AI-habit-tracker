# Project Architecture — AI Journaling SaaS

## Overview

This is a journaling SaaS application where users write their daily logs in natural language. An AI layer parses the input, extracts structured entities (activities, people, skills, mood, etc.), generates a readable journal narrative, and saves everything to a database. The product has a Notion-like free-text editor, autosave, user authentication, and a profile page with journal statistics.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js (React) | SSR for homepage SEO + CSR for app pages |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent SaaS UI |
| Rich Text Editor | TipTap | Notion-like block editor, React-native |
| API Server | Go | Scalable, handles all auth + DB writes |
| AI Processor | Python (FastAPI) | LLM/AI ecosystem lives in Python |
| LLM | Groq (llama-3.3-70b-versatile) | Fast inference, structured JSON output |
| Database | MongoDB | Single instance, two collections |
| Auth | JWT stored in HttpOnly cookies | Stateless, XSS-safe |

---

## Repository Structure

```
/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Homepage (public)
│   │   ├── login/page.tsx     # Login page (public)
│   │   ├── signup/page.tsx    # Signup page (public)
│   │   ├── journal/
│   │   │   ├── page.tsx       # Journal editor + entry list
│   │   │   └── [id]/page.tsx  # Single journal entry view
│   │   └── profile/page.tsx   # User profile + stats
│   ├── components/            # Shared UI components
│   ├── lib/                   # API client, auth helpers
│   └── middleware.ts          # Next.js route protection
│
├── backend-go/                # Go API server
│   ├── main.go
│   ├── middleware/
│   │   └── auth.go            # JWT verification + userId injection
│   ├── handlers/
│   │   ├── auth.go            # Signup, login, logout
│   │   ├── journal.go         # Journal CRUD
│   │   └── profile.go        # User info + stats
│   ├── models/
│   │   ├── user.go
│   │   └── journal.go
│   ├── db/
│   │   └── mongo.go           # MongoDB connection + collection accessors
│   └── services/
│       └── python_bridge.go   # HTTP client that calls Python processor
│
└── backend-python/            # Python AI processor (internal only)
    ├── main.py                # FastAPI app — single /process endpoint
    ├── ai_processer.py        # Groq LLM call + ParsedJournal model
    ├── journal_service.py     # Narrative text generator (template-based)
    └── database.py            # REMOVED from Python — Go owns all DB writes
```

---

## Services

### 1. Go API Server (Port 8080 — public facing)

Handles all user-facing requests. Every protected route runs through JWT middleware that extracts `userId` from the cookie and injects it into the request context. Handlers never accept `userId` from the request body — it always comes from the verified JWT.

Responsibilities:
- User signup and login (issues JWT, sets HttpOnly cookie)
- Logout (clears cookie)
- Autosave draft journal entries to MongoDB
- On submit: call Python processor → receive structured data → save full entry to MongoDB
- Fetch user's journal entries (always filtered by authenticated userId)
- Fetch user profile and journal stats

### 2. Python AI Processor (Port 8000 — internal only, never exposed to internet)

A pure processing service. It receives raw text, calls the Groq LLM, parses the response into a typed `ParsedJournal` object, generates a narrative journal text, and returns both to the caller (Go). It does NOT connect to MongoDB. It does NOT know about users.

Single endpoint:
```
POST /process
Body: { "raw_text": "string", "user_profile": "string | null" }
Returns: { "parsed": ParsedJournal, "journal_text": "string" }
```

### 3. Next.js Frontend (Port 3000)

Public pages (homepage, login, signup) are server-side rendered for SEO. App pages (journal, profile) are client-side rendered React. Route protection is handled by Next.js middleware — unauthenticated users are redirected to `/login`.

---

## Data Flow

### Autosave (while user is typing)
```
User types in TipTap editor
→ Debounced 2 seconds after last keystroke
→ Frontend: PATCH /api/journal/:id  (or POST /api/journal if first save)
→ Go middleware: verify JWT, extract userId
→ Go: save { user_id, raw_text, status: "draft", updated_at } to MongoDB
→ Return { _id } so frontend has the document ID for subsequent PATCHes
```

### Submit (user hits Submit button)
```
User hits Submit
→ Frontend: POST /api/journal/:id/submit
→ Go middleware: verify JWT, extract userId
→ Go: call Python processor POST http://localhost:8000/process { raw_text, user_profile }
→ Python: LLM parses → extracts entities → generates narrative → returns JSON
→ Go: update MongoDB document {
     status: "processed",
     parsed: { ... },
     journal_text: "...",
     updated_at: now
   }
→ Return full processed document to frontend
→ Frontend: replace editor view with rendered journal entry
```

### Auth Flow
```
Signup: POST /api/auth/signup { name, email, password }
→ Go: hash password (bcrypt) → save to users collection → issue JWT → set HttpOnly cookie
→ Redirect to /journal

Login: POST /api/auth/login { email, password }
→ Go: verify password hash → issue JWT → set HttpOnly cookie
→ Redirect to /journal

Every protected request:
→ Go middleware reads JWT from cookie
→ Verifies signature and expiry
→ Injects userId into request context
→ Handler uses ctx.userId — never trusts request body for userId
```

---

## MongoDB Collections

### `users` collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique, indexed)",
  "password_hash": "string (bcrypt)",
  "inferred_profile": "string | null",
  "avatar_url": "string | null",
  "created_at": "ISODate"
}
```

### `journals` collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users, indexed)",
  "status": "draft | processed",
  "raw_text": "string",
  "parsed": {
    "meta": {
      "input_mode": "end_of_day",
      "inferred_profile": "cs_student | software_engineer | ...",
      "mood": "happy | productive | tired | ...",
      "productivity_score": 0.8,
      "date": "YYYY-MM-DD"
    },
    "entries": [
      {
        "type": "study | coding | gym | social | sleep | food | leisure | work | travel | habit",
        "status": "done | pending | maybe",
        "time_hint": "morning | afternoon | evening | night | null",
        "duration_mins": 120,
        "data": {}
      }
    ],
    "skills_touched": [{ "name": "string", "subtopic": "string | null" }],
    "people_met": ["string"],
    "places_visited": ["string"]
  },
  "journal_text": "string (LLM-generated narrative)",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

Important indexes to create:
- `journals`: compound index on `{ user_id: 1, created_at: -1 }` for efficient per-user listing
- `users`: unique index on `email`

---

## Go API — Route Map

All routes under `/api`. Routes marked [AUTH] require a valid JWT cookie — the middleware will return 401 if missing or invalid.

```
POST   /api/auth/signup              → create user, issue JWT cookie
POST   /api/auth/login               → verify credentials, issue JWT cookie
POST   /api/auth/logout              → clear JWT cookie

POST   /api/journal                  [AUTH] → create draft entry, return { _id }
PATCH  /api/journal/:id              [AUTH] → update draft raw_text (autosave)
POST   /api/journal/:id/submit       [AUTH] → trigger Python processing, save result
GET    /api/journal                  [AUTH] → list user's entries (paginated, sorted by created_at desc)
GET    /api/journal/:id              [AUTH] → get single entry by id

GET    /api/profile                  [AUTH] → user info + journal stats
PATCH  /api/profile                  [AUTH] → update name, avatar_url
```

Go middleware pseudocode:
```go
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        cookie, err := r.Cookie("token")
        // if err → 401
        claims, err := verifyJWT(cookie.Value)
        // if err → 401
        ctx := context.WithValue(r.Context(), "userId", claims.UserID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Inside any handler:
userId := r.Context().Value("userId").(string)
// Use userId in every MongoDB query — never from request body
```

---

## Python Processor — Changes Required

The existing Python code saves to MongoDB directly inside `journal_service.py`. This must be removed. The refactored Python service should:

1. Expose a single FastAPI endpoint: `POST /process`
2. Accept `{ raw_text, user_profile }` in request body
3. Call the Groq LLM via `parse_journal_input()` — no changes needed here
4. Call `_build_journal_text()` to generate narrative — no changes needed here
5. Return `{ parsed, journal_text }` as JSON response
6. Remove all MongoDB imports, `journals_col()` calls, and `insert_one()` calls from `journal_service.py`
7. Remove the `user_id` parameter from `create_journal_entry()` — Python doesn't need it
8. Add a simple API key header check so only Go can call this endpoint (e.g. `X-Internal-Key`)

The `database.py` and its Motor client can be deleted entirely from the Python service.

---

## Frontend Pages

### `/` — Homepage (SSR, public)
- Marketing page: product intro, features, how it works, CTA buttons
- Built with Next.js SSG for best SEO performance
- Links to `/signup` and `/login`

### `/login` and `/signup` — Auth Pages (public)
- Simple forms, no rich components needed
- On success: server sets HttpOnly JWT cookie, redirect to `/journal`
- On error: show inline validation messages

### `/journal` — Journal Editor (CSR, protected)
Layout: two-column
- Left sidebar: list of past journal entries (title = date, preview of journal_text), sorted newest first
- Right main area: TipTap editor

Editor behavior:
- New entry: blank editor on load
- Typing triggers autosave (debounced 2s) via PATCH
- Submit button: sends to Go → shows loading state → replaces editor with rendered entry view
- Rendered entry: displays `journal_text` + parsed data cards (mood, productivity score, skills, people met)

### `/journal/[id]` — Single Entry View (CSR, protected)
- Read-only view of a processed journal entry
- Shows: date, journal_text narrative, entity cards (entries list, skills, people, places, mood chip, productivity score bar)

### `/profile` — Profile Page (CSR, protected)
- Section A — User Info: name, email, avatar, member since date
- Section B — Journal Stats:
  - Total entries
  - Current streak (consecutive days with a processed entry)
  - Most productive day of week (derived from productivity_score)
  - Top skills touched (ranked by frequency across all entries)
  - Mood distribution (chart of mood frequency)
  - Word count over time (simple line chart)

Stats are computed by Go by aggregating the journals collection filtered by userId.

---

## Environment Variables

### Go (`backend-go/.env`)
```
MONGO_URI=mongodb+srv://...
MONGO_DB_NAME=your_db_name
JWT_SECRET=a_long_random_secret
PYTHON_SERVICE_URL=http://localhost:8000
PYTHON_INTERNAL_KEY=some_shared_secret
PORT=8080
```

### Python (`backend-python/.env`)
```
GROQ_API_KEY=your_groq_key
INTERNAL_KEY=some_shared_secret   # must match Go's PYTHON_INTERNAL_KEY
PORT=8000
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Deployment (Development)

Run all three services locally:

```bash
# Terminal 1 — Python processor
cd backend-python
pip install -r requirements.txt
uvicorn main:app --port 8000

# Terminal 2 — Go API
cd backend-go
go run main.go

# Terminal 3 — Next.js
cd frontend
npm install
npm run dev
```

Python runs on `:8000` (internal), Go on `:8080` (public), Next.js on `:3000`.

---

## Security Rules (Non-Negotiable)

1. **userId always comes from JWT, never from request body or query params.** Go middleware injects it. Handlers read it from context.
2. **Every MongoDB query on `journals` must include a `user_id` filter** equal to the authenticated userId. No exceptions.
3. **Python processor is never exposed to the internet.** It binds to `localhost:8000` only. Go is the only caller.
4. **Passwords are hashed with bcrypt** before storage. Never log or return password hashes.
5. **JWT is stored in an HttpOnly, Secure, SameSite=Strict cookie.** Never in localStorage.
6. **CORS in Go must whitelist only the frontend origin** (not `*`) in production.
7. **Python validates the `X-Internal-Key` header** on every request and returns 403 if missing or wrong.

---

## Build Order (Recommended)

Build in this sequence so each layer has something to integrate against:

1. **Python refactor** — strip DB writes, expose `POST /process`, add internal key check
2. **Go: MongoDB connection + users collection + auth routes** (signup, login, logout)
3. **Go: JWT middleware**
4. **Go: journal routes** (create draft, autosave, submit, list, get)
5. **Go: Python bridge service** (HTTP client calling Python processor)
6. **Go: profile route + stats aggregation**
7. **Next.js: auth pages** (login, signup) wired to Go
8. **Next.js: journal editor** (TipTap + autosave + submit flow)
9. **Next.js: journal entry view**
10. **Next.js: profile page**
11. **Next.js: homepage** (marketing, built last)

---

## Key Decisions & Rationale

| Decision | Choice | Why |
|---|---|---|
| Go owns all DB writes | Yes | Single audit point, userId always injected by middleware |
| Python talks to DB | No | Bypasses auth layer, creates two write paths |
| REST vs GraphQL | REST | Simpler, Go ecosystem excellent, sufficient for this use case |
| Go ↔ Python transport | HTTP (JSON) | Simple, debuggable, language agnostic, gRPC later if needed |
| Session strategy | Stateless JWT | No session DB needed, Go verifies signature on every request |
| Editor library | TipTap | React-native, Notion-like blocks, actively maintained |
| Autosave strategy | Debounce 2s, PATCH same document | Avoids creating duplicate drafts |
| `status` field on journal | `draft` or `processed` | Frontend knows whether to show editor or rendered entry |