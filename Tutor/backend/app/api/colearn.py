"""
Co-Learning API - FULLY LLM-DRIVEN (NO static prompts!)
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any
import time
from datetime import datetime

from app.agent.colearning_agent import create_colearning_agent

router = APIRouter(prefix="/api/colearn", tags=["colearning"])

# Request/Response Models
class CoLearningRequest(BaseModel):
    action: str
    chapter: int
    section: Optional[str] = None
    text: Optional[str] = None
    language: Optional[str] = "en"
    userId: str
    studentAnswer: Optional[str] = None

class CoLearningResponse(BaseModel):
    message: str
    chapter: int
    metadata: Dict[str, Any]

# Active agents per session
active_agents: Dict[str, Any] = {}

def get_or_create_agent(user_id: str, profile: Optional[Dict] = None):
    """Get existing agent or create new one"""
    if user_id not in active_agents:
        active_agents[user_id] = create_colearning_agent(
            session_id=f"colearn_{user_id}",
            student_profile=profile or {}
        )
    return active_agents[user_id]

@router.post("/action", response_model=CoLearningResponse)
async def co_learning_action(request: CoLearningRequest):
    """
    Main co-learning action - 100% LLM-decided!
    NO hardcoded action prompts - agent decides everything!
    """
    try:
        profile = {
            'language': request.language,
            'current_chapter': request.chapter,
            'level': 'beginner'
        }
        agent = get_or_create_agent(request.userId, profile)
        
        if request.language:
            agent.update_profile({'language': request.language})
        
        # Just pass student message directly - NO static prompts!
        student_message = request.text or request.studentAnswer or "hello"
        
        # Let LLM decide EVERYTHING!
        result = await agent.teach(student_message)
        
        return CoLearningResponse(
            message=result['response'],
            chapter=result['chapter'],
            metadata=result['metadata']
        )
    except Exception as e:
        print(f"Error in co_learning_action: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    session_id: str = Query(...),
    chapter: int = Query(1),
    language: str = Query("en")
):
    """
    WebSocket for real-time teaching.
    100% LLM-driven - NO static responses!
    """
    await websocket.accept()
    print(f"✅ WebSocket connected: session={session_id}, chapter={chapter}")
    
    try:
        profile = {
            'language': language,
            'current_chapter': chapter,
            'level': 'beginner'
        }
        agent = get_or_create_agent(session_id, profile)
        
        await websocket.send_json({
            "type": "connected",
            "status": "connected",
            "message": "Co-Learning Tutor connected!",
            "session_id": session_id,
            "chapter": chapter
        })
        
        while True:
            data = await websocket.receive_json()
            message = data.get('message', '')
            chapter_override = data.get('chapter', chapter)
            
            if not message:
                await websocket.send_json({
                    "type": "error",
                    "message": "Message cannot be empty"
                })
                continue
            
            if chapter_override != chapter:
                chapter = chapter_override
                agent.update_profile({'current_chapter': chapter})
            
            await websocket.send_json({
                "type": "status",
                "status": "thinking",
                "message": "Agent is thinking..."
            })
            
            start_time = time.time()
            
            try:
                # 100% LLM-generated response!
                result = await agent.teach(message)
                response_time_ms = int((time.time() - start_time) * 1000)
                
                await websocket.send_json({
                    "type": "response",
                    "message": result['response'],
                    "chapter": result['chapter'],
                    "metadata": {
                        **result['metadata'],
                        'response_time_ms': response_time_ms,
                        'timestamp': datetime.now().isoformat()
                    }
                })
                
                await websocket.send_json({
                    "type": "status",
                    "status": "ready",
                    "message": "Ready for next question"
                })
                
                print(f"✅ Response sent: {response_time_ms}ms")
                
            except Exception as e:
                error_msg = str(e)
                print(f"❌ Error: {e}")
                
                # User-friendly error messages
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    msg = "⚠️ API Rate Limit Reached. Wait a few minutes or get new API key."
                elif "401" in error_msg or "UNAUTHENTICATED" in error_msg:
                    msg = "⚠️ Authentication Error. Check your API key."
                elif "timeout" in error_msg.lower():
                    msg = "⚠️ Request Timeout. Try a shorter question."
                else:
                    msg = f"⚠️ Error: {error_msg[:200]}"
                
                await websocket.send_json({"type": "error", "message": msg})
                await websocket.send_json({"type": "status", "status": "ready"})
                
    except WebSocketDisconnect:
        print(f"🔌 WebSocket disconnected: session={session_id}")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": f"Connection error: {str(e)}"})
        except:
            pass
    finally:
        try:
            await websocket.close()
            print(f"🔌 WebSocket closed: session={session_id}")
        except:
            pass

@router.get("/health")
async def health_check():
    """Check system health"""
    return {
        "status": "healthy",
        "active_sessions": len(active_agents),
        "version": "2.0.0-autonomous"
    }
