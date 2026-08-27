AetherAI — Enterprise AI Knowledge & Operations Copilot

AetherAI is an enterprise-oriented AI knowledge and operations copilot combining secure authentication, document intelligence, Retrieval-Augmented Generation (RAG), vector retrieval, cross-encoder reranking, conversational history, and a React web interface.

1. Problem

Organizations store important knowledge in PDFs, resumes, reports, policies, manuals, and other documents. Keyword search is often insufficient because users want answers rather than document locations.

AetherAI lets authenticated users upload documents and ask natural-language questions. The system retrieves relevant document chunks, reranks them, and returns an answer grounded in the uploaded knowledge with source metadata.

2. Core Features

JWT authentication

OAuth2-compatible Swagger authorization

Access and refresh tokens

Password hashing and verification

Protected APIs

Document upload and processing

Document chunk persistence

Embedding generation

Vector retrieval

Cross-encoder reranking

RAG question answering

Source/chunk metadata

Conversations and messages

Conversation history

Dashboard APIs

React/Vite frontend

FastAPI backend

Async SQLAlchemy database layer

Alembic migrations

Docker support

Render backend deployment

Vercel frontend deployment

OpenAPI/Swagger documentation

3. Architecture

                         ┌──────────────────────┐
                         │    User / Browser    │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │ React + Vite         │
                         │ Vercel Frontend      │
                         └──────────┬───────────┘
                                    │ REST/JSON
                                    ▼
                    ┌─────────────────────────────────┐
                    │ FastAPI Backend / Render        │
                    │                                 │
                    │ Auth | Documents | RAG | Chat  │
                    │ Dashboard | Health              │
                    └───────────────┬─────────────────┘
                                    │
             ┌──────────────────────┼─────────────────────┐
             ▼                      ▼                     ▼
      ┌──────────────┐      ┌───────────────┐     ┌──────────────┐
      │ JWT Security │      │ PostgreSQL /   │     │ RAG Pipeline │
      │ OAuth2       │      │ SQLAlchemy     │     │              │
      └──────────────┘      └───────────────┘     └──────┬───────┘
                                                          │
                                                ┌─────────▼─────────┐
                                                │ Embedding Service │
                                                └─────────┬─────────┘
                                                          │
                                                ┌─────────▼─────────┐
                                                │ Vector Retrieval   │
                                                └─────────┬─────────┘
                                                          │
                                                ┌─────────▼─────────┐
                                                │ Cross-Encoder      │
                                                │ Reranker            │
                                                └─────────┬─────────┘
                                                          │
                                                ┌─────────▼─────────┐
                                                │ Answer + Sources   │
                                                └────────────────────┘

4. End-to-End Document Flow

Upload PDF
   ↓
POST /api/v1/documents/upload
   ↓
JWT authentication
   ↓
Document metadata
   ↓
Document processing
   ↓
Text extraction
   ↓
Chunking
   ↓
DocumentChunk records
   ↓
Embeddings
   ↓
Vector store
   ↓
Ready for RAG

5. End-to-End Knowledge/RAG Flow

User asks a question
        ↓
POST /api/v1/rag/ask
        ↓
JWT validation
        ↓
Query normalization
        ↓
Query embedding
        ↓
Vector retrieval
        ↓
Expanded candidate set
        ↓
CrossEncoder reranking
        ↓
Top-K relevant chunks
        ↓
RAG answer generation
        ↓
Answer + sources
        ↓
Knowledge page

The retrieval pipeline intentionally gets more candidates than the final Top-K:

candidates = await VectorRetriever.search(
    db=db,
    query_embedding=query_embedding,
    user_id=user_id,
    top_k=max(top_k * 3, 10),
)

return Reranker.rerank(
    query=query,
    candidates=candidates,
    top_k=top_k,
)

This gives the reranker a larger candidate pool.

6. Reranking

The project uses:

cross-encoder/ms-marco-MiniLM-L-6-v2

Query/document pairs are scored:

pairs = [
    [query, candidate["document"]]
    for candidate in candidates
]

scores = cls._get_model().predict(pairs)

Candidates are sorted by rerank_score, and the final Top-K is returned.

7. Authentication

Normal login:

POST /api/v1/auth/login

JSON:

{
  "email": "user@example.com",
  "password": "your-password"
}

Response contains:

{
  "access_token": "JWT_ACCESS_TOKEN",
  "refresh_token": "JWT_REFRESH_TOKEN",
  "token_type": "bearer",
  "user_id": "UUID",
  "full_name": "User",
  "email": "user@example.com",
  "is_active": true,
  "is_verified": false
}

