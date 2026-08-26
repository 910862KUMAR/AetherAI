import asyncio
import os

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def main():
    url = os.environ["DATABASE_URL"].replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1,
    )

    engine = create_async_engine(url)

    async with engine.connect() as connection:
        result = await connection.execute(
            text("SELECT id, role_name FROM roles ORDER BY role_name")
        )

        for row in result:
            print(row)

    await engine.dispose()


asyncio.run(main())