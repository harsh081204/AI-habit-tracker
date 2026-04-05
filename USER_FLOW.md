# User Flow & Architecture Communication

> How Next.js, Go, and Python talk to each other — step by step, for every user action.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [How the Three Services Relate](#how-the-three-services-relate)
3. [Flow 1 — Signup](#flow-1--signup)
4. [Flow 2 — Login](#flow-2--login)
5. [Flow 3 — Loading the Journal Page](#flow-3--loading-the-journal-page)
6. [Flow 4 — Writing & Autosave](#flow-4--writing--autosave)
7. [Flow 5 — Submitting an Entry](#flow-5--submitting-an-entry)
8. [Flow 6 — Viewing a Past Entry](#flow-6--viewing-a-past-entry)
9. [Flow 7 — Loading the Profile Page](#flow-7--loading-the-profile-page)
10. [Flow 8 — Editing Profile](#flow-8--editing-profile)
11. [Flow 9 — Logout](#flow-9--logout)
12. [Flow 10 — Session Expiry Mid-Session](#flow-10--session-expiry-mid-session)
13. [How Auth Works on Every Request](#how-auth-works-on-every-request)
14. [Error Handling Reference](#error-handling-reference)
15. [What Each Service Never Does](#what-each-service-never-does)

---

## System Overview

```
Browser (Next.js :3000)
        │
        │  All API calls via fetch()
        │  Cookie: token=<JWT> sent automatically
        ▼
Go API Server (:8080)   ◄── public facing, handles everything
        │
        │  Only on journal submit
        │  POST http://localhost:8000/process
        │  Header: X-Internal-Key: <secret>
        ▼
Python Processor (:8000) ◄── internal only, never exposed to internet
        │
        │  Returns { parsed, journal_text }
        │  No DB access
        ▼
        Go saves result to MongoDB

MongoDB
  collections: users, journals
```

**Ports at a glance**

| Service    | Port | Exposed to internet? |
|------------|------|----------------------|
| Next.js    | 3000 | Yes (or via CDN)     |
| Go API     | 8080 | Yes                  |
| Python     | 8000 | No — localhost only  |
| MongoDB    | 27017| No — internal only   |

---

## How the Three Services Relate

```
Next.js  →  Go  →  MongoDB       (every protected action)
Next.js  →  Go  →  Python  →  Go  →  MongoDB  (journal submit only)
```

**Next.js** is responsible for:
- Rendering all pages (SSG for homepage, CSR for journal/profile)
- Running `middleware.ts` which reads the JWT cookie and redirects if missing
- Showing all UI states: loading, error, success, processing animation
- Debouncing autosave (2 seconds after last keystroke)
- Cancelling the autosave timer when user hits Submit

**Go** is responsible for:
- Verifying the JWT on every protected request
- Injecting `userId` into every request context — handlers never read userId from the request body
- All MongoDB reads and writes
- Calling Python when a journal entry is submitted
- Merging the Python result with userId and saving to MongoDB
- Returning structured JSON errors so Next.js can handle them cleanly

**Python** is responsible for:
- Receiving `{ raw_text, user_profile }` and nothing else
- Calling the Groq LLM
- Returning `{ parsed, journal_text }` and nothing else
- It does NOT know about users, sessions, or MongoDB

---

## Flow 1 — Signup

**User action:** Fills in name, email, password on `/signup` and clicks "Create account"

```
Step 1   Browser
         └─ Validates form locally (name not empty, email format, password >= 8 chars)
         └─ If invalid: shows inline errors, stops here

Step 2   Browser → Go
         POST http://localhost:8080/api/auth/signup
         Content-Type: application/json
         Body: { "name": "Rahul Kumar", "email": "rahul@example.com", "password": "mypassword123" }
         Note: no JWT cookie yet — this is a public route, middleware skips it

Step 3   Go receives request
         └─ Checks email is not already in users collection
            → If duplicate: return 409 { "error": "email already registered" }
         └─ Hashes password with bcrypt (cost factor 12)
         └─ Inserts document into users collection:
            {
              _id: ObjectId(),
              name: "Rahul Kumar",
              email: "rahul@example.com",
              password_hash: "$2a$12$...",
              inferred_profile: null,
              avatar_url: null,
              created_at: ISODate()
            }
         └─ Signs a JWT:
            payload: { user_id: "<ObjectId as string>", exp: now + 7 days }
            secret: JWT_SECRET from env
         └─ Sets cookie on response:
            Set-Cookie: token=<JWT>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
         └─ Returns 201 { "user_id": "...", "name": "Rahul Kumar" }

Step 4   Browser receives 201
         └─ Cookie is automatically stored by browser (HttpOnly = JS cannot read it)
         └─ Next.js redirects to /journal
         └─ Shows success animation

Error cases:
  → 409 Conflict:    Email already registered → show "an account with this email exists"
  → 400 Bad Request: Missing fields → show field-level errors
  → 500:             Go/DB error → show "something went wrong, try again"
```

---

## Flow 2 — Login

**User action:** Enters email and password on `/login` and clicks "Log in"

```
Step 1   Browser
         └─ Validates form locally (email format, password not empty)

Step 2   Browser → Go
         POST http://localhost:8080/api/auth/login
         Body: { "email": "rahul@example.com", "password": "mypassword123" }
         Note: public route, no JWT required

Step 3   Go receives request
         └─ Looks up user by email in users collection
            → If not found: return 401 { "error": "invalid credentials" }
              (Do NOT say "email not found" — that leaks user existence)
         └─ Compares submitted password against stored bcrypt hash
            → If mismatch: return 401 { "error": "invalid credentials" }
         └─ Signs a fresh JWT (same structure as signup)
         └─ Sets HttpOnly cookie
         └─ Returns 200 { "user_id": "...", "name": "Rahul Kumar" }

Step 4   Browser receives 200
         └─ Cookie stored automatically
         └─ Next.js redirects to /journal

Error cases:
  → 401: Wrong email or password → show "invalid email or password" (never say which is wrong)
  → 429: Too many attempts → show "too many login attempts, try again in 15 minutes"
  → 500: Go error → show generic error
```

---

## Flow 3 — Loading the Journal Page

**User action:** Navigates to `/journal` (authenticated)

```
Step 1   Browser requests /journal page from Next.js
         middleware.ts runs:
         └─ Reads cookie: token=<JWT>
            → If missing: redirect to /login immediately, page never loads
            → If present: allow request through (Next.js does NOT verify the JWT — Go does that)

Step 2   Next.js serves the /journal page (CSR — client-side rendered)
         └─ Page loads with empty state (sidebar: loading spinner)

Step 3   Browser → Go  (two parallel requests)
         GET http://localhost:8080/api/journal?limit=20
         Cookie: token=<JWT>  ← browser sends automatically

         GET http://localhost:8080/api/journal/new-draft  ← or just show blank editor

Step 4   Go receives GET /journal
         └─ Middleware verifies JWT signature and expiry
            → If invalid/expired: 401 { "error": "unauthorized" }
         └─ Extracts userId from JWT claims → injects into request context
         └─ Handler reads userId from context (never from query params)
         └─ MongoDB query:
            db.journals.find(
              { user_id: ObjectId(userId) },   ← userId filter is MANDATORY
              { _id:1, raw_text:1, journal_text:1, parsed:1, status:1, created_at:1 }
            ).sort({ created_at: -1 }).limit(20)
         └─ Serializes _id as string, created_at as ISO string
         └─ Returns 200 [ ...entries ]

Step 5   Next.js receives entry list
         └─ Renders sidebar with past entries
         └─ Auto-selects most recent entry
            → If status = "processed": show result view
            → If status = "draft": show editor with raw_text pre-filled
            → If no entries: show empty state + blank editor

Error cases:
  → 401 from Go: Next.js clears local state, redirects to /login
  → 500 from Go: show "could not load entries" with retry button
  → Network error: show "you appear to be offline"
```

---

## Flow 4 — Writing & Autosave

**User action:** Types in the TipTap editor

```
State machine on the frontend:
  NEW_ENTRY     → no _id yet, first save will POST
  DRAFT_SAVED   → _id exists, subsequent saves PATCH
  SAVING        → request in flight
  UNSAVED       → network error on last save

Step 1   User types first character
         └─ Status indicator changes to "draft"
         └─ 2-second debounce timer starts (resets on every keystroke)

Step 2   User pauses for 2 seconds
         └─ Debounce fires
         └─ Status changes to "saving..."
         └─ If no _id yet (new entry):
            Browser → Go
            POST http://localhost:8080/api/journal
            Body: { "raw_text": "woke up at 8..." }
            Cookie: token=<JWT>

         └─ If _id exists (subsequent autosave):
            Browser → Go
            PATCH http://localhost:8080/api/journal/:id
            Body: { "raw_text": "woke up at 8, did leetcode..." }
            Cookie: token=<JWT>

Step 3   Go receives POST /journal
         └─ Middleware: verify JWT → extract userId
         └─ Creates document in MongoDB:
            {
              user_id: ObjectId(userId),   ← from JWT, never from body
              raw_text: "woke up at 8...",
              status: "draft",
              parsed: null,
              journal_text: null,
              created_at: ISODate(),
              updated_at: ISODate()
            }
         └─ Returns 201 { "_id": "64f2a81c..." }

         Go receives PATCH /journal/:id
         └─ Middleware: verify JWT → extract userId
         └─ Verifies document belongs to this user:
            db.journals.findOne({ _id: ObjectId(id), user_id: ObjectId(userId) })
            → If not found or wrong user: 404 { "error": "not found" }
         └─ Updates document:
            db.journals.updateOne(
              { _id: ObjectId(id), user_id: ObjectId(userId) },
              { $set: { raw_text: "...", updated_at: ISODate() } }
            )
         └─ Returns 200 { "updated": true }

Step 4   Browser receives response
         └─ On POST 201: stores _id in React state, future saves become PATCH
         └─ Status changes to "saved" with green indicator
         └─ After 3 seconds: status fades back to "draft"

Error cases:
  → 401: Session expired mid-write
          Next.js: save raw_text to localStorage as emergency backup
          Redirect to /login?reason=session_expired
          After re-login: restore draft from localStorage into editor

  → 404 on PATCH: Entry was deleted from another session
          Next.js: switch to POST mode, create new entry

  → Network error: Status shows "unsaved — check your connection"
          Retry autosave every 10 seconds until success or user submits
```

---

## Flow 5 — Submitting an Entry

**User action:** Clicks "Submit" button

This is the most complex flow — it involves all three services.

```
Step 1   Browser (pre-flight)
         └─ Cancel any pending autosave debounce timer (prevent race condition)
         └─ Read current raw_text from TipTap editor
         └─ If empty: show validation error, stop here
         └─ If > 4000 chars: show "entry too long" warning, stop here
         └─ Disable Submit button immediately (prevent double-submit)
         └─ If no _id yet: this is the first save — treat as a fresh submit
         └─ Show processing animation (spinner + step indicators)

Step 2   Browser → Go
         POST http://localhost:8080/api/journal/:id/submit
         Body: { "raw_text": "woke up at 8..." }   ← current editor content
         Cookie: token=<JWT>

         Note: if no draft _id exists yet, use:
         POST http://localhost:8080/api/journal/submit
         (Go creates the draft and submits in one transaction)

Step 3   Go receives submit request
         └─ Middleware: verify JWT → extract userId
         └─ Verifies entry ownership (same as PATCH check above)
         └─ Reads user's inferred_profile from users collection
            (used to help the LLM understand context)
         └─ Calls Python processor (internal HTTP):
            POST http://localhost:8000/process
            Headers:
              Content-Type: application/json
              X-Internal-Key: <PYTHON_INTERNAL_KEY from env>
            Body:
              {
                "raw_text": "woke up at 8...",
                "user_profile": "cs_student"   ← from users collection, may be null
              }
            Timeout: 30 seconds

Step 4   Python receives /process request
         └─ Checks X-Internal-Key header
            → If missing or wrong: 403 Forbidden (Go treats this as 500)
         └─ Builds prompt with today's date and user_profile injected
         └─ Calls Groq API:
            model: llama-3.3-70b-versatile
            temperature: 0.2
            messages: [system: <SYSTEM_PROMPT>, user: <raw_text>]
         └─ Receives raw JSON string from Groq
         └─ Defensively strips ```json ``` fences if present
         └─ Parses JSON → validates with ParsedJournal Pydantic model
         └─ Generates narrative text via _build_journal_text()
         └─ Returns 200:
            {
              "parsed": {
                "meta": { "mood": "productive", "productivity_score": 0.8, ... },
                "entries": [ ... ],
                "skills_touched": [ ... ],
                "people_met": [ "Priya" ],
                "places_visited": [ "campus canteen" ]
              },
              "journal_text": "You had a highly productive day..."
            }

Step 5   Go receives Python response
         └─ If Python returned error: Go returns 502 to Next.js (see error cases)
         └─ Builds final document:
            {
              status: "processed",
              raw_text: "<original text>",
              parsed: <parsed from Python>,
              journal_text: "<narrative from Python>",
              updated_at: ISODate()
            }
         └─ Updates MongoDB:
            db.journals.updateOne(
              { _id: ObjectId(id), user_id: ObjectId(userId) },   ← double-scoped
              { $set: { status, parsed, journal_text, updated_at } }
            )
         └─ If user's inferred_profile was null and Python returned one:
            db.users.updateOne(
              { _id: ObjectId(userId) },
              { $set: { inferred_profile: parsed.meta.inferred_profile } }
            )
         └─ Returns 200 with the full processed document

Step 6   Browser receives 200
         └─ Hides processing animation
         └─ Re-enables Submit button
         └─ Renders result view:
            - mood pill + productivity score + streak
            - journal_text in italic serif
            - activity cards grid
            - skills, people, places chips
         └─ Updates sidebar entry from "draft" to processed state
         └─ Adds entry to top of sidebar list if it was new

Processing animation timing (frontend only — fake steps while waiting):
  0.0s  Step 1 active: "Parsing activities and events"
  0.7s  Step 2 active: "Extracting skills and people"
  1.4s  Step 3 active: "Scoring productivity"
  2.1s  Step 4 active: "Writing your journal narrative"
  Wait for Go response (real wait) → then show result

Error cases:
  → 408/Timeout (Go → Python took > 30s):
      Go returns 504 to Next.js
      Next.js: exit animation, show "AI processing timed out — your draft is saved, try again"
      Submit button re-enabled

  → 502 Bad Gateway (Python is down):
      Go returns 502 to Next.js
      Next.js: show "AI service unavailable — draft saved, try again in a moment"

  → 422 (Python returned malformed JSON even after cleanup):
      Go returns 422 to Next.js
      Next.js: show "Could not process this entry — try rephrasing or shortening it"

  → 401 (session expired during processing):
      Next.js: save raw_text to localStorage
      Redirect to /login?reason=session_expired

  → Network drop mid-request:
      Next.js: show "Connection lost — your draft is saved locally"
      Persist raw_text to localStorage as backup
```

---

## Flow 6 — Viewing a Past Entry

**User action:** Clicks a past entry in the sidebar

```
Step 1   Browser
         └─ Reads entry from already-fetched list (loaded in Flow 3)
         └─ If status = "processed": renders result view immediately (no extra API call)
         └─ If status = "draft": renders editor with raw_text pre-filled

Step 2   (Optional — if user navigates directly to /journal/[id])
         Browser → Go
         GET http://localhost:8080/api/journal/:id
         Cookie: token=<JWT>

Step 3   Go receives request
         └─ Middleware: verify JWT → extract userId
         └─ MongoDB query:
            db.journals.findOne({ _id: ObjectId(id), user_id: ObjectId(userId) })
            → If not found: 404 (entry doesn't exist OR belongs to different user — same response)
         └─ Returns 200 with full journal document

Step 4   Browser renders:
         └─ Processed entry: result view with narrative, chips, activity cards
         └─ Draft entry: editor with raw_text pre-filled, ready to continue writing

Error cases:
  → 404: Entry not found → show "this entry doesn't exist" with link back to /journal
  → 401: Session expired → redirect to /login
```

---

## Flow 7 — Loading the Profile Page

**User action:** Clicks "Profile" in the navbar

```
Step 1   middleware.ts checks JWT cookie → allows through

Step 2   Next.js renders /profile (CSR)
         └─ Shows skeleton loading state for all stat cards and charts

Step 3   Browser → Go  (two parallel requests)
         GET http://localhost:8080/api/profile
         GET http://localhost:8080/api/profile/stats
         Cookie: token=<JWT>

Step 4   Go receives GET /profile
         └─ Middleware: verify JWT → extract userId
         └─ Fetches user document:
            db.users.findOne({ _id: ObjectId(userId) })
         └─ Returns 200 { name, email, inferred_profile, avatar_url, created_at }

         Go receives GET /profile/stats
         └─ Middleware: verify JWT → extract userId
         └─ Runs MongoDB aggregation pipeline — all stages scoped to userId:

            Total entries:
            db.journals.countDocuments({ user_id: ObjectId(userId), status: "processed" })

            Average productivity score:
            db.journals.aggregate([
              { $match: { user_id: ObjectId(userId), status: "processed" } },
              { $group: { _id: null, avg: { $avg: "$parsed.meta.productivity_score" } } }
            ])

            Top skills (ranked by frequency):
            db.journals.aggregate([
              { $match: { user_id: ObjectId(userId), status: "processed" } },
              { $unwind: "$parsed.skills_touched" },
              { $group: { _id: "$parsed.skills_touched.name", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ])

            Mood distribution:
            db.journals.aggregate([
              { $match: { user_id: ObjectId(userId), status: "processed" } },
              { $group: { _id: "$parsed.meta.mood", count: { $sum: 1 } } }
            ])

            People met most:
            db.journals.aggregate([
              { $match: { user_id: ObjectId(userId), status: "processed" } },
              { $unwind: "$parsed.people_met" },
              { $group: { _id: "$parsed.people_met", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 8 }
            ])

            Current streak:
            Go computes this in-memory by fetching the last 60 dates with entries
            and counting consecutive days ending today.

         └─ Returns 200 { total, avg_productivity, top_skills, mood_dist, people, streak, best_streak }

Step 5   Browser receives both responses
         └─ Renders profile header with user info
         └─ Renders all stat cards, streak calendar, productivity chart, skills bars,
            mood distribution bars, people chips, activity donut

Error cases:
  → 401: Redirect to /login
  → 500 on stats: Show stat cards with "--" placeholder, show "could not load stats" banner
```

---

## Flow 8 — Editing Profile

**User action:** Clicks "Edit profile", changes name, clicks "Save changes"

```
Step 1   Browser
         └─ Opens edit modal (local state — no API call)
         └─ Pre-fills form with current name, email, profile type

Step 2   User edits and clicks Save
         Browser → Go
         PATCH http://localhost:8080/api/profile
         Body: { "name": "Rahul K.", "avatar_url": null }
         Cookie: token=<JWT>
         Note: email changes require re-verification (future feature — skip for now)

Step 3   Go receives request
         └─ Middleware: verify JWT → extract userId
         └─ Validates fields (name not empty, max 100 chars)
         └─ Updates users collection:
            db.users.updateOne(
              { _id: ObjectId(userId) },
              { $set: { name: "Rahul K.", updated_at: ISODate() } }
            )
         └─ Returns 200 { "updated": true }

Step 4   Browser receives 200
         └─ Closes modal
         └─ Updates displayed name in profile header (React state, no re-fetch needed)

Error cases:
  → 400: Invalid name → show inline error in modal
  → 401: Session expired → redirect to /login
```

---

## Flow 9 — Logout

**User action:** Clicks logout (avatar dropdown or settings)

```
Step 1   Browser → Go
         POST http://localhost:8080/api/auth/logout
         Cookie: token=<JWT>

Step 2   Go receives request
         └─ Clears the cookie by setting Max-Age=0:
            Set-Cookie: token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
         └─ Returns 200 { "logged_out": true }
         Note: Go does NOT need to verify the JWT here — just clearing the cookie is enough
         The JWT itself becomes useless once the cookie is gone

Step 3   Browser receives 200
         └─ Next.js clears any cached user state (React context / Zustand)
         └─ Redirects to / (homepage)
         └─ middleware.ts will now block /journal and /profile since cookie is gone
```

---

## Flow 10 — Session Expiry Mid-Session

**User action:** None — JWT expires (7 days) while user is on the journal page

```
Step 1   User tries to autosave or submit
         Browser → Go (any protected request)
         Cookie: token=<expired JWT>

Step 2   Go receives request
         └─ Middleware verifies JWT
         └─ JWT is expired → returns 401 { "error": "token expired" }

Step 3   Browser receives 401
         └─ Next.js global fetch interceptor catches 401
         └─ Saves raw_text to localStorage:
            localStorage.setItem('daylog_draft_backup', raw_text)
         └─ Shows toast: "Your session expired. Logging you in again..."
         └─ Redirects to /login?reason=session_expired&redirect=/journal

Step 4   User logs in again
         └─ Go issues fresh JWT → sets new cookie
         └─ Next.js redirects back to /journal

Step 5   Journal page loads
         └─ Checks localStorage for 'daylog_draft_backup'
         └─ If found: pre-fills editor with backed-up text, shows banner:
            "We restored your unsaved draft. Review it and submit when ready."
         └─ Clears localStorage after restoring
```

---

## How Auth Works on Every Request

Every single protected API call follows this exact sequence inside Go:

```
Incoming request
      │
      ▼
AuthMiddleware runs
      │
      ├─ Read cookie:  r.Cookie("token")
      │    └─ Missing → 401 { "error": "unauthorized" }
      │
      ├─ Parse JWT:    jwt.ParseWithClaims(tokenString, &claims, keyFunc)
      │    └─ Invalid signature → 401 { "error": "unauthorized" }
      │    └─ Expired           → 401 { "error": "token expired" }
      │
      ├─ Extract userId from claims
      │
      ├─ Inject into context:
      │    ctx = context.WithValue(r.Context(), "userId", claims.UserID)
      │
      └─ Call next handler with new context
             │
             ▼
         Handler runs
             │
             └─ userId := r.Context().Value("userId").(string)
                All MongoDB queries use this userId
                NEVER from request body
                NEVER from URL params
                ALWAYS from context
```

**Golden rule for every MongoDB query in Go:**

```go
// WRONG — never do this
userID := r.URL.Query().Get("user_id")
filter := bson.M{"_id": id}

// RIGHT — always do this
userID := r.Context().Value("userId").(string)
filter := bson.M{"_id": id, "user_id": userID}
```

---

## Error Handling Reference

### HTTP status codes Go returns

| Code | Meaning                          | Next.js action                              |
|------|----------------------------------|---------------------------------------------|
| 200  | Success                          | Render response                             |
| 201  | Created                          | Store new _id, update UI                    |
| 400  | Bad request (validation)         | Show field errors                           |
| 401  | Unauthorized / expired token     | Save draft to localStorage → redirect login |
| 403  | Forbidden (wrong user for resource) | Show "access denied"                     |
| 404  | Not found                        | Show not found state                        |
| 409  | Conflict (e.g. email taken)      | Show specific error message                 |
| 422  | Unprocessable (LLM parse failure)| Show "try rephrasing" message               |
| 429  | Rate limited                     | Show "too many requests, wait X minutes"    |
| 500  | Go internal error                | Show generic "something went wrong"         |
| 502  | Python processor is down         | Show "AI unavailable, draft saved"          |
| 504  | Python timed out                 | Show "processing timed out, try again"      |

### Error response shape (all Go errors)

```json
{
  "error": "human readable message",
  "code": "machine_readable_code"
}
```

Example:
```json
{
  "error": "email already registered",
  "code": "EMAIL_TAKEN"
}
```

Next.js checks `code` to decide which UI message to show — never parses the `error` string.

### Global fetch wrapper in Next.js

All API calls go through a single wrapper that handles 401 globally:

```typescript
async function apiFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    credentials: 'include',   // always send the cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // Save draft if we're in the journal
    const draft = document.getElementById('editor')?.innerText
    if (draft) localStorage.setItem('daylog_draft_backup', draft)
    window.location.href = '/login?reason=session_expired'
    return
  }

  return res
}
```

---

## What Each Service Never Does

### Next.js never:
- Sends `userId` in request bodies — Go reads it from the JWT
- Verifies the JWT itself — it only checks cookie presence in middleware
- Writes to MongoDB directly
- Calls Python directly
- Trusts the Go response without checking status code first

### Go never:
- Reads `userId` from request body or URL query params
- Saves anything to MongoDB without a `user_id` filter on the document
- Exposes Python's port to the internet
- Returns password hashes in any response
- Returns another user's data (every query is double-scoped: by `_id` AND `user_id`)

### Python never:
- Connects to MongoDB
- Knows about users, sessions, or authentication
- Is called from anywhere except Go (protected by X-Internal-Key)
- Returns anything except `{ parsed, journal_text }`
- Saves state between requests (fully stateless)
