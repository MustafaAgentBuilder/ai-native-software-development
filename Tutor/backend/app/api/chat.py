"""
Chat API endpoints.

This module provides:
- Chat with personalized TutorGPT agent
- Real-time Q&A with book content
- Session management and conversation history
- Automatic profile updates (questions asked, time spent, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

from app.database import get_db_session
from app.models.user import User, StudentProfile, ChatSession, ChatMessage
from app.api.dependencies import get_current_user
from app.agent.tutor_agent import create_tutor_agent
import time

router = APIRouter(prefix="/api/chat", tags=["chat"])


# Request/Response schemas
class ChatRequest(BaseModel):
    """Chat message request."""
    message: str = Field(..., min_length=1, max_length=2000, description="Student's question or message")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    current_chapter: Optional[str] = Field(None, description="Current chapter (if on specific page)")
    current_lesson: Optional[str] = Field(None, description="Current lesson (if on specific page)")


class ChatResponse(BaseModel):
    """Chat message response."""
    response: str = Field(..., description="Agent's response")
    session_id: str = Field(..., description="Session ID for this conversation")
    user_name: str = Field(..., description="Student's name")
    student_level: str = Field(..., description="Student's current level")


class GreetingResponse(BaseModel):
    """Personalized greeting response."""
    greeting: str = Field(..., description="Personalized greeting message")
    user_name: str = Field(..., description="Student's name")
    student_level: str = Field(..., description="Student's level")
    completed_lessons_count: int = Field(..., description="Number of completed lessons")


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Send a message to the personalized TutorGPT agent.

    This endpoint:
    1. Gets the student's profile from database
    2. Creates a personalized agent with their learning preferences
    3. Sends the message to the agent
    4. Updates student stats (questions asked, last active time)
    5. Returns the agent's response

    Args:
        request: Chat message and optional context
        db: Database session
        user: Current authenticated user

    Returns:
        ChatResponse with agent's answer

    Example:
        POST /api/chat/message
        Headers: Authorization: Bearer <token>
        Body: {"message": "What is Python?", "current_chapter": "04-python"}
    """
    # Get student profile
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    # Use request context or fall back to profile context
    chapter = request.current_chapter or profile.current_chapter
    lesson = request.current_lesson or profile.current_lesson

    # Create personalized agent
    agent = create_tutor_agent(
        current_chapter=chapter,
        current_lesson=lesson,
        student_level=profile.level,
        student_name=user.name,
        learning_style=profile.learning_style,
        completed_lessons=profile.completed_lessons or [],
        difficulty_topics=profile.difficulty_topics or []
    )

    # Get or create session
    session_id = request.session_id
    if not session_id:
        # Create new session
        session_id = f"session_{user.id}_{int(datetime.utcnow().timestamp())}"
        chat_session = ChatSession(
            id=session_id,
            user_id=user.id,
            chapter_context=chapter,
            lesson_context=lesson,
            message_count=0
        )
        db.add(chat_session)
    else:
        # Get existing session
        chat_session = db.query(ChatSession).filter(
            ChatSession.id == session_id
        ).first()

        if not chat_session:
            # Session not found, create it
            chat_session = ChatSession(
                id=session_id,
                user_id=user.id,
                chapter_context=chapter,
                lesson_context=lesson,
                message_count=0
            )
            db.add(chat_session)

    # Get response from agent (measure time)
    start_time = time.time()
    try:
        agent_response = await agent.teach(
            student_message=request.message,
            session_id=session_id
        )
        response_time_ms = int((time.time() - start_time) * 1000)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent error: {str(e)}"
        )

    # Save message to database
    chat_message = ChatMessage(
        session_id=session_id,
        user_id=user.id,
        user_message=request.message,
        agent_response=agent_response,
        chapter_context=chapter,
        lesson_context=lesson,
        response_time_ms=response_time_ms,
        tools_used=[],  # TODO: Track which tools agent used
        rag_results_count=0  # TODO: Track RAG results
    )
    db.add(chat_message)

    # Update session metadata
    chat_session.message_count = (chat_session.message_count or 0) + 1
    chat_session.last_message_at = datetime.utcnow()

    # Update student stats
    profile.total_questions_asked = (profile.total_questions_asked or 0) + 1
    profile.last_active_at = datetime.utcnow()

    # Update current context if provided
    if request.current_chapter:
        profile.current_chapter = request.current_chapter
    if request.current_lesson:
        profile.current_lesson = request.current_lesson

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save conversation: {str(e)}"
        )

    return ChatResponse(
        response=agent_response,
        session_id=session_id,
        user_name=user.name,
        student_level=profile.level
    )


