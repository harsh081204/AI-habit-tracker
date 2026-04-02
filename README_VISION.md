# 🎯 AI Habit Tracker & Identity Engine

> Not just a habit tracker. An AI that reveals who you're becoming.

This project is **two things in one**:

1. **🔁 Habit Tracker** — For any user who wants to log their day and track habits, streaks, routines, and consistency over time.
2. **🧠 AI Identity & Trajectory Engine** — A deeper intelligence layer that analyses months of your logs and tells you what skills you're building, what patterns in behaviour exist, and where you're headed.

---

## 🧠 The Core Problem It Solves

When a user asks:
> *"What skills have I built in the last 6 months, and what path am I following?"*

The app replies with structured, hidden patterns extracted from their messy daily logs.

**Example Insights:**
1. **Core Skills:** Backend Development, System Design, Machine Learning
2. **Topics Covered:** Rate Limiting, Load Balancing, Neural Networks
3. **Hidden Trajectory:** *"You are moving toward backend/system engineering with a growing interest in scalable systems, though you've shown a recent drift away from ML."*

---

## ✅ What's Built So Far

### `backend/ai_processer.py` — AI Layer ✅
- Sends raw natural language journal text to **Groq LLM (llama-3.3-70b)**
- Parses AI output into strongly-typed **Pydantic models**
- Extracts: `entries`, `skills_touched`, `people_met`, `places_visited`, `mood`, `productivity_score`, `inferred_profile`
- Returns a clean `ParsedJournal` object
- **Pure AI layer — no side effects, no DB calls**

### `backend/database.py` — DB Layer ✅
- Async MongoDB connection via **Motor** (async driver)
- Single shared client with connection pooling
- `journals_col()` — collection accessor for journal entries
- `connect_db()` / `close_db()` — lifecycle hooks for FastAPI startup/shutdown
- Config via `.env` — `MONGO_URI`, `MONGO_DB_NAME`

### `backend/journal_service.py` — Service Layer ✅
- `create_journal_entry(raw_text, user_id)` — the **single entry point** for new entries
- Full pipeline: `AI Parse → Generate Narrative → Save to MongoDB → Return`
- `_build_journal_text()` — template-based narrative generator (no extra AI call)
- Smoke-tested and confirmed working end-to-end ✅

**Confirmed working output:**
```
[DB] Connected to MongoDB → ai_habit_tracker

── journal_text ──
Overall, it was a moderately productive day. You seemed neutral.
You completed activities across: study, coding, leisure, gym, sleep, food.
Skills touched today: trees, rate limiter concept.
You met or interacted with: Priya. Places visited: campus canteen.

── DB _id ──
69cd3b6033d5fa8b3cc708d4
```

---

## 🏗️ Architecture

```
User Input (raw text)
        ↓
  [ AI Layer ]          ai_processer.py
  parse_journal_input()
  Groq LLM → Pydantic
        ↓
  [ Service Layer ]     journal_service.py
  create_journal_entry()
  Build narrative text
        ↓
  [ DB Layer ]          database.py
  MongoDB insert_one()
        ↓
  Return saved document
```

### MongoDB Document Schema (`journals` collection)

```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "raw_text": "I studied rate limiter and met Rahul...",
  "parsed": {
    "meta": {
      "input_mode": "end_of_day",
      "inferred_profile": "cs_student",
      "mood": "productive",
      "productivity_score": 0.8,
      "date": "2026-04-01"
    },
    "entries": [ { "type": "study", "status": "done", ... } ],
    "skills_touched": [ { "name": "rate limiter", "subtopic": null } ],
    "people_met": ["Rahul"],
    "places_visited": []
  },
  "journal_text": "Overall, it was a productive day...",
  "created_at": "2026-04-01T15:30:00Z"
}
```

**Why store all three (`raw_text`, `parsed`, `journal_text`)?**

| Field | Why It's Critical |
|---|---|
| `raw_text` | Reprocess with better AI later; debug bad parses |
| `parsed` | Power habit tracking, streaks, aggregation, insight queries |
| `journal_text` | Return instantly for simple queries — zero AI cost |

---

## 🔄 Query Strategy (Two Modes)

