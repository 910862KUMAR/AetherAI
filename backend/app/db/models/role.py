from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.db.base.base_model import BaseModel


class Role(BaseModel):
    """
    Role Entity
    """

    __tablename__ = "roles"

    role_name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    permissions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    users = relationship(
        "User",
        back_populates="role",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Role(name={self.role_name})>"