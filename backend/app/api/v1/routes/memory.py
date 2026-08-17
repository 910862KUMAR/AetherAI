from fastapi import APIRouter

router = APIRouter(
    prefix="/memory",
    tags=["Memory"],
)


@router.post("/store")
async def store_memory():
    return {
        "message": "Memory Stored",
    }


@router.get("/")
async def get_memory():
    return {
        "message": "Memory Retrieved",
    }


@router.delete("/")
async def clear_memory():
    return {
        "message": "Memory Cleared",
    }