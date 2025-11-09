"""
Student Profile API endpoints.

This module provides:
- Get student profile
- Update student profile
- Mark lessons/chapters as complete
- Track learning progress
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db_session
from app.schemas.auth import (
    StudentProfileResponse,
    UpdateProfileRequest,
    CompleteEntityRequest
)
from app.models.user import User, StudentProfile
from app.api.dependencies import get_current_user, get_current_student_profile

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=StudentProfileResponse)
async def get_profile(
    profile: StudentProfile = Depends(get_current_student_profile)
):
    """
    Get current user's student profile.

    Args:
        profile: Current student profile (from JWT)

    Returns:
        StudentProfileResponse with all profile data
    """
    return StudentProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        level=profile.level,
        current_chapter=profile.current_chapter,
        current_lesson=profile.current_lesson,
        learning_style=profile.learning_style,
        completed_lessons=profile.completed_lessons or [],
        completed_chapters=profile.completed_chapters or [],
        difficulty_topics=profile.difficulty_topics or [],
        total_questions_asked=profile.total_questions_asked,
        total_time_minutes=profile.total_time_minutes,
        last_active_at=profile.last_active_at,
        created_at=profile.created_at
    )


@router.put("", response_model=StudentProfileResponse)
async def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
    profile: StudentProfile = Depends(get_current_student_profile)
):
    """
    Update current user's student profile.

    Args:
        request: Profile update data
        db: Database session
        user: Current authenticated user
        profile: Current student profile

    Returns:
        Updated StudentProfileResponse

    Raises:
        HTTPException 400: If validation fails
    """
    # Update fields if provided
    if request.level is not None:
        profile.level = request.level

    if request.current_chapter is not None:
        profile.current_chapter = request.current_chapter

    if request.current_lesson is not None:
        profile.current_lesson = request.current_lesson

    if request.learning_style is not None:
        profile.learning_style = request.learning_style

    # Update last active timestamp
    profile.last_active_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

    return StudentProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        level=profile.level,
        current_chapter=profile.current_chapter,
        current_lesson=profile.current_lesson,
        learning_style=profile.learning_style,
        completed_lessons=profile.completed_lessons or [],
        completed_chapters=profile.completed_chapters or [],
        difficulty_topics=profile.difficulty_topics or [],
        total_questions_asked=profile.total_questions_asked,
        total_time_minutes=profile.total_time_minutes,
        last_active_at=profile.last_active_at,
        created_at=profile.created_at
    )


@router.post("/complete", response_model=StudentProfileResponse)
async def mark_complete(
    request: CompleteEntityRequest,
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
    profile: StudentProfile = Depends(get_current_student_profile)
):
    """
    Mark a lesson or chapter as complete.

    Args:
        request: Entity completion data (type and ID)
        db: Database session
        user: Current authenticated user
        profile: Current student profile

    Returns:
        Updated StudentProfileResponse

    Raises:
        HTTPException 400: If entity already completed or invalid type
    """
    entity_id = request.entity_id

    if request.entity_type == "lesson":
        # Check if already completed
        if entity_id in (profile.completed_lessons or []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lesson '{entity_id}' already marked as complete"
            )

        # Add to completed lessons
        if profile.completed_lessons is None:
            profile.completed_lessons = []
        profile.completed_lessons.append(entity_id)

    elif request.entity_type == "chapter":
        # Check if already completed
        if entity_id in (profile.completed_chapters or []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Chapter '{entity_id}' already marked as complete"
            )

        # Add to completed chapters
        if profile.completed_chapters is None:
            profile.completed_chapters = []
        profile.completed_chapters.append(entity_id)

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid entity type: {request.entity_type}"
        )

    # Update last active timestamp
    profile.last_active_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark complete: {str(e)}"
        )

    return StudentProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        level=profile.level,
        current_chapter=profile.current_chapter,
        current_lesson=profile.current_lesson,
        learning_style=profile.learning_style,
        completed_lessons=profile.completed_lessons or [],
        completed_chapters=profile.completed_chapters or [],
        difficulty_topics=profile.difficulty_topics or [],
        total_questions_asked=profile.total_questions_asked,
        total_time_minutes=profile.total_time_minutes,
        last_active_at=profile.last_active_at,
        created_at=profile.created_at
    )


@router.post("/difficulty/{topic}", response_model=StudentProfileResponse)
async def add_difficulty_topic(
    topic: str,
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
    profile: StudentProfile = Depends(get_current_student_profile)
):
    """
    Add a topic to the student's difficulty list.

    This helps track which topics the student finds challenging.

    Args:
        topic: Topic name (e.g., "async", "decorators")
        db: Database session
        user: Current authenticated user
        profile: Current student profile

    Returns:
        Updated StudentProfileResponse
    """
    # Check if already in difficulty topics
    if topic in (profile.difficulty_topics or []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Topic '{topic}' already in difficulty list"
        )

    # Add to difficulty topics
    if profile.difficulty_topics is None:
        profile.difficulty_topics = []
    profile.difficulty_topics.append(topic)

    # Update last active timestamp
    profile.last_active_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add difficulty topic: {str(e)}"
        )

    return StudentProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        level=profile.level,
        current_chapter=profile.current_chapter,
        current_lesson=profile.current_lesson,
        learning_style=profile.learning_style,
        completed_lessons=profile.completed_lessons or [],
        completed_chapters=profile.completed_chapters or [],
        difficulty_topics=profile.difficulty_topics or [],
        total_questions_asked=profile.total_questions_asked,
        total_time_minutes=profile.total_time_minutes,
        last_active_at=profile.last_active_at,
        created_at=profile.created_at
    )
