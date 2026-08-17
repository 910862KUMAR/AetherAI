from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.conversation import Conversation


class ChatRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, conversation: Conversation):
        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)
        return conversation