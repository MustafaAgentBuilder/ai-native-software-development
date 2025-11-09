"""
FastAPI dependencies for authentication and authorization.

This module provides:
- JWT token validation
- Current user extraction
- Database session management
"""

from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db_session
from app.auth.utils import decode_access_token
from app.models.user import User, StudentProfile


async def get_current_user_id(
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Extract and validate user ID from JWT token.

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User ID from token

    Raises:
        HTTPException 401: If token is invalid or missing
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    user_id = decode_access_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id


async def get_current_user(
    db: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
) -> User:
    """
    Get current authenticated user from database.

    Args:
        db: Database session
        user_id: User ID from JWT token

    Returns:
        User object

    Raises:
        HTTPException 404: If user not found
        HTTPException 403: If user is not active
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )

    return user


async def get_current_student_profile(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
) -> StudentProfile:
    """
    Get current user's student profile from database.

    Args:
        db: Database session
        user: Current authenticated user

    Returns:
        StudentProfile object

    Raises:
        HTTPException 404: If profile not found
    """
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    return profile
