from fastapi import APIRouter

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/dashboard")
async def dashboard():
    return {
        "message": "Admin Dashboard",
    }


@router.get("/users")
async def users():
    return {
        "message": "All Users",
    }


@router.get("/logs")
async def logs():
    return {
        "message": "Audit Logs",
    }