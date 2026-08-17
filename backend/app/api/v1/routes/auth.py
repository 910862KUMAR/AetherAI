from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register")
async def register():
    return {
        "message": "User Registration API",
    }


@router.post("/login")
async def login():
    return {
        "message": "User Login API",
    }


@router.post("/refresh")
async def refresh_token():
    return {
        "message": "Refresh Token API",
    }


@router.get("/me")
async def current_user():
    return {
        "message": "Current User API",
    }