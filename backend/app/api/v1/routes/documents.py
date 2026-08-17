from fastapi import APIRouter

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post("/upload")
async def upload_document():
    return {
        "message": "Document Uploaded",
    }


@router.get("/")
async def get_documents():
    return {
        "message": "Document List",
    }


@router.get("/{document_id}")
async def get_document(document_id: str):
    return {
        "document_id": document_id,
    }


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    return {
        "message": "Document Deleted",
    }