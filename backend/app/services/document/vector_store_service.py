import chromadb


class VectorStoreService:

    COLLECTION_NAME = "aetherai_documents"

    _client = chromadb.PersistentClient(
        path="./chroma_db"
    )

    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={
            "hnsw:space": "cosine",
        },
    )

    @classmethod
    def add_documents(
        cls,
        chunks: list[str],
        embeddings: list[list[float]],
        document_id: str,
        user_id: str,
    ):

        if not chunks:
            return

        ids = [
            f"{document_id}_chunk_{index}"
            for index in range(len(chunks))
        ]

        metadatas = [
            {
                "document_id": document_id,
                "user_id": user_id,
                "chunk_index": index,
            }
            for index in range(len(chunks))
        ]

        cls._collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    @classmethod
    def search(
        cls,
        query_embedding: list[float],
        user_id: str,
        top_k: int = 5,
    ):

        return cls._collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={
                "user_id": user_id,
            },
        )

    @classmethod
    def delete_document(
        cls,
        document_id: str,
    ):

        cls._collection.delete(
            where={
                "document_id": document_id,
            }
        )