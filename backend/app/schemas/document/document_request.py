from pydantic import BaseModel


class DocumentRequest(BaseModel):
    """
    Document Request
    """

    title: str
    description: str | None = None