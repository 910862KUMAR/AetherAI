class ChatService:

    async def chat(self, message: str):
        return {
            "response": "AI Response"
        }

    async def history(self):
        return {
            "history": []
        }