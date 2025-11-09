"""
Database connection and session management.

This module handles:
- Database initialization
- Session creation
- Connection management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
import os
from pathlib import Path

from app.models.user import Base

# Database configuration
DATABASE_PATH = os.getenv("DATABASE_PATH", "./data/tutorgpt.db")

# Ensure data directory exists
Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)

# Create database engine
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    echo=False  # Set to True for SQL debugging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """
    Initialize the database.

    Creates all tables if they don't exist.
    """
    Base.metadata.create_all(bind=engine)
    print(f"✅ Database initialized at: {DATABASE_PATH}")


def get_db() -> Session:
    """
    Get a database session.

    Yields:
        Session: SQLAlchemy session

    Usage:
        with get_db() as db:
            user = db.query(User).first()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for database sessions.

    Usage:
        with get_db_context() as db:
            user = db.query(User).filter_by(email="test@example.com").first()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency for FastAPI
def get_db_session():
    """
    FastAPI dependency for database sessions.

    Usage in routes:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db_session)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
