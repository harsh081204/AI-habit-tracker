import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def test_conn():
    uri = os.environ["MONGO_URI"]
    print(f"Testing with URI: {uri}")
    
    # Try 3: Allow everything (DEBUG ONLY)
    print("\n--- Try 3: tlsAllowInvalidCertificates=True ---")
    try:
        import certifi
        client = AsyncIOMotorClient(
            uri, 
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000
        )
        await client.admin.command("ping")
        print("Success with certifi!")
        client.close()  # No await!
    except Exception as e:
        print(f"Failed with certifi: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