### Mode 1 — Simple Retrieval (NO AI call) ✅ Cheap & Fast
> "What did I do yesterday?" / "Show my journal for last week"

```python
entries = db.find(date=yesterday)
return entries.journal_text   # already stored, no AI needed
```

### Mode 2 — Insight / Analysis (AI required) 🧠 Smart
> "What skills have I built?" / "What am I focusing on these days?"

```python
# Step 1: Fetch
entries = db.find(last_6_months)

# Step 2: Aggregate structured data (no AI yet)
skills_freq = count(entries.parsed.skills_touched)

# Step 3: AI call with compact aggregated data (NOT raw logs)
generate_insight(skills_freq)
```

> ⚡ **Key insight:** We NEVER send 6 months of raw logs to AI. We aggregate first, then send a compact summary — saves cost, improves accuracy.

---

## 🚀 What's Coming Next

### Immediate (Phase 2 — Query & API Layer)
- [ ] **FastAPI app** — `main.py` with startup/shutdown DB lifecycle
- [ ] **`POST /journal`** — Accept raw text, call `create_journal_entry()`, return doc
- [ ] **`GET /journal`** — Fetch entries by date / date range
- [ ] **`GET /journal/today`** — Today's journal text (Mode 1, no AI)

### Phase 3 — Habit Tracking Layer
- [ ] **Streak tracking** — Count consecutive days per activity type (gym, coding, etc.)
- [ ] **Habit frequency** — "How many days did I code this month?"
- [ ] **Consistency score** — Derived from `parsed.entries` across time
- [ ] **`GET /habits/streaks`** — Return all active streaks per category
- [ ] **`GET /habits/summary?range=7d`** — Weekly habit summary

### Phase 4 — Insight & Trajectory Engine
- [ ] **Aggregation layer** — Pre-compute `skills_frequency`, `activity_frequency`, `people_frequency` from DB
- [ ] **`GET /insights/skills`** — Top skills by frequency + recency
- [ ] **`GET /insights/trajectory`** — AI call with aggregated data → long-term career/learning path
- [ ] **Drift detection** — Alert when user shifts away from a previously dominant skill
- [ ] **Gap analysis** — "You haven't revisited ML in 2 months"

### Phase 5 — Advanced (Future Roadmap)
- [ ] **Daily/Weekly pre-computed summaries** — `daily_summary`, `weekly_summary` stored to avoid recomputation
- [ ] **Skill graph** — Map `System Design → Rate Limiting, Load Balancer` as a knowledge graph
- [ ] **User profiles** — Multi-user support, profile persistence (`inferred_profile` evolves over time)
- [ ] **Frontend** — Dashboard showing streaks, trajectory graph, skills heatmap

---

## 🧭 Clean Architecture (Final Picture)

```
┌─────────────────────────────────────────────┐
│               Frontend / API                │
│         (FastAPI — coming next)             │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│             Service Layer                   │
│         journal_service.py ✅               │
│   create_journal_entry() | query functions  │
└───────────┬───────────────┬─────────────────┘
            │               │
┌───────────▼───┐   ┌───────▼─────────────────┐
│   AI Layer    │   │       DB Layer           │
│ ai_processer  │   │     database.py ✅       │
│    .py ✅     │   │  Motor + MongoDB         │
└───────────────┘   └─────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.12 |
| AI / LLM | Groq API (llama-3.3-70b-versatile) |
| Data Models | Pydantic v2 |
| Database | MongoDB (local or Atlas) |
| Async DB Driver | Motor (AsyncIOMotorClient) |
| API (next) | FastAPI |
| Config | python-dotenv |

---

## 💡 New Ideas Worth Exploring

1. **Mood trend graph** — Plot `mood` and `productivity_score` over time → surface burnout patterns early
2. **"People graph"** — Who appears most in your logs? Detect key relationships and social patterns
3. **Smart journaling prompts** — If AI detects a vague entry, ask follow-up: *"You mentioned leetcode — what problem? What did you learn?"*
4. **Export to Markdown/PDF** — Personal journal export for archiving
5. **Weekly email digest** — Auto-generated weekly summary sent to user
