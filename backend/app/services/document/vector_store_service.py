import chromadb


class VectorStoreService:

    COLLECTION_NAME = "aetherai_documents"

    _client = None
    _collection = None

    @classmethod
    def _get_collection(cls):
        if cls._collection is None:
            cls._client = chromadb.PersistentClient(
                path="./chroma_db"
            )

            cls._collection = cls._client.get_or_create_collection(
                name=cls.COLLECTION_NAME,
                metadata={
                    "hnsw:space": "cosine",
                },
            )

        return cls._collection

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

        collection = cls._get_collection()

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

        collection.add(
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
        collection = cls._get_collection()

        return collection.query(
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
        collection = cls._get_collection()

        collection.delete(
            where={
                "document_id": document_id,
            }
        )
