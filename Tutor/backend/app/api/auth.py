"""
Authentication API endpoints.

This module provides:
- User signup (creates user + profile)
- User login (email/password authentication)
- JWT token generation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db_session
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse, UserResponse
from app.models.user import User, StudentProfile
from app.auth.utils import (
    hash_password,
    verify_password,
    create_user_token,
)
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: Session = Depends(get_db_session)):
    """
    Register a new user.

    Creates both a User account and StudentProfile with initial settings.

    Args:
        request: Signup details (name, email, password, level)
        db: Database session

    Returns:
        AuthResponse with JWT token and user info

    Raises:
        HTTPException 400: If email already exists
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        email=request.email,
        name=request.name,
        hashed_password=hash_password(request.password)
    )
    db.add(new_user)
    db.flush()  # Get user ID without committing

    # Create student profile
    new_profile = StudentProfile(
        user_id=new_user.id,
        level=request.level,
        current_chapter=None,
        current_lesson=None,
        learning_style=None
    )
    db.add(new_profile)

    try:
        db.commit()
        db.refresh(new_user)
        db.refresh(new_profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

    # Generate JWT token
    access_token = create_user_token(new_user)

    # Build response
    user_response = UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        level=new_profile.level,
        created_at=new_user.created_at
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db_session)):
    """
    Authenticate a user and return JWT token.

    Args:
        request: Login credentials (email, password)
        db: Database session

    Returns:
        AuthResponse with JWT token and user info

    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )

    # Get student profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Student profile not found"
        )

    # Generate JWT token
    access_token = create_user_token(user)

    # Build response
    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        level=profile.level,
        created_at=user.created_at
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    db: Session = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Get current authenticated user info.

    Args:
        db: Database session
        user: Current authenticated user

    Returns:
        UserResponse with user info

    Raises:
        HTTPException 404: If user not found
    """
    # Get student profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        level=profile.level,
        created_at=user.created_at
    )
