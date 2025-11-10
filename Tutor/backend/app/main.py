"""
TutorGPT FastAPI Application

Main FastAPI application for TutorGPT MVP.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.rag import router as rag_router
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.chat import router as chat_router
from app.api.websocket import router as ws_router
from app.api.analytics import router as analytics_router
from app.api.colearn import router as colearn_router
from app.database import init_db


# Create FastAPI app
app = FastAPI(
    title="TutorGPT API",
    description="AI-Native Software Development Tutor with RAG, Auth, Real-time Chat, and Analytics",
    version="0.3.0"
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    print("✅ Database initialized")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],  # Docusaurus dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(chat_router)
app.include_router(ws_router)  # WebSocket real-time chat
app.include_router(analytics_router)  # Analytics & recommendations
app.include_router(colearn_router)  # Co-Learning autonomous teaching
app.include_router(rag_router)  # Optional - for advanced use


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "TutorGPT API",
        "version": "0.3.0",
        "description": "AI-Native Software Development Tutor - Fully Featured Backend",
        "features": {
            "authentication": "JWT-based auth with bcrypt",
            "personalization": "Adaptive learning based on student profile",
            "chat": "Real-time WebSocket + HTTP chat with agent",
            "history": "Complete conversation history storage",
            "analytics": "Progress tracking and recommendations",
            "rag": "2,026 chunks from AI-Native book"
        },
        "endpoints": {
            "Authentication": {
                "signup": "POST /api/auth/signup",
                "login": "POST /api/auth/login",
                "me": "GET /api/auth/me"
            },
            "Profile": {
                "get": "GET /api/profile",
                "update": "PUT /api/profile",
                "complete": "POST /api/profile/complete"
            },
            "Chat": {
                "message": "POST /api/chat/message",
                "greeting": "GET /api/chat/greeting",
                "status": "GET /api/chat/status",
                "sessions": "GET /api/chat/sessions",
                "history": "GET /api/chat/history",
                "websocket": "WS /api/ws/chat?token=<jwt>"
            },
            "Analytics": {
                "progress": "GET /api/analytics/progress",
                "topics": "GET /api/analytics/topics",
                "performance": "GET /api/analytics/performance",
                "recommendations": "GET /api/analytics/recommendations"
            },
            "Documentation": "/docs"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
