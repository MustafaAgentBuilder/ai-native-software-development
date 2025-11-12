"""TutorGPT Agent - OpenRouter with DeepSeek!"""
import os
from typing import Optional
from agents import Agent, Runner, SQLiteSession, AsyncOpenAI, OpenAIChatCompletionsModel, set_tracing_disabled
from dotenv import load_dotenv
from app.agent.personality import AgentPersonality
from app.agent.prompts.core_instructions import get_core_instructions
from app.tools.teaching_tools import TUTORGPT_TOOLS

load_dotenv()
set_tracing_disabled(True)

# API Configuration - Automatically reads from .env
# Change API provider and model in .env file, no code changes needed!
Provider = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url=os.getenv("API_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/"),
)

model = OpenAIChatCompletionsModel(
    model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"),
    openai_client=Provider,
)

class TutorGPTAgent:
    """Sidebar Agent with OpenRouter and RAG"""
    def __init__(self, current_chapter: Optional[str] = None, current_lesson: Optional[str] = None,
                 student_level: str = "beginner", student_name: Optional[str] = None,
                 learning_style: Optional[str] = None, completed_lessons: Optional[list] = None,
                 difficulty_topics: Optional[list] = None, is_new_student: bool = True,
                 last_session_info: Optional[str] = None):
        self.personality = AgentPersonality()
        self.current_chapter = current_chapter
        self.current_lesson = current_lesson
        self.student_level = student_level
        self.student_name = student_name
        self.learning_style = learning_style
        self.completed_lessons = completed_lessons or []
        self.difficulty_topics = difficulty_topics or []
        self.is_new_student = is_new_student
        self.last_session_info = last_session_info
        
        instructions = get_core_instructions(
            current_chapter=current_chapter, current_lesson=current_lesson,
            student_level=student_level, student_name=student_name,
            learning_style=learning_style, completed_lessons=completed_lessons,
            difficulty_topics=difficulty_topics, is_new_student=is_new_student,
            last_session_info=last_session_info
        )
        
        self.agent = Agent(name="TutorGPT", instructions=instructions, tools=TUTORGPT_TOOLS, model=model)

    async def teach(self, student_message: str, session_id: str = "default") -> str:
        session = SQLiteSession(session_id)
        result = await Runner.run(self.agent, input=student_message, session=session)
        return result.final_output

    def teach_sync(self, student_message: str, session_id: str = "default") -> str:
        session = SQLiteSession(session_id)
        result = Runner.run_sync(self.agent, input=student_message, session=session)
        return result.final_output

    def update_context(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key) and value is not None:
                setattr(self, key, value)
        
        instructions = get_core_instructions(
            current_chapter=self.current_chapter, current_lesson=self.current_lesson,
            student_level=self.student_level, student_name=self.student_name,
            learning_style=self.learning_style, completed_lessons=self.completed_lessons,
            difficulty_topics=self.difficulty_topics, is_new_student=self.is_new_student,
            last_session_info=self.last_session_info
        )
        self.agent = Agent(name="TutorGPT", instructions=instructions, tools=TUTORGPT_TOOLS, model=model)

def create_tutor_agent(**kwargs) -> TutorGPTAgent:
    return TutorGPTAgent(**kwargs)
