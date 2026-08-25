from sentence_transformers import SentenceTransformer


class EmbeddingService:

    MODEL_NAME = "all-MiniLM-L6-v2"

    _model = None

    @classmethod
    def _get_model(cls) -> SentenceTransformer:
        if cls._model is None:
            cls._model = SentenceTransformer(cls.MODEL_NAME)
        return cls._model

    @classmethod
    def generate_embeddings(
        cls,
        texts: list[str],
    ) -> list[list[float]]:

        if not texts:
            return []

        model = cls._get_model()

        embeddings = model.encode(
            texts,
            normalize_embeddings=True,
        )

        return embeddings.tolist()
