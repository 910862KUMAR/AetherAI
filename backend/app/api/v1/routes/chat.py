from fastapi import APIRouter

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post("/")
async def chat():
    return {
        "message": "Chat API",
    }


@router.get("/history")
async def chat_history():
    return {
        "message": "Chat History",
    }


@router.delete("/history")
async def clear_history():
    return {
        "message": "Chat History Cleared",
    }