class ToolService:

    async def execute(self, tool_name: str):
        return {
            "tool": tool_name
        }