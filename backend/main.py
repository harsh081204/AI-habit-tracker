from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import os

from database import connect_db, close_db, journals_col
from journal_service import create_journal_entry


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(title="AI Habit Tracker", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request schema ────────────────────────────────────────────────────────────

class JournalRequest(BaseModel):
    raw_text: str
    user_id: str = "default"


# ── API routes ────────────────────────────────────────────────────────────────

@app.post("/api/journal")
async def submit_journal(req: JournalRequest):
    """Parse and save a journal entry through the AI pipeline."""
    if not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text cannot be empty")
    doc = await create_journal_entry(raw_text=req.raw_text, user_id=req.user_id)
    # MongoDB _id is already stringified in create_journal_entry
    return doc


@app.get("/api/journals")
async def get_journals(limit: int = 10):
    """Return the most recent journal entries."""
    col = journals_col()
    cursor = col.find({}, {"_id": 1, "raw_text": 1, "journal_text": 1,
                           "parsed": 1, "created_at": 1}) \
                .sort("created_at", -1).limit(limit)
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if "created_at" in doc:
            doc["created_at"] = doc["created_at"].isoformat()
        results.append(doc)
    return results


# ── Serve frontend ────────────────────────────────────────────────────────────

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
