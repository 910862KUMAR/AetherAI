from fastapi import APIRouter

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/")
async def get_users():
    return {
        "message": "List Users",
    }


@router.get("/{user_id}")
async def get_user(user_id: str):
    return {
        "user_id": user_id,
    }


@router.put("/{user_id}")
async def update_user(user_id: str):
    return {
        "user_id": user_id,
        "message": "User Updated",
    }


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    return {
        "user_id": user_id,
        "message": "User Deleted",
    }