from fastapi import APIRouter

router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"],
)


@router.get("/")
async def evaluation():
    return {
        "message": "Model Evaluation",
    }


@router.post("/rag")
async def evaluate_rag():
    return {
        "message": "RAG Evaluation Completed",
    }


@router.post("/agent")
async def evaluate_agent():
    return {
        "message": "Agent Evaluation Completed",
    }