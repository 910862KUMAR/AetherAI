from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.role import Role
from app.db.models.user import User
from app.security.auth.password_handler import hash_password


class RegisterService:

    DEFAULT_ROLE_NAME = "user"

    @staticmethod
    async def register(
        db: AsyncSession,
        full_name: str,
        email: str,
        password: str,
    ) -> User:

        result = await db.execute(
            select(User).where(
                User.email == email
            )
        )

        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise ValueError(
                "Email already registered."
            )

        role_result = await db.execute(
            select(Role).where(
                Role.role_name
                == RegisterService.DEFAULT_ROLE_NAME
            )
        )

        role = role_result.scalar_one_or_none()

        if role is None:
            raise ValueError(
                "Default USER role is not configured."
            )

        user = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role_id=role.id,
            is_active=True,
            is_verified=False,
        )

        db.add(user)

        await db.commit()

        await db.refresh(user)

        return user
