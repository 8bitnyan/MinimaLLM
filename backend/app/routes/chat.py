from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import os

from app.services.ai_service import get_ai_response, get_ai_response_with_search

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

class ChatMessage(BaseModel):
    message: str
    use_web_search: bool = False
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[Dict[str, Any]]] = None

@router.post("/", response_model=ChatResponse)
async def process_chat(chat_input: ChatMessage):
    try:
        if chat_input.use_web_search:
            response, sources = await get_ai_response_with_search(chat_input.message, chat_input.context)
            return ChatResponse(response=response, sources=sources)
        else:
            response = await get_ai_response(chat_input.message, chat_input.context)
            return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}") 