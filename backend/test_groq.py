import os
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

async def test_groq():
    client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": "Say hello",
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        print("Groq success:", chat_completion.choices[0].message.content)
    except Exception as e:
        print("Groq failed:", e)

if __name__ == "__main__":
    asyncio.run(test_groq())
