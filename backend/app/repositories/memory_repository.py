class MemoryRepository:

    async def save(self, key: str, value: str):
        return {
            "key": key,
            "value": value,
        }