"""
Study decision schemas
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ModuleInput(BaseModel):
    id: str
    name: str
    difficulty: int  # 1-10
    examDate: Optional[str] = None  # ISO date string
    progress: Optional[int] = None  # 0-100


class StudyDecisionRequest(BaseModel):
    mood: str  # 'low', 'medium', 'high'
    energyLevel: int  # 1-10
    timeAvailable: int  # minutes
    modules: List[ModuleInput]


class StudyDecisionResponse(BaseModel):
    recommendedModule: dict
    recommendedActivity: str  # 'revise', 'practice', 'flashcards', 'summary'
    suggestedDuration: int  # minutes
    explanation: str
    confidence: float  # 0-1

