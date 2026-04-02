import os
import json
from datetime import date
# from anthropic import AsyncAnthropic
from groq import AsyncGroq
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])


class EntryData(BaseModel):
    # free-form, varies by type
    # we keep this as dict intentionally — rigid here would kill flexibility
    pass

class Entry(BaseModel):
    type: str                  # study, gym, social, sleep, food, leisure, work...
    status: str                # done, pending, maybe
    time_hint: str | None = None      # morning, afternoon, evening, night, null
    duration_mins: int | None = None
    data: dict                 # flexible payload per type

class SkillTouched(BaseModel):
    name: str
    subtopic: str | None = None

class Meta(BaseModel):
    input_mode: str = "end_of_day"      # realtime or end_of_day
    inferred_profile: str | None = None   # cs_student, designer, athlete...
    mood: str | None = None           # happy, neutral, tired, anxious, productive...
    productivity_score: float | None = None  # 0.0 to 1.0
    date: str                  # YYYY-MM-DD

class ParsedJournal(BaseModel):
    meta: Meta
    entries: list[Entry]
    skills_touched: list[SkillTouched]
    people_met: list[str]
    places_visited: list[str]

SYSTEM_PROMPT = """
You are a journaling AI that extracts structured data from a user's natural language daily log.

Your job is to parse what the user wrote and return a single valid JSON object.
No explanation. No markdown. No code fences. Just raw JSON.

## Entry types you should recognize:
- study       → learning, reading, courses, leetcode, tutorials
- coding      → building projects, debugging, writing code
- gym         → workout, exercise, running, sport
- social      → time spent with people
- sleep       → rest, nap, bedtime mentions
- food        → meals, eating, cooking
- leisure     → movies, games, scrolling, music, walks
- work        → job tasks, meetings, freelance
- travel      → commute, trips, places visited
- habit       → meditation, journaling, prayer, reading streaks

## Status rules:
- "did", "went", "finished", "completed", "watched" → "done"
- "will", "planning to", "going to", "tonight" → "pending"
- "might", "maybe", "thinking of" → "maybe"

## Duration rules:
- "2 hours" → 120
- "30 mins" / "half hour" → 30
- If not mentioned → null

## time_hint rules:
- infer from words like "morning", "after lunch", "at night", "before bed"
- if nothing is mentioned → null

## Flexible `data` field per type:
- study:   { topic, subject, platform, resource }
- coding:  { project, language, what_built }
- gym:     { exercises: [], sets, reps, distance_km }
- social:  { people: [], activity, place }
- sleep:   { hours, quality: good/ok/bad, notes }
- food:    { meal, items: [], with_whom: [] }
- leisure: { activity, title, platform }
- travel:  { destination, mode }

## Profile inference:
Look at the overall pattern of entries. Infer one of:
cs_student, software_engineer, designer, student_general, athlete,
content_creator, entrepreneur, or null if unclear.

## Mood inference:
Infer from language tone and activities:
happy, excited, productive, neutral, tired, anxious, sad, frustrated

## Productivity score:
0.0 = totally unproductive day (only leisure/sleep)
1.0 = extremely focused and output-heavy day
Be honest. Scrolling Instagram for 3 hours should pull the score down.

Always extract people's names into people_met (list of strings).
Always extract location names into places_visited (list of strings).
Always extract skills/topics into skills_touched (list of objects with "name" and "subtopic").

## Expected JSON Format:
{
  "meta": {
    "input_mode": "end_of_day",
    "inferred_profile": "...",
    "mood": "...",
    "productivity_score": 0.8,
    "date": "{today}"
  },
  "entries": [
    {
      "type": "...",
      "status": "...",
      "time_hint": "...",
      "duration_mins": 120,
      "data": {}
    }
  ],
  "skills_touched": [{"name": "...", "subtopic": "..."}],
  "people_met": ["..."],
  "places_visited": ["..."]
}

Today's date: {today}
User's known profile (may be null): {profile}
""".strip()

async def parse_journal_input(
    raw_text: str,
    user_profile: str | None = None,
    today: date | None = None,
) -> ParsedJournal:
    
    today_str = str(today or date.today())
    profile_str = user_profile or "unknown"

    prompt = SYSTEM_PROMPT.replace("{today}", today_str).replace("{profile}", profile_str)
    # response = await client.messages.create(
    #     model="claude-opus-4-5",
    #     max_tokens=1024,
    #     system=prompt,
    #     messages=[
    #         {"role": "user", "content": raw_text}
    #     ],
    # )

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # Groq model
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": raw_text}
        ],
        temperature=0.2,
    )

    raw_json = response.choices[0].message.content

    # Claude occasionally wraps in ```json ``` even when told not to
    # strip it defensively
    raw_json = raw_json.strip()
    if raw_json.startswith("```"):
        raw_json = raw_json.split("\n", 1)[1]
        raw_json = raw_json.rsplit("```", 1)[0]

    parsed = json.loads(raw_json)
    return ParsedJournal(**parsed)


# at the bottom of the file
if __name__ == "__main__":
    import asyncio

    test_inputs = [
        # end of day dump
        "woke up at 8, did leetcode problem on trees for 2 hours, "
        "had lunch with Priya at campus canteen, went to gym (chest day), "
        "studied rate limiter concept in the evening, "
        "scrolled instagram for too long, slept at 1am",

        # real-time short entry
        "just finished system design mock interview with Arjun, went well",

        # vague/casual
        "pretty chill day. movie with friends, might study tomorrow",
    ]

    async def run():
        for text in test_inputs:
            print(f"\n--- INPUT ---\n{text}\n")
            result = await parse_journal_input(text)
            print(result.model_dump_json(indent=2))

    asyncio.run(run())