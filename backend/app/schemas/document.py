from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    id: str
    file_name: str
    file_type: str
    file_size: int
    status: str


class DocumentResponse(DocumentUploadResponse):
    embedding_status: str