from datetime import datetime, timezone
from ai_processer import parse_journal_input, ParsedJournal
from database import journals_col

# ── Journal Text Generator ───────────────────────────────────────────────────

def _build_journal_text(raw_text: str, parsed: ParsedJournal) -> str:
    """
    Generate a human-readable narrative from the parsed journal.
    This is a lightweight template-based generator — no AI call needed here.
    Later you can swap this with an LLM call if you want richer narratives.
    """
    meta = parsed.meta
    lines = []

    # Opening line
    mood_line = f"You seemed {meta.mood}." if meta.mood else ""
    score = meta.productivity_score
    if score is not None:
        if score >= 0.8:
            tone = "a highly productive day"
        elif score >= 0.5:
            tone = "a moderately productive day"
        else:
            tone = "a lighter day"
        lines.append(f"Overall, it was {tone}. {mood_line}".strip())
    elif mood_line:
        lines.append(mood_line)

    # Entries summary
    done_entries = [e for e in parsed.entries if e.status == "done"]
    pending_entries = [e for e in parsed.entries if e.status == "pending"]

    if done_entries:
        types = list({e.type for e in done_entries})
        lines.append(f"You completed activities across: {', '.join(types)}.")

    if pending_entries:
        types = list({e.type for e in pending_entries})
        lines.append(f"Planned but not yet done: {', '.join(types)}.")

    # Skills
    if parsed.skills_touched:
        skill_names = [s.name for s in parsed.skills_touched]
        lines.append(f"Skills touched today: {', '.join(skill_names)}.")

    # People
    if parsed.people_met:
        lines.append(f"You met or interacted with: {', '.join(parsed.people_met)}.")

    # Places
    if parsed.places_visited:
        lines.append(f"Places visited: {', '.join(parsed.places_visited)}.")

    return " ".join(lines) if lines else "A day in the books."


# ── Core Service Function ────────────────────────────────────────────────────

async def create_journal_entry(
    raw_text: str,
    user_id: str = "default",
    user_profile: str | None = None,
) -> dict:
    """
    Full pipeline:
      1. Parse raw text via AI
      2. Generate journal narrative text
      3. Save everything to MongoDB
      4. Return the saved document

    This is the ONLY function the rest of the app should call for new entries.
    """

    # Step 1: AI layer
    parsed: ParsedJournal = await parse_journal_input(
        raw_text=raw_text,
        user_profile=user_profile,
    )

    # Step 2: Generate narrative
    journal_text = _build_journal_text(raw_text, parsed)

    # Step 3: Build document
    doc = {
        "user_id": user_id,
        "raw_text": raw_text,
        "parsed": parsed.model_dump(),
        "journal_text": journal_text,
        "created_at": datetime.now(timezone.utc),
    }

    # Step 4: Persist to MongoDB
    col = journals_col()
    result = await col.insert_one(doc)

    # Attach the generated _id for the caller
    doc["_id"] = str(result.inserted_id)

    return doc


# ── Quick smoke test ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio
    from database import connect_db, close_db

    async def run():
        await connect_db()

        sample = (
            "woke up at 8, did leetcode problem on trees for 2 hours, "
            "had lunch with Priya at campus canteen, went to gym (chest day), "
            "studied rate limiter concept in the evening, "
            "scrolled instagram for too long, slept at 1am"
        )

        doc = await create_journal_entry(raw_text=sample, user_id="test_user")

        print("\n── raw_text ──")
        print(doc["raw_text"])

        print("\n── journal_text ──")
        print(doc["journal_text"])

        print("\n── parsed (skills_touched) ──")
        for s in doc["parsed"]["skills_touched"]:
            print(" •", s)

        print("\n── DB _id ──")
        print(doc["_id"])

        await close_db()

    asyncio.run(run())
