from fastapi import APIRouter
from fastapi import Depends

from app.security.auth.roles import require_role
from app.services.auth.role_service import RoleService

router = APIRouter()


@router.get("/roles")
async def get_roles(
    current_user=Depends(require_role("admin")),
):

    return await RoleService.get_roles()