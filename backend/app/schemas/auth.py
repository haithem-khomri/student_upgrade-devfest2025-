"""
Authentication schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    level: Optional[str] = None
    modules: Optional[List[str]] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    level: Optional[str] = None
    modules: Optional[List[str]] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

