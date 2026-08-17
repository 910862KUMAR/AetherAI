from pydantic import BaseModel


class MemoryRequest(BaseModel):
    key: str
    value: str


class MemoryResponse(BaseModel):
    status: str