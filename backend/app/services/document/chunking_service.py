class ChunkingService:

    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200

    @classmethod
    def chunk_text(cls, text: str) -> list[str]:
        if not text or not text.strip():
            return []

        text = text.strip()

        chunks = []

        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + cls.CHUNK_SIZE

            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            start += cls.CHUNK_SIZE - cls.CHUNK_OVERLAP

        return chunks