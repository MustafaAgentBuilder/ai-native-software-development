"""
Pydantic schemas for authentication and user management.

These schemas define the API contracts for:
- User signup/login
- Student profiles
- Authentication responses
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================================================
# Authentication Schemas
# ============================================================================

class SignupRequest(BaseModel):
    """Request schema for user signup."""
    name: str = Field(..., min_length=2, max_length=100, description="Student's full name")
    email: EmailStr = Field(..., description="Student's email address")
    password: str = Field(..., min_length=6, max_length=100, description="Password (min 6 characters)")
    level: str = Field(default="beginner", description="Learning level: beginner, intermediate, or advanced")

    @validator("level")
    def validate_level(cls, v):
        allowed_levels = ["beginner", "intermediate", "advanced"]
        if v not in allowed_levels:
            raise ValueError(f"Level must be one of: {', '.join(allowed_levels)}")
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Ahmed Khan",
                "email": "ahmed@example.com",
                "password": "securepassword123",
                "level": "beginner"
            }
        }


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    class Config:
        schema_extra = {
            "example": {
                "email": "ahmed@example.com",
                "password": "securepassword123"
            }
        }


class AuthResponse(BaseModel):
    """Response schema for successful authentication."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: "UserResponse" = Field(..., description="User information")

    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "user123",
                    "name": "Ahmed Khan",
                    "email": "ahmed@example.com",
                    "level": "beginner"
                }
            }
        }


# ============================================================================
# User Schemas
# ============================================================================

class UserResponse(BaseModel):
    """Response schema for user information."""
    id: str
    name: str
    email: str
    level: str
    created_at: datetime

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "user123",
                "name": "Ahmed Khan",
                "email": "ahmed@example.com",
                "level": "beginner",
                "created_at": "2024-01-15T10:30:00"
            }
        }


# ============================================================================
# Student Profile Schemas
# ============================================================================

class StudentProfileResponse(BaseModel):
    """Response schema for student profile."""
    id: str
    user_id: str
    level: str
    current_chapter: Optional[str] = None
    current_lesson: Optional[str] = None
    learning_style: Optional[str] = None
    completed_lessons: List[str] = []
    completed_chapters: List[str] = []
    difficulty_topics: List[str] = []
    total_questions_asked: int = 0
    total_time_minutes: int = 0
    last_active_at: datetime
    created_at: datetime

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "profile123",
                "user_id": "user123",
                "level": "beginner",
                "current_chapter": "04-python",
                "current_lesson": "variables",
                "learning_style": "visual",
                "completed_lessons": ["01-intro", "02-basics"],
                "completed_chapters": ["01-introducing-aidd"],
                "difficulty_topics": ["async", "decorators"],
                "total_questions_asked": 45,
                "total_time_minutes": 120,
                "last_active_at": "2024-01-15T14:30:00",
                "created_at": "2024-01-10T10:00:00"
            }
        }


class UpdateProfileRequest(BaseModel):
    """Request schema for updating student profile."""
    level: Optional[str] = None
    current_chapter: Optional[str] = None
    current_lesson: Optional[str] = None
    learning_style: Optional[str] = None

    @validator("level")
    def validate_level(cls, v):
        if v is not None:
            allowed_levels = ["beginner", "intermediate", "advanced"]
            if v not in allowed_levels:
                raise ValueError(f"Level must be one of: {', '.join(allowed_levels)}")
        return v

    @validator("learning_style")
    def validate_learning_style(cls, v):
        if v is not None:
            allowed_styles = ["visual", "code_focused", "explanation_focused"]
            if v not in allowed_styles:
                raise ValueError(f"Learning style must be one of: {', '.join(allowed_styles)}")
        return v

    class Config:
        schema_extra = {
            "example": {
                "level": "intermediate",
                "current_chapter": "04-python",
                "current_lesson": "async-await",
                "learning_style": "code_focused"
            }
        }


class CompleteEntityRequest(BaseModel):
    """Request schema for marking lesson/chapter as complete."""
    entity_type: str = Field(..., description="Type: 'lesson' or 'chapter'")
    entity_id: str = Field(..., description="ID of lesson or chapter")

    @validator("entity_type")
    def validate_entity_type(cls, v):
        allowed_types = ["lesson", "chapter"]
        if v not in allowed_types:
            raise ValueError(f"Entity type must be one of: {', '.join(allowed_types)}")
        return v

    class Config:
        schema_extra = {
            "example": {
                "entity_type": "lesson",
                "entity_id": "03-variables"
            }
        }


# Update forward references
AuthResponse.update_forward_refs()
