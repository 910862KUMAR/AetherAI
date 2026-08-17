from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.document import Document


class DocumentRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, document: Document):
        self.db.add(document)
        await self.db.commit()
        await self.db.refresh(document)
        return document