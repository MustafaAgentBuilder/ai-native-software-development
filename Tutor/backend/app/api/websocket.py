"""
WebSocket API for real-time chat.

This module provides:
- WebSocket connection for real-time bidirectional communication
- Instant message delivery
- Connection status tracking
- Typing indicators (future)
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import json
import time

from app.database import get_db_context
from app.models.user import User, StudentProfile, ChatSession, ChatMessage
from app.auth.utils import decode_access_token
from app.agent.tutor_agent import create_tutor_agent

router = APIRouter(prefix="/api/ws", tags=["websocket"])


async def get_user_from_token(token: str) -> User:
    """
    Authenticate user from JWT token.

    Args:
        token: JWT token string

    Returns:
        User object

    Raises:
        Exception: If token is invalid
    """
    payload = decode_access_token(token)
    if not payload:
        raise Exception("Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise Exception("Invalid token payload")

    with get_db_context() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise Exception("User not found")

        return user


@router.websocket("/chat")
async def websocket_chat(
    websocket: WebSocket,
    token: str = Query(..., description="JWT authentication token")
):
    """
    WebSocket endpoint for real-time chat.

    Usage:
        const ws = new WebSocket(`ws://localhost:8000/api/ws/chat?token=${jwt_token}`);

        // Send message
        ws.send(JSON.stringify({
            type: "message",
            message: "What is Python?",
            session_id: "session_123",
            current_chapter: "04-python",
            current_lesson: "01-intro"
        }));

        // Receive response
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data.response);
        };

    Args:
        websocket: WebSocket connection
        token: JWT authentication token

    Message Format:
        Client -> Server:
        {
            "type": "message",
            "message": "student question",
            "session_id": "optional_session_id",
            "current_chapter": "optional_chapter",
            "current_lesson": "optional_lesson"
        }

        Server -> Client:
        {
            "type": "response",
            "response": "agent answer",
            "session_id": "session_id",
            "message_id": "message_id",
            "response_time_ms": 1234,
            "timestamp": "2024-01-15T10:30:00"
        }

        Server -> Client (Error):
        {
            "type": "error",
            "error": "error message"
        }

        Server -> Client (Status):
        {
            "type": "status",
            "status": "connected|thinking|ready"
        }
    """
    # Authenticate user
    try:
        user = await get_user_from_token(token)
    except Exception as e:
        await websocket.close(code=1008, reason=f"Authentication failed: {str(e)}")
        return

    # Accept connection
    await websocket.accept()

    # Send connection confirmation
    await websocket.send_json({
        "type": "status",
        "status": "connected",
        "user_name": user.name,
        "message": f"Welcome {user.name}! You're connected to TutorGPT."
    })

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            # Validate message type
            if data.get("type") != "message":
                await websocket.send_json({
                    "type": "error",
                    "error": "Invalid message type. Expected 'message'."
                })
                continue

            message = data.get("message")
            if not message:
                await websocket.send_json({
                    "type": "error",
                    "error": "Message cannot be empty"
                })
                continue

            # Get context
            session_id = data.get("session_id")
            current_chapter = data.get("current_chapter")
            current_lesson = data.get("current_lesson")

            # Send "thinking" status
            await websocket.send_json({
                "type": "status",
                "status": "thinking",
                "message": "TutorGPT is thinking..."
            })

            # Process with database context
            with get_db_context() as db:
                # Get user profile
                profile = db.query(StudentProfile).filter(
                    StudentProfile.user_id == user.id
                ).first()

                if not profile:
                    await websocket.send_json({
                        "type": "error",
                        "error": "Student profile not found"
                    })
                    continue

                # Use provided context or fall back to profile context
                chapter = current_chapter or profile.current_chapter
                lesson = current_lesson or profile.current_lesson

                # Get or create session
                if not session_id:
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
                    chat_session = db.query(ChatSession).filter(
                        ChatSession.id == session_id
                    ).first()

                    if not chat_session:
                        chat_session = ChatSession(
                            id=session_id,
                            user_id=user.id,
                            chapter_context=chapter,
                            lesson_context=lesson,
                            message_count=0
                        )
                        db.add(chat_session)

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

                # Get response from agent (measure time)
                start_time = time.time()
                try:
                    agent_response = await agent.teach(
                        student_message=message,
                        session_id=session_id
                    )
                    response_time_ms = int((time.time() - start_time) * 1000)
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "error": f"Agent error: {str(e)}"
                    })
                    continue

                # Save message to database
                chat_message = ChatMessage(
                    session_id=session_id,
                    user_id=user.id,
                    user_message=message,
                    agent_response=agent_response,
                    chapter_context=chapter,
                    lesson_context=lesson,
                    response_time_ms=response_time_ms
                )
                db.add(chat_message)

                # Update session metadata
                chat_session.message_count = (chat_session.message_count or 0) + 1
                chat_session.last_message_at = datetime.utcnow()

                # Update student stats
                profile.total_questions_asked = (profile.total_questions_asked or 0) + 1
                profile.last_active_at = datetime.utcnow()

                # Update context if provided
                if current_chapter:
                    profile.current_chapter = current_chapter
                if current_lesson:
                    profile.current_lesson = current_lesson

                try:
                    db.commit()
                    db.refresh(chat_message)
                except Exception as e:
                    db.rollback()
                    await websocket.send_json({
                        "type": "error",
                        "error": f"Failed to save conversation: {str(e)}"
                    })
                    continue

                # Send response to client
                await websocket.send_json({
                    "type": "response",
                    "response": agent_response,
                    "session_id": session_id,
                    "message_id": chat_message.id,
                    "response_time_ms": response_time_ms,
                    "timestamp": datetime.utcnow().isoformat()
                })

                # Send ready status
                await websocket.send_json({
                    "type": "status",
                    "status": "ready",
                    "message": "Ready for next question"
                })

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user {user.id}")
    except Exception as e:
        print(f"WebSocket error for user {user.id}: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "error": f"Connection error: {str(e)}"
            })
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass
