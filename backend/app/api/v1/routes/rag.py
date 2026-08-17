from fastapi import APIRouter

router = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)


@router.post("/query")
async def rag_query():
    return {
        "message": "RAG Query",
    }


@router.post("/index")
async def index_documents():
    return {
        "message": "Documents Indexed",
    }


@router.get("/status")
async def rag_status():
    return {
        "message": "RAG Ready",
    }