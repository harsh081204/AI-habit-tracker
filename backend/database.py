import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

load_dotenv()

MONGO_URI = os.environ["MONGO_URI"]
MONGO_DB_NAME = os.environ["MONGO_DB_NAME"]

# Single client instance — reused across the app (connection pooling)
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            MONGO_URI,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000  # Fail fast if connection fails
        )
    return _client


def get_db():
    """Return the main database handle."""
    return get_client()[MONGO_DB_NAME]


# ── Collection accessors ────────────────────────────────────────────────────
# Add one function per collection so the rest of the codebase
# never hardcodes collection names.

def journals_col():
    """journals — one document per daily entry."""
    return get_db()["journals"]


# ── Lifecycle helpers ────────────────────────────────────────────────────────
# Call these from your FastAPI startup / shutdown events later.

async def connect_db():
    """Verify the connection is alive (call on app startup)."""
    client = get_client()
    # ping the server — raises if unreachable
    await client.admin.command("ping")
    print(f"[DB] Connected to MongoDB → {MONGO_DB_NAME}")


async def close_db():
    """Close the client gracefully (call on app shutdown)."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
        print("[DB] MongoDB connection closed")
