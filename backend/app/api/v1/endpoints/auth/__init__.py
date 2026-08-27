from fastapi import APIRouter

from app.api.v1.endpoints.auth.roles import router as roles_router
from app.api.v1.endpoints.auth.login import router as login_router
from app.api.v1.endpoints.auth.me import router as me_router
from app.api.v1.endpoints.auth.refresh import router as refresh_router
from app.api.v1.endpoints.auth.register import router as register_router
from app.api.v1.endpoints.auth.logout import router as logout_router
from app.api.v1.endpoints.auth.token import router as token_router


router = APIRouter(
    tags=["Authentication"],
)


router.include_router(logout_router)
router.include_router(register_router)
router.include_router(login_router)
router.include_router(token_router)
router.include_router(refresh_router)
router.include_router(me_router)
router.include_router(roles_router)
