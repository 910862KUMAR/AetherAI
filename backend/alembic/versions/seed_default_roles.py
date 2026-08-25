"""seed default roles

Revision ID: seed_default_roles
Revises: 05e3b2c00b9c
Create Date: 2026-08-25
"""

from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


revision: str = "seed_default_roles"
down_revision: Union[str, Sequence[str], None] = "05e3b2c00b9c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    roles = sa.table(
        "roles",
        sa.column("id", sa.UUID()),
        sa.column("role_name", sa.String()),
        sa.column("description", sa.Text()),
        sa.column("permissions", sa.Text()),
    )

    op.bulk_insert(
        roles,
        [
            {
                "id": uuid4(),
                "role_name": "admin",
                "description": "System administrator",
                "permissions": "all",
            },
            {
                "id": uuid4(),
                "role_name": "user",
                "description": "Standard application user",
                "permissions": "read,write",
            },
        ],
    )


def downgrade() -> None:
    roles = sa.table(
        "roles",
        sa.column("role_name", sa.String()),
    )

    op.execute(
        roles.delete().where(
            roles.c.role_name.in_(["admin", "user"])
        )
    )
