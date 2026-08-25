from sentence_transformers import CrossEncoder


class Reranker:

    MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

    _model = None

    @classmethod
    def _get_model(cls):

        if cls._model is None:
            cls._model = CrossEncoder(
                cls.MODEL_NAME
            )

        return cls._model

    @classmethod
    def rerank(
        cls,
        query: str,
        candidates: list[dict],
        top_k: int = 5,
    ) -> list[dict]:

        if not query.strip() or not candidates:
            return []

        pairs = [
            [
                query,
                candidate["document"],
            ]
            for candidate in candidates
        ]

        scores = cls._get_model().predict(pairs)

        ranked = []

        for candidate, score in zip(
            candidates,
            scores,
        ):
            item = dict(candidate)
            item["rerank_score"] = float(score)
            ranked.append(item)

        ranked.sort(
            key=lambda item: item["rerank_score"],
            reverse=True,
        )

        return ranked[:top_k]
