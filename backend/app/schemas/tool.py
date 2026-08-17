from pydantic import BaseModel


class ToolRequest(BaseModel):
    tool_name: str
    parameters: dict


class ToolResponse(BaseModel):
    tool_name: str
    status: str
    result: dict | str | None = None