"""
MongoDB Document Models using Pydantic

These models define the structure of documents stored in MongoDB collections.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    """Custom type for MongoDB ObjectId"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v, handler=None):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return v
        raise ValueError("Invalid ObjectId")


class MongoBaseModel(BaseModel):
    """Base model for MongoDB documents"""
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat(),
        }


# ============================================
# User Models
# ============================================

class UserDocument(MongoBaseModel):
    """User document stored in MongoDB"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    email: str
    hashed_password: str
    name: str
    level: Optional[str] = None
    modules: Optional[List[str]] = []
    preferences: Optional[Dict[str, Any]] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    is_active: bool = True


class UserCreate(BaseModel):
    """Model for creating a new user"""
    email: str
    password: str
    name: str
    level: Optional[str] = None


class UserResponse(MongoBaseModel):
    """User response model (without password)"""
    id: str
    email: str
    name: str
    level: Optional[str] = None
    modules: Optional[List[str]] = []
    created_at: datetime


# ============================================
# Chat Message Models
# ============================================

class ChatMessageDocument(MongoBaseModel):
    """Chat message document stored in MongoDB"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: Optional[str] = None  # None for anonymous/public chats
    session_id: Optional[str] = None  # For tracking conversation sessions
    role: str  # "user" or "assistant"
    content: str
    language: str = "ar"
    context: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatMessageCreate(BaseModel):
    """Model for creating a chat message"""
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    role: str
    content: str
    language: str = "ar"
    context: Optional[Dict[str, Any]] = None


class ChatMessageResponse(MongoBaseModel):
    """Chat message response model"""
    id: str
    role: str
    content: str
    created_at: datetime


# ============================================
# Module Models
# ============================================

class ModuleDocument(MongoBaseModel):
    """Module/Course document stored in MongoDB"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str
    name: str
    code: Optional[str] = None
    difficulty: Optional[int] = 5  # 1-10
    exam_date: Optional[datetime] = None
    progress: Optional[int] = 0  # 0-100
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class ModuleCreate(BaseModel):
    """Model for creating a module"""
    name: str
    code: Optional[str] = None
    difficulty: Optional[int] = 5
    exam_date: Optional[datetime] = None


class ModuleResponse(MongoBaseModel):
    """Module response model"""
    id: str
    name: str
    code: Optional[str] = None
    difficulty: int
    exam_date: Optional[datetime] = None
    progress: int
    created_at: datetime


# ============================================
# Resource Models
# ============================================

class ResourceDocument(MongoBaseModel):
    """Learning resource document stored in MongoDB"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    type: str  # "video", "pdf", "article", "link"
    url: str
    description: Optional[str] = None
    module_id: Optional[str] = None
    module_name: Optional[str] = None
    tags: Optional[List[str]] = []
    average_rating: Optional[float] = 0.0
    rating_count: Optional[int] = 0
    created_by: Optional[str] = None  # User ID who added it
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ResourceRatingDocument(MongoBaseModel):
    """Resource rating document stored in MongoDB"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    resource_id: str
    user_id: str
    rating: int  # 1-5
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================
# Generated Content Models
# ============================================

class GeneratedContentDocument(MongoBaseModel):
    """AI-generated content document stored in MongoDB"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    type: str  # "summary", "flashcards", "quiz", "exam-questions"
    source_content: Optional[str] = None  # Original content used for generation
    generated_content: Dict[str, Any]  # The generated content
    module_id: Optional[str] = None
    language: str = "ar"
    metadata: Optional[Dict[str, Any]] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================
# Study Session Models
# ============================================

class StudySessionDocument(MongoBaseModel):
    """Study session tracking document"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str
    module_id: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    activity_type: str  # "reading", "flashcards", "quiz", "video", etc.
    notes: Optional[str] = None
    mood: Optional[str] = None  # "low", "medium", "high"
    energy_level: Optional[int] = None  # 1-10
    created_at: datetime = Field(default_factory=datetime.utcnow)

