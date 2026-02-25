from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.gemini_service import ask_gemini

router = APIRouter()


# Request model
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []


@router.post("/chat")
async def chat(payload: ChatRequest):

    if not payload.message:
        return {"error": "Message is required"}

    # Send message + history to Gemini
    reply = await ask_gemini(payload.message, payload.history)

    return {"reply": reply}
