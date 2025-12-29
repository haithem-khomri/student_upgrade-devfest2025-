"""
Chatbot schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None
    language: str = "en"  # 'en', 'ar', 'fr'
    shortAnswer: Optional[bool] = False


class ChatResponse(BaseModel):
    message: str
    explanation: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