Access tokens contain the authenticated user's ID and email. Refresh tokens contain the user ID and are given a longer expiration.

Protected routes use:

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/token"
)

8. Swagger OAuth2 Solution

A key issue was that /auth/login accepts JSON while Swagger OAuth2 password authentication sends form data.

A dedicated endpoint was therefore added:

POST /api/v1/auth/token

It uses:

OAuth2PasswordRequestForm

and internally calls the existing login service:

result = await LoginService.login(
    db=db,
    email=form_data.username,
    password=form_data.password,
)

return {
    "access_token": result.access_token,
    "token_type": "bearer",
}

This makes Swagger's Authorize button compatible with the existing authentication service.

9. Chat Flow

Chat loads the authenticated conversation and previous messages:

conversation = await ConversationService.get_conversation(
    db=db,
    conversation_id=conversation_id,
    user_id=user_id,
)

History is converted into:

conversation_history = [
    {
        "sender_type": message.sender_type,
        "message": message.message,
    }
    for message in previous_messages
]

The user message is saved, then RAG is called:

rag_result = await RAGService.answer(
    db=db,
    query=query,
    user_id=user_id,
    conversation_history=conversation_history,
    top_k=top_k,
)

The assistant response is then stored as a message.

10. Main API Endpoints

Authentication

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/token
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

Documents

POST /api/v1/documents/upload

RAG

POST /api/v1/rag/ask

Example:

{
  "query": "What are the technical skills?",
  "top_k": 5
}

Chat

POST /api/v1/chat/{conversation_id}/message
GET  /api/v1/chat/{conversation_id}/messages
DELETE /api/v1/chat/{conversation_id}

Dashboard

GET /api/v1/dashboard/stats

Health

GET /api/v1/health/

11. Example RAG Response

{
  "query": "skills",
  "answer": "The uploaded document contains programming, data analysis, SQL, visualization and spreadsheet skills...",
  "sources": [
    {
      "document_id": "UUID",
      "chunk_index": 0,
      "distance": 0.677,
      "rerank_score": 0.286
    }
  ]
}

12. Project Structure

AetherAI/
├── .github/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── dependencies/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth/
│   │   │       │   ├── assistant/
│   │   │       │   ├── chat/
│   │   │       │   ├── dashboard/
│   │   │       │   ├── document/
│   │   │       │   ├── health/
│   │   │       │   └── rag/
│   │   │       └── router.py
│   │   ├── core/
│   │   ├── db/
│   │   │   ├── models/
│   │   │   └── session/
│   │   ├── rag/
│   │   │   ├── embeddings/
│   │   │   ├── pipelines/
│   │   │   ├── rerankers/
│   │   │   ├── retrievers/
│   │   │   └── vectorstore/
│   │   ├── schemas/
│   │   ├── security/
│   │   ├── services/
│   │   │   ├── auth/
│   │   │   ├── document/
│   │   │   └── rag/
│   │   └── workflows/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── alembic.ini
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── docs/
├── infrastructure/
├── scripts/
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md

13. Backend Layering

API Router
    ↓
Endpoint
    ↓
Schema / Validation
    ↓
Service Layer
    ↓
RAG / Database / Vector Store
    ↓
Persistence / AI Components

This keeps HTTP concerns, business logic, retrieval logic, and persistence separated.

14. Database and Migrations

The backend uses asynchronous SQLAlchemy sessions:

async def endpoint(
    db: AsyncSession = Depends(get_db),
):
    ...

Alembic manages database migrations:

alembic upgrade head

Document chunk support was introduced through:

backend/app/db/models/document_chunk.py
backend/alembic/versions/add_document_chunks.py

15. Local Setup

git clone https://github.com/910862KUMAR/AetherAI.git
cd AetherAI/backend
python -m venv .venv

Windows:

.\.venv\Scripts\Activate.ps1

Install:

pip install -r requirements.txt

Configure environment variables and run:

uvicorn app.main:app --reload

Swagger:

http://127.0.0.1:8000/docs

Frontend:

cd AetherAI/frontend
npm install
npm run dev

16. Docker

cd backend
docker compose up --build

Never commit production secrets into Docker files or source code.

17. Deployment

Frontend

GitHub → Vercel → React/Vite production app

Backend

GitHub → Render → FastAPI/Uvicorn

Production request

Browser
  ↓
Vercel
  ↓ HTTPS
