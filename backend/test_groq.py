import asyncio

from app.llm.clients.groq_client import GroqClient


async def test():
    result = await GroqClient().generate(
        "Reply with exactly: AetherAI Groq OK"
    )
    print(result)


asyncio.run(test())