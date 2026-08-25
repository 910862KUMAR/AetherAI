from typing import Any

from openai import OpenAI
from ragas import EvaluationDataset, evaluate
from ragas.llms import llm_factory
from ragas.metrics.collections import (
    Faithfulness,
    ContextPrecision,
    ContextRecall,
)

from app.core.config.settings import settings


class RAGEvaluator:

    @staticmethod
    def retrieval_summary(
        results: list[dict[str, Any]],
    ) -> dict[str, Any]:

        if not results:
            return {
                "retrieved_count": 0,
                "has_results": False,
                "average_distance": None,
                "average_rerank_score": None,
            }

        distances = [
            float(item["distance"])
            for item in results
            if item.get("distance") is not None
        ]

        rerank_scores = [
            float(item["rerank_score"])
            for item in results
            if item.get("rerank_score") is not None
        ]

        return {
            "retrieved_count": len(results),
            "has_results": True,
            "average_distance": (
                sum(distances) / len(distances)
                if distances
                else None
            ),
            "average_rerank_score": (
                sum(rerank_scores) / len(rerank_scores)
                if rerank_scores
                else None
            ),
        }

    @staticmethod
    def _create_llm():

        client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )

        return llm_factory(
            model=settings.GROQ_MODEL,
            provider="openai",
            client=client,
        )

    @classmethod
    def evaluate_rag(
        cls,
        question: str,
        answer: str,
        contexts: list[str],
        reference: str | None = None,
    ) -> dict[str, Any]:

        question = question.strip()
        answer = answer.strip()

        contexts = [
            context.strip()
            for context in contexts
            if context and context.strip()
        ]

        if not question:
            raise ValueError(
                "Evaluation question cannot be empty."
            )

        if not answer:
            raise ValueError(
                "Evaluation answer cannot be empty."
            )

        if not contexts:
            return {
                "status": "no_context",
                "question": question,
                "scores": {},
            }

        row = {
            "user_input": question,
            "response": answer,
            "retrieved_contexts": contexts,
        }

        if reference:
            row["reference"] = reference

        dataset = EvaluationDataset.from_list(
            [row]
        )

        llm = cls._create_llm()

        metrics = [
            Faithfulness(llm=llm),
        ]

        if reference:
            metrics.extend(
                [
                    ContextPrecision(llm=llm),
                    ContextRecall(llm=llm),
                ]
            )

        result = evaluate(
            dataset,
            metrics=metrics,
            llm=llm,
            raise_exceptions=False,
            show_progress=False,
        )

        scores = {}

        try:
            scores = result.to_pandas().iloc[0].to_dict()
        except Exception:
            try:
                scores = dict(result)
            except Exception:
                scores = {
                    "result": str(result),
                }

        return {
            "status": "completed",
            "question": question,
            "metrics": list(scores.keys()),
            "scores": scores,
        }
