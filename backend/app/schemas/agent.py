from pydantic import BaseModel


class AgentRequest(BaseModel):
    task: str


class AgentResponse(BaseModel):
    result: str
    agent_name: str