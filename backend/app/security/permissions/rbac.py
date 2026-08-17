from functools import wraps

from fastapi import HTTPException, status


def require_roles(*allowed_roles: str):
    """
    Role-Based Access Control decorator.
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):

            current_user = kwargs.get("current_user")

            if current_user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )

            user_role = current_user.get("role")

            if user_role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied",
                )

            return await func(*args, **kwargs)

        return wrapper

    return decorator