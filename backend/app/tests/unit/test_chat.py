import pytest

from app.services.chat_service import ChatService


@pytest.mark.asyncio
async def test_chat_conversation_not_found(monkeypatch):

    async def mock_get_conversation(
        db,
        conversation_id,
        user_id,
    ):
        return None

    monkeypatch.setattr(
        "app.services.chat_service.ConversationService.get_conversation",
        mock_get_conversation,
    )

    with pytest.raises(ValueError, match="Conversation not found."):
        await ChatService.chat(
            db=None,
            user_id="test-user-id",
            conversation_id="test-conversation-id",
            query="Hello",
        )