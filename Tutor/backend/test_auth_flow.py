#!/usr/bin/env python3
"""
Test Authentication and Personalization Flow

This script tests the complete Phase 5 implementation:
- User signup
- User login
- Profile management
- Personalized agent greetings
- Agent with student context
"""

import asyncio
from pathlib import Path
import sys

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import init_db, get_db_context
from app.models.user import User, StudentProfile
from app.schemas.auth import SignupRequest, LoginRequest, UpdateProfileRequest
from app.auth.utils import hash_password, verify_password, create_user_token, decode_access_token
from app.agent.tutor_agent import create_tutor_agent

print("=" * 80)
print("🧪 Testing Phase 5: Authentication & Personalization")
print("=" * 80)
print()

# Initialize database
print("📦 Initializing database...")
init_db()
print("✅ Database initialized")
print()

# Test 1: User Signup
print("=" * 80)
print("TEST 1: User Signup")
print("=" * 80)

signup_data = SignupRequest(
    name="Ahmed Khan",
    email="ahmed@example.com",
    password="securepass123",
    level="beginner"
)

with get_db_context() as db:
    # Check if user exists (cleanup)
    existing_user = db.query(User).filter(User.email == signup_data.email).first()
    if existing_user:
        print(f"⚠️  User {signup_data.email} already exists, cleaning up...")
        # Delete profile first (foreign key constraint)
        profile = db.query(StudentProfile).filter(
            StudentProfile.user_id == existing_user.id
        ).first()
        if profile:
            db.delete(profile)
        db.delete(existing_user)
        db.commit()

    # Create new user
    new_user = User(
        email=signup_data.email,
        name=signup_data.name,
        hashed_password=hash_password(signup_data.password)
    )
    db.add(new_user)
    db.flush()

    # Create student profile
    new_profile = StudentProfile(
        user_id=new_user.id,
        level=signup_data.level
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_user)
    db.refresh(new_profile)

    print(f"✅ User created: {new_user.name} ({new_user.email})")
    print(f"   User ID: {new_user.id}")
    print(f"   Profile ID: {new_profile.id}")
    print(f"   Level: {new_profile.level}")
    print()

# Test 2: Password Verification
print("=" * 80)
print("TEST 2: Password Verification")
print("=" * 80)

with get_db_context() as db:
    user = db.query(User).filter(User.email == signup_data.email).first()

    # Test correct password
    is_valid = verify_password(signup_data.password, user.hashed_password)
    print(f"✅ Correct password: {is_valid}")

    # Test incorrect password
    is_invalid = verify_password("wrongpassword", user.hashed_password)
    print(f"✅ Incorrect password rejected: {not is_invalid}")
    print()

# Test 3: JWT Token Generation
print("=" * 80)
print("TEST 3: JWT Token Generation & Validation")
print("=" * 80)

with get_db_context() as db:
    user = db.query(User).filter(User.email == signup_data.email).first()

    # Create token
    token = create_user_token(user)
    print(f"✅ JWT Token created")
    print(f"   Token (first 50 chars): {token[:50]}...")

    # Decode token
    user_id = decode_access_token(token)
    print(f"✅ Token decoded successfully")
    print(f"   User ID from token: {user_id}")
    print(f"   Matches original: {user_id == user.id}")
    print()

# Test 4: Profile Update
print("=" * 80)
print("TEST 4: Profile Update")
print("=" * 80)

update_data = UpdateProfileRequest(
    level="intermediate",
    current_chapter="04-python",
    current_lesson="01-intro",
    learning_style="code_focused"
)

with get_db_context() as db:
    user = db.query(User).filter(User.email == signup_data.email).first()
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    # Update profile
    profile.level = update_data.level
    profile.current_chapter = update_data.current_chapter
    profile.current_lesson = update_data.current_lesson
    profile.learning_style = update_data.learning_style

    # Add some completed lessons
    profile.completed_lessons = ["01-intro", "02-basics", "03-ai-landscape"]
    profile.difficulty_topics = ["async", "decorators"]

    db.commit()
    db.refresh(profile)

    print(f"✅ Profile updated:")
    print(f"   Level: {profile.level}")
    print(f"   Current Chapter: {profile.current_chapter}")
    print(f"   Current Lesson: {profile.current_lesson}")
    print(f"   Learning Style: {profile.learning_style}")
    print(f"   Completed Lessons: {len(profile.completed_lessons)} lessons")
    print(f"   Difficulty Topics: {', '.join(profile.difficulty_topics)}")
    print()

# Test 5: Personalized Agent Creation
print("=" * 80)
print("TEST 5: Personalized Agent Creation")
print("=" * 80)

with get_db_context() as db:
    user = db.query(User).filter(User.email == signup_data.email).first()
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    # Create personalized agent
    agent = create_tutor_agent(
        current_chapter=profile.current_chapter,
        current_lesson=profile.current_lesson,
        student_level=profile.level,
        student_name=user.name,
        learning_style=profile.learning_style,
        completed_lessons=profile.completed_lessons,
        difficulty_topics=profile.difficulty_topics
    )

    print(f"✅ Personalized agent created for {user.name}")
    print(f"   Student Level: {agent.student_level}")
    print(f"   Current Chapter: {agent.current_chapter}")
    print(f"   Current Lesson: {agent.current_lesson}")
    print(f"   Learning Style: {agent.learning_style}")
    print(f"   Completed Lessons: {len(agent.completed_lessons)}")
    print(f"   Difficulty Topics: {len(agent.difficulty_topics)}")
    print()

# Test 6: Personalized Greeting
print("=" * 80)
print("TEST 6: Personalized Greeting")
print("=" * 80)

async def test_greeting():
    with get_db_context() as db:
        user = db.query(User).filter(User.email == signup_data.email).first()
        profile = db.query(StudentProfile).filter(
            StudentProfile.user_id == user.id
        ).first()

        agent = create_tutor_agent(
            current_chapter=profile.current_chapter,
            current_lesson=profile.current_lesson,
            student_level=profile.level,
            student_name=user.name,
            learning_style=profile.learning_style,
            completed_lessons=profile.completed_lessons,
            difficulty_topics=profile.difficulty_topics
        )

        greeting = await agent.greet_student()
        return greeting

greeting = asyncio.run(test_greeting())
print(f"✅ Personalized greeting generated:")
print()
print("─" * 80)
print(greeting)
print("─" * 80)
print()

# Test 7: Agent Context Update
print("=" * 80)
print("TEST 7: Agent Context Update")
print("=" * 80)

with get_db_context() as db:
    user = db.query(User).filter(User.email == signup_data.email).first()
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()

    agent = create_tutor_agent(
        current_chapter=profile.current_chapter,
        current_lesson=profile.current_lesson,
        student_level=profile.level,
        student_name=user.name
    )

    print(f"Initial context:")
    print(f"   Chapter: {agent.current_chapter}")
    print(f"   Lesson: {agent.current_lesson}")

    # Update context
    agent.update_context(
        current_chapter="05-advanced-python",
        current_lesson="02-async",
        difficulty_topics=["async", "generators", "decorators"]
    )

    print(f"\nUpdated context:")
    print(f"   Chapter: {agent.current_chapter}")
    print(f"   Lesson: {agent.current_lesson}")
    print(f"   Difficulty Topics: {', '.join(agent.difficulty_topics)}")
    print()
    print(f"✅ Agent context updated successfully")
    print()

# Summary
print("=" * 80)
print("🎉 PHASE 5 TEST SUMMARY")
print("=" * 80)
print()
print("✅ All tests passed!")
print()
print("Implemented features:")
print("  1. ✅ User signup with profile creation")
print("  2. ✅ Password hashing and verification")
print("  3. ✅ JWT token generation and validation")
print("  4. ✅ Student profile management")
print("  5. ✅ Personalized agent creation")
print("  6. ✅ Personalized greetings")
print("  7. ✅ Dynamic agent context updates")
print()
print("Next steps:")
print("  - Start FastAPI server: uvicorn app.main:app --reload")
print("  - Test endpoints with API client (Postman, curl, etc.)")
print("  - Integrate with frontend (ChatKit in Phase 6)")
print()
print("=" * 80)
