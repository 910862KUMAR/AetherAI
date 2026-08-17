from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    """
    Document Response
    """

    id: UUID
    filename: str
    original_filename: str
    content_type: str
    file_size: int
    is_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True