Render FastAPI
  ├── JWT
  ├── Database
  ├── Document processing
  ├── Embeddings
  ├── Vector retrieval
  ├── Reranking
  └── RAG

18. Problems Encountered and Solutions

Swagger 422

Cause: Swagger OAuth2 sends form data but the original login endpoint expects JSON.

Solution: added /api/v1/auth/token using OAuth2PasswordRequestForm.

Local PostgreSQL DNS error

A direct local SQLAlchemy check produced:

socket.gaierror: [Errno 11001] getaddrinfo failed

This means the configured database hostname could not be resolved from that local environment. Local connectivity and deployed Render connectivity must be treated separately.

RAG 502

The RAG endpoint initially returned HTTP 502.

The service integration was corrected so the async database session is passed through the RAG flow:

rag_result = await RAGService.answer(
    db=db,
    query=query,
    user_id=user_id,
    conversation_history=conversation_history,
    top_k=top_k,
)

After deployment, /api/v1/rag/ask returned HTTP 200 and the Knowledge page displayed the document-grounded result.

Duplicate OpenAPI operation ID

Render logs showed a duplicate operation ID warning for a chat message route. This is an OpenAPI naming/documentation issue and should be cleaned up by ensuring route operation IDs are unique.

Document chunk support

Persistent document chunk support was added through the DocumentChunk model and Alembic migration.

19. Verified Production Flow

The following path has been manually verified:

Frontend
  ↓
Authentication
  ↓
JWT
  ↓
Document Upload
  ↓
Document Processing
  ↓
RAG Retrieval
  ↓
Cross-Encoder Reranking
  ↓
RAG Answer
  ↓
Sources
  ↓
Knowledge UI

The Knowledge/RAG flow is operational end-to-end.

20. Security

Never commit:

SECRET_KEY
DATABASE_URL
API keys
JWT access tokens
refresh tokens
passwords
production credentials

Use environment variables instead:

SECRET_KEY=your-secret
DATABASE_URL=your-database-url

Treat bearer tokens shown in Swagger or browser requests as sensitive.

21. Recommended Production Hardening

Unique OpenAPI operation IDs

Automated backend tests

Automated frontend tests

RAG evaluation dataset

Retrieval quality metrics

Reranker evaluation

Rate limiting

Structured logging

Secret redaction

Centralized error handling

File type/size validation

Malware scanning for uploads

Background jobs for heavy document processing

Object storage for production files

Vector-store lifecycle management

Token revocation/rotation strategy

Strong refresh-token storage

Role-based authorization coverage

CI/CD quality gates

Monitoring and alerting

22. Portfolio Value

AetherAI demonstrates:

Full-Stack Engineering
        +
FastAPI Backend
        +
React Frontend
        +
Authentication
        +
Database Design
        +
Document Intelligence
        +
Embeddings
        +
Vector Retrieval
        +
Reranking
        +
RAG
        +
Conversational AI
        +
Docker
        +
Cloud Deployment

Relevant technologies include Python, FastAPI, async SQLAlchemy, PostgreSQL, JWT/OAuth2, React, Vite, REST APIs, RAG, embeddings, vector search, cross-encoder reranking, Docker, Alembic, Git/GitHub, Vercel, and Render.

23. Interview Explanation

AetherAI is an enterprise AI knowledge and operations copilot built with React and FastAPI. Users authenticate with JWT, upload documents, and the backend processes those documents into chunks and embeddings. For a knowledge query, the system embeds the query, retrieves a larger candidate set from the vector store, reranks the candidates using a cross-encoder, and generates a grounded answer from the best context. Conversations and messages are stored using an asynchronous SQLAlchemy database layer. The frontend is deployed on Vercel and the FastAPI backend is deployed on Render.

24. Live Links

GitHub: https://github.com/910862KUMAR/AetherAI

Frontend: https://aether-ai4-kumar-gks-projects.vercel.app/knowledge

Backend: https://aetherai-4-ihek.onrender.com

Swagger: https://aetherai-4-ihek.onrender.com/docs

25. Demo Flow

1. Open frontend
2. Register / Login
3. Open Knowledge
4. Upload a PDF
5. Wait for processing
6. Ask a question
7. Show answer
8. Show sources
9. Open Swagger
10. Authorize using OAuth2
11. Run /rag/ask
12. Show HTTP 200
13. Open Chat
14. Create conversation
15. Send a knowledge question
16. Show conversation history

Repository

https://github.com/910862KUMAR/AetherAI
