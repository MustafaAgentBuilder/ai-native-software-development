"""
Analytics API endpoints.

This module provides:
- Learning progress tracking
- Topic analysis
- Performance metrics
- Smart recommendations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.database import get_db_session
from app.models.user import User, StudentProfile, ChatMessage, ChatSession
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


# Response schemas
class ProgressStats(BaseModel):
    """Learning progress statistics."""
    total_questions: int
    total_sessions: int
    completed_lessons: int
    completed_chapters: int
    current_streak_days: int
    total_learning_time_minutes: int
    average_response_time_ms: float
    questions_by_day: List[Dict[str, Any]]


class TopicAnalysis(BaseModel):
    """Topic learning analysis."""
    most_asked_topics: List[Dict[str, int]]
    difficulty_topics: List[str]
    mastered_topics: List[str]
    recommended_topics: List[str]


class PerformanceMetrics(BaseModel):
    """Learning performance metrics."""
    questions_this_week: int
    questions_last_week: int
    improvement_percentage: float
    average_session_length: float
    most_active_day: str
    most_active_hour: int
    helpful_responses_percentage: float


@router.get("/progress", response_model=ProgressStats)
async def get_progress_stats(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Get comprehensive learning progress statistics.

    Returns:
        Progress statistics including questions, sessions, streaks, etc.
    """
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    # Total questions
    total_questions = profile.total_questions_asked or 0

    # Total sessions
    total_sessions = db.query(func.count(ChatSession.id)).filter(
        ChatSession.user_id == user.id
    ).scalar() or 0

    # Completed lessons and chapters
    completed_lessons = len(profile.completed_lessons or [])
    completed_chapters = len(profile.completed_chapters or [])

    # Calculate streak (simplified - you can enhance this)
    current_streak_days = 0
    if profile.last_active_at:
        days_since_active = (datetime.utcnow() - profile.last_active_at).days
        if days_since_active == 0:
            # Active today, check previous days
            current_streak_days = 1  # Simplified
        else:
            current_streak_days = 0

    # Average response time
    avg_response_time = db.query(
        func.avg(ChatMessage.response_time_ms)
    ).filter(
        ChatMessage.user_id == user.id,
        ChatMessage.response_time_ms.isnot(None)
    ).scalar() or 0.0

    # Questions by day (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    questions_by_day_raw = db.query(
        func.date(ChatMessage.created_at).label('date'),
        func.count(ChatMessage.id).label('count')
    ).filter(
        ChatMessage.user_id == user.id,
        ChatMessage.created_at >= seven_days_ago
    ).group_by(
        func.date(ChatMessage.created_at)
    ).all()

    questions_by_day = [
        {"date": str(row.date), "count": row.count}
        for row in questions_by_day_raw
    ]

    return ProgressStats(
        total_questions=total_questions,
        total_sessions=total_sessions,
        completed_lessons=completed_lessons,
        completed_chapters=completed_chapters,
        current_streak_days=current_streak_days,
        total_learning_time_minutes=profile.total_time_minutes or 0,
        average_response_time_ms=float(avg_response_time),
        questions_by_day=questions_by_day
    )


@router.get("/topics", response_model=TopicAnalysis)
async def get_topic_analysis(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Analyze topics the student has been learning.

    Returns:
        Topic analysis including most asked, difficult, and mastered topics
    """
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    # Get all user messages
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).all()

    # Analyze topics (simplified - could use NLP for better analysis)
    topic_counts = {}
    for msg in messages:
        # Extract topics from context
        if msg.chapter_context:
            topic = msg.chapter_context
            topic_counts[topic] = topic_counts.get(topic, 0) + 1

    # Sort by frequency
    most_asked_topics = [
        {"topic": topic, "count": count}
        for topic, count in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    ]

    # Difficulty topics from profile
    difficulty_topics = profile.difficulty_topics or []

    # Mastered topics (completed chapters)
    mastered_topics = profile.completed_chapters or []

    # Recommended topics (topics not yet covered)
    all_topics = set(topic_counts.keys())
    covered_topics = set(mastered_topics)
    recommended_topics = list(all_topics - covered_topics)[:5]

    return TopicAnalysis(
        most_asked_topics=most_asked_topics,
        difficulty_topics=difficulty_topics,
        mastered_topics=mastered_topics,
        recommended_topics=recommended_topics
    )


@router.get("/performance", response_model=PerformanceMetrics)
async def get_performance_metrics(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Get performance metrics and learning patterns.

    Returns:
        Performance metrics including trends, active times, and feedback
    """
    # Questions this week
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    questions_this_week = db.query(func.count(ChatMessage.id)).filter(
        ChatMessage.user_id == user.id,
        ChatMessage.created_at >= one_week_ago
    ).scalar() or 0

    # Questions last week
    two_weeks_ago = datetime.utcnow() - timedelta(days=14)
    questions_last_week = db.query(func.count(ChatMessage.id)).filter(
        ChatMessage.user_id == user.id,
        ChatMessage.created_at >= two_weeks_ago,
        ChatMessage.created_at < one_week_ago
    ).scalar() or 0

    # Calculate improvement
    if questions_last_week > 0:
        improvement_percentage = ((questions_this_week - questions_last_week) / questions_last_week) * 100
    else:
        improvement_percentage = 100.0 if questions_this_week > 0 else 0.0

    # Average session length (in messages)
    avg_session_length = db.query(
        func.avg(ChatSession.message_count)
    ).filter(
        ChatSession.user_id == user.id
    ).scalar() or 0.0

    # Most active day (day of week)
    messages_by_dow = db.query(
        func.extract('dow', ChatMessage.created_at).label('dow'),
        func.count(ChatMessage.id).label('count')
    ).filter(
        ChatMessage.user_id == user.id
    ).group_by('dow').order_by(func.count(ChatMessage.id).desc()).first()

    dow_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    most_active_day = dow_names[int(messages_by_dow.dow)] if messages_by_dow else "Unknown"

    # Most active hour
    messages_by_hour = db.query(
        func.extract('hour', ChatMessage.created_at).label('hour'),
        func.count(ChatMessage.id).label('count')
    ).filter(
        ChatMessage.user_id == user.id
    ).group_by('hour').order_by(func.count(ChatMessage.id).desc()).first()

    most_active_hour = int(messages_by_hour.hour) if messages_by_hour else 0

    # Helpful responses percentage
    total_with_feedback = db.query(func.count(ChatMessage.id)).filter(
        ChatMessage.user_id == user.id,
        ChatMessage.helpful.isnot(None)
    ).scalar() or 0

    helpful_count = db.query(func.count(ChatMessage.id)).filter(
        ChatMessage.user_id == user.id,
        ChatMessage.helpful == True
    ).scalar() or 0

    helpful_percentage = (helpful_count / total_with_feedback * 100) if total_with_feedback > 0 else 0.0

    return PerformanceMetrics(
        questions_this_week=questions_this_week,
        questions_last_week=questions_last_week,
        improvement_percentage=improvement_percentage,
        average_session_length=float(avg_session_length),
        most_active_day=most_active_day,
        most_active_hour=most_active_hour,
        helpful_responses_percentage=helpful_percentage
    )


@router.get("/recommendations")
async def get_recommendations(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Get smart recommendations for what to study next.

    Returns:
        Personalized learning recommendations
    """
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    recommendations = {
        "next_lesson": None,
        "weak_topics": [],
        "suggested_review": [],
        "learning_path": []
    }

    # Next lesson recommendation
    if profile.current_lesson:
        recommendations["next_lesson"] = {
            "chapter": profile.current_chapter,
            "lesson": profile.current_lesson,
            "reason": "Continue from where you left off"
        }

    # Weak topics (from difficulty_topics)
    if profile.difficulty_topics:
        recommendations["weak_topics"] = [
            {
                "topic": topic,
                "reason": "You've marked this as challenging",
                "action": "Review and practice"
            }
            for topic in profile.difficulty_topics[:3]
        ]

    # Suggested review (lessons completed long ago)
    if profile.completed_lessons:
        recommendations["suggested_review"] = [
            {
                "lesson": lesson,
                "reason": "Completed - good for review"
            }
            for lesson in profile.completed_lessons[:3]
        ]

    # Learning path (based on level)
    level_paths = {
        "beginner": ["01-introducing-aidd", "02-ai-tool-landscape", "03-claude-code"],
        "intermediate": ["04-python", "05-advanced-python", "06-rag"],
        "advanced": ["07-agents", "08-deployment", "09-production"]
    }

    recommendations["learning_path"] = [
        {"chapter": chapter, "level": profile.level}
        for chapter in level_paths.get(profile.level, [])
    ]

    return recommendations