@router.get("/greeting", response_model=GreetingResponse)
async def get_greeting(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Get a personalized greeting for the authenticated user.

    This endpoint:
    1. Gets the student's profile
    2. Creates a personalized agent
    3. Generates a warm, encouraging greeting

    Args:
        db: Database session
        user: Current authenticated user

    Returns:
        GreetingResponse with personalized greeting

    Example:
        GET /api/chat/greeting
        Headers: Authorization: Bearer <token>
    """
    # Get student profile
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    # Create personalized agent
    agent = create_tutor_agent(
        current_chapter=profile.current_chapter,
        current_lesson=profile.current_lesson,
        student_level=profile.level,
        student_name=user.name,
        learning_style=profile.learning_style,
        completed_lessons=profile.completed_lessons or [],
        difficulty_topics=profile.difficulty_topics or []
    )

    # Generate greeting
    greeting = await agent.greet_student()

    # Update last active time
    profile.last_active_at = datetime.utcnow()
    try:
        db.commit()
    except Exception:
        db.rollback()

    return GreetingResponse(
        greeting=greeting,
        user_name=user.name,
        student_level=profile.level,
        completed_lessons_count=len(profile.completed_lessons or [])
    )


@router.get("/status")
async def get_chat_status(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Get current chat/learning status for the user.

    Returns:
        User's profile info and learning stats
    """
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    return {
        "user_name": user.name,
        "email": user.email,
        "level": profile.level,
        "current_chapter": profile.current_chapter,
        "current_lesson": profile.current_lesson,
        "learning_style": profile.learning_style,
        "total_questions_asked": profile.total_questions_asked or 0,
        "completed_lessons_count": len(profile.completed_lessons or []),
        "difficulty_topics": profile.difficulty_topics or [],
        "last_active_at": profile.last_active_at
    }

# ============================================================================
# Chat History Endpoints
# ============================================================================

from typing import List

class MessageResponse(BaseModel):
    """Single message in conversation history."""
    id: str
    user_message: str
    agent_response: str
    chapter_context: Optional[str]
    lesson_context: Optional[str]
    response_time_ms: Optional[int]
    helpful: Optional[bool]
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class SessionResponse(BaseModel):
    """Chat session summary."""
    id: str
    chapter_context: Optional[str]
    lesson_context: Optional[str]
    message_count: int
    started_at: datetime
    last_message_at: datetime

    model_config = {
        "from_attributes": True
    }


@router.get("/sessions", response_model=List[SessionResponse])
async def get_chat_sessions(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0
):
    """
    Get all chat sessions for the current user.

    Args:
        db: Database session
        user: Current authenticated user
        limit: Maximum number of sessions to return
        offset: Number of sessions to skip

    Returns:
        List of chat sessions
    """
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user.id
    ).order_by(
        ChatSession.last_message_at.desc()
    ).limit(limit).offset(offset).all()

    return sessions


@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_session_messages(
    session_id: str,
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Get all messages in a specific chat session.

    Args:
        session_id: Chat session ID
        db: Database session
        user: Current authenticated user

    Returns:
        List of messages in the session

    Raises:
        HTTPException 403: If session doesn't belong to user
        HTTPException 404: If session not found
    """
    # Verify session belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    # Get all messages
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(
        ChatMessage.created_at.asc()
    ).all()

    return messages


@router.get("/history", response_model=List[MessageResponse])
async def get_all_chat_history(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """
    Get recent chat history across all sessions.

    Args:
        db: Database session
        user: Current authenticated user
        limit: Maximum number of messages to return
        offset: Number of messages to skip

    Returns:
        List of recent messages
    """
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).order_by(
        ChatMessage.created_at.desc()
    ).limit(limit).offset(offset).all()

    return messages


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Delete a chat session and all its messages.

    Args:
        session_id: Chat session ID
        db: Database session
        user: Current authenticated user

    Returns:
        Success message

    Raises:
        HTTPException 403: If session doesn't belong to user
        HTTPException 404: If session not found
    """
    # Verify session belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    # Delete session (cascade will delete messages)
    db.delete(session)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete session: {str(e)}"
        )

    return {"message": "Chat session deleted successfully"}


@router.post("/messages/{message_id}/feedback")
async def submit_message_feedback(
    message_id: str,
    helpful: bool,
    feedback_text: Optional[str] = None,
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Submit feedback for a specific message.

    Args:
        message_id: Message ID
        helpful: Was this response helpful?
        feedback_text: Optional feedback text
        db: Database session
        user: Current authenticated user

    Returns:
        Success message

    Raises:
        HTTPException 403: If message doesn't belong to user
        HTTPException 404: If message not found
    """
    # Verify message belongs to user
    message = db.query(ChatMessage).filter(
        ChatMessage.id == message_id,
        ChatMessage.user_id == user.id
    ).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    # Update feedback
    message.helpful = helpful
    if feedback_text:
        message.feedback_text = feedback_text

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )

    return {"message": "Feedback submitted successfully"}
