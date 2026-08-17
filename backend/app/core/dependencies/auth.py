from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Current authenticated user dependency.
    JWT validation will be implemented in the Authentication module.
    """

    return {
        "access_token": credentials.credentials,
    }