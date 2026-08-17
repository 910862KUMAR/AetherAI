from uuid import uuid4

from app.services.document.chunking_service import ChunkingService
from app.services.document.embedding_service import EmbeddingService
from app.services.document.vector_store_service import VectorStoreService


def test_rag_vector_pipeline():

    user_id = str(uuid4())
    document_id = str(uuid4())

    text = (
        "AetherAI is an enterprise AI knowledge platform. "
        "It uses retrieval augmented generation to answer "
        "questions from uploaded documents."
    )

    # 1. Chunk
    chunks = ChunkingService.chunk_text(text)

    assert chunks
    assert len(chunks) >= 1

    # 2. Generate embeddings
    embeddings = EmbeddingService.generate_embeddings(
        chunks
    )

    assert len(embeddings) == len(chunks)
    assert len(embeddings[0]) > 0

    # 3. Store vectors
    VectorStoreService.add_documents(
        chunks=chunks,
        embeddings=embeddings,
        document_id=document_id,
        user_id=user_id,
    )

    # 4. Search
    query_embedding = EmbeddingService.generate_embeddings(
        ["What is AetherAI?"]
    )[0]

    results = VectorStoreService.search(
        query_embedding=query_embedding,
        user_id=user_id,
        top_k=3,
    )

    assert results is not None
    assert results["documents"]
    assert len(results["documents"][0]) >= 1

    # 5. Verify correct document isolation
    metadata = results["metadatas"][0][0]

    assert metadata["document_id"] == document_id
    assert metadata["user_id"] == user_id

    # 6. Cleanup
    VectorStoreService.delete_document(
        document_id=document_id
    )