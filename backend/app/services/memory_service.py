class MemoryService:

    async def store(self, key: str, value: str):
        return {
            "status": "stored"
        }