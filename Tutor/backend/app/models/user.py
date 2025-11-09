"""
Database models for user authentication and student profiles.

This module defines the SQLAlchemy models for:
- Users (authentication)
- Student Profiles (learning progress and preferences)
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship, declarative_base
import uuid

Base = declarative_base()


def generate_uuid():
    """Generate a UUID string."""
    return str(uuid.uuid4())


class User(Base):
    """
    User model for authentication.

    Stores basic authentication information.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False)
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


class StudentProfile(Base):
    """
    Student profile model for personalized learning.

    Stores learning preferences, progress, and personalization data.
    """
    __tablename__ = "student_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)

    # Learning level
    level = Column(String, default="beginner")  # beginner, intermediate, advanced

    # Current progress
    current_chapter = Column(String, nullable=True)
    current_lesson = Column(String, nullable=True)

    # Learning preferences (JSON)
    learning_style = Column(String, nullable=True)  # visual, code_focused, explanation_focused
    preferences = Column(JSON, default=dict)  # {"prefers_examples": true, "detail_level": "high"}

    # Progress tracking (JSON)
    completed_lessons = Column(JSON, default=list)  # ["01-intro", "02-basics", ...]
    completed_chapters = Column(JSON, default=list)  # ["01-introducing-aidd", ...]
    difficulty_topics = Column(JSON, default=list)  # ["async", "decorators"]

    # Statistics
    total_questions_asked = Column(Integer, default=0)
    total_time_minutes = Column(Integer, default=0)
    last_active_at = Column(DateTime, default=datetime.utcnow)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to user
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<StudentProfile(user_id={self.user_id}, level={self.level})>"


class ChatSession(Base):
    """
    Chat session model for conversation tracking.

    Links chat sessions to users and tracks conversation metadata.
    """
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Session context
    chapter_context = Column(String, nullable=True)
    lesson_context = Column(String, nullable=True)
    page_context = Column(JSON, default=dict)  # {"page_path": "/docs/...", "section": "..."}

    # Session metadata
    message_count = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def __repr__(self):
        return f"<ChatSession(id={self.id}, user_id={self.user_id}, messages={self.message_count})>"


class ChatMessage(Base):
    """
    Chat message model for conversation history.

    Stores individual messages and responses in conversations.
    """
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    # Message content
    user_message = Column(Text, nullable=False)  # Student's question
    agent_response = Column(Text, nullable=False)  # Agent's answer

    # Context at time of message
    chapter_context = Column(String, nullable=True)
    lesson_context = Column(String, nullable=True)

    # Metadata
    response_time_ms = Column(Integer, nullable=True)  # How long agent took to respond
    tools_used = Column(JSON, default=list)  # Which tools the agent used (e.g., ["search_book_content"])
    rag_results_count = Column(Integer, default=0)  # How many RAG results were found

    # Feedback (optional - for future)
    helpful = Column(Boolean, nullable=True)  # Was this response helpful?
    feedback_text = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="chat_messages")
    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, session_id={self.session_id}, user_message='{self.user_message[:50]}...')>"
