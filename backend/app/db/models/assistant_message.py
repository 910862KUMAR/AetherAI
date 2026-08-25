from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base.base_model import BaseModel


class AssistantMessage(BaseModel):
    __tablename__ = "assistant_messages"

    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("assistant_conversations.id"),
        nullable=False,
    )

    sender_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    token_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    conversation = relationship(
        "AssistantConversation",
        back_populates="messages",
    )