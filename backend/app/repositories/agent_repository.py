class AgentRepository:

    async def execute(self, task: str):
        return {
            "task": task,
            "status": "completed",
        }