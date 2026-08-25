from groq import AsyncGroq

from app.core.config.settings import settings


class GroqClient:

    def __init__(self):
        self.client = AsyncGroq(
            api_key=settings.GROQ_API_KEY,
        )

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:

        response = await self.client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.2,
        )

        return response.choices[0].message.content or ""
