"""
Chatbot router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.chat import ChatMessage
from app.schemas.chatbot import ChatRequest, ChatResponse, ChatMessageResponse
from app.services.ai.llm_service import LLMService

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message to the chatbot"""
    # Save user message
    user_message = ChatMessage(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    db.commit()
    
    # Get AI response
    llm_service = LLMService()
    context = {
        "user_level": current_user.level,
        "user_modules": current_user.modules or [],
        **(request.context or {}),
    }
    
    response_text = await llm_service.chat_completion(
        message=request.message,
        context=context,
        language=request.language,
        short_answer=request.shortAnswer or False,
    )
    
    # Save assistant message
    assistant_message = ChatMessage(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        role="assistant",
        content=response_text,
    )
    db.add(assistant_message)
    db.commit()
    
    return ChatResponse(
        message=response_text,
        explanation=None,  # Can add detailed explanation for desktop
    )


@router.get("/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
):
    """Get chat history for current user"""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [ChatMessageResponse.model_validate(msg) for msg in reversed(messages)]

