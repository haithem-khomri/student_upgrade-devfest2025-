"""
Content generator schemas
"""
from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime


class ContentGenerationRequest(BaseModel):
    type: str  # 'summary', 'flashcards', 'quiz', 'exam-questions', 'analysis'
    content: str
    moduleId: Optional[str] = None
    options: Optional[dict] = None


class GeneratedContentResponse(BaseModel):
    id: str
    type: str
    content: Any
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True

