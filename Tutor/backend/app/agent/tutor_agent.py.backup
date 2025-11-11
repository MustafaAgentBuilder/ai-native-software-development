"""
TutorGPT Autonomous Agent - TRUE AGENTIC SYSTEM

This module creates the autonomous TutorGPT agent using OpenAI Agents SDK.

KEY PRINCIPLE: The LLM (agent) autonomously decides which tools to use based
on the student's question and the instructions. NO HARDCODED LOGIC!

The agent is the BRAIN - it thinks, decides, and acts autonomously.
"""

import os
from typing import Optional
from agents import Agent, Runner, SQLiteSession, AsyncOpenAI, OpenAIChatCompletionsModel, set_tracing_disabled
from dotenv import load_dotenv

from app.agent.personality import AgentPersonality
from app.agent.prompts.core_instructions import get_core_instructions
from app.tools.teaching_tools import TUTORGPT_TOOLS

# Load environment variables
load_dotenv()

# Disable tracing for faster responses (optional)
set_tracing_disabled(True)

# Set up Gemini API provider via OpenAI-compatible endpoint
Provider = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# Set up the chat completion model with Gemini
model = OpenAIChatCompletionsModel(
    model=os.getenv("AGENT_MODEL", "gemini-2.0-flash"),
    openai_client=Provider,
)


class TutorGPTAgent:
    """
    TutorGPT - Autonomous AI Teaching Agent

    This class wraps the OpenAI Agents SDK Agent to provide an autonomous
    teaching system that decides its own actions based on student needs.

    The agent:
    - Reads student questions
    - Decides which tools to use (autonomously!)
    - Searches the book when needed
    - Explains concepts adaptively
    - Celebrates milestones
    - Detects and responds to confusion

    All decisions are made by the LLM, NOT hardcoded logic!
    """

    def __init__(
        self,
        current_chapter: Optional[str] = None,
        current_lesson: Optional[str] = None,
        student_level: str = "beginner",
        student_name: Optional[str] = None,
        learning_style: Optional[str] = None,
        completed_lessons: Optional[list] = None,
        difficulty_topics: Optional[list] = None
    ):
        """
        Initialize TutorGPT autonomous agent with student personalization.

        Args:
            current_chapter: Current chapter student is reading (e.g., "04-python")
            current_lesson: Current lesson student is on (e.g., "01-intro")
            student_level: Student's proficiency level (beginner/intermediate/advanced)
            student_name: Student's name for personalized greetings
            learning_style: Student's learning preference (visual/code_focused/explanation_focused)
            completed_lessons: List of completed lesson IDs
            difficulty_topics: List of topics the student finds challenging
        """
        self.personality = AgentPersonality()
        self.current_chapter = current_chapter
        self.current_lesson = current_lesson
        self.student_level = student_level
        self.student_name = student_name
        self.learning_style = learning_style
        self.completed_lessons = completed_lessons or []
        self.difficulty_topics = difficulty_topics or []

        # Get core instructions with full personalization context
        instructions = get_core_instructions(
            current_chapter=current_chapter,
            current_lesson=current_lesson,
            student_level=student_level,
            student_name=student_name,
            learning_style=learning_style,
            completed_lessons=completed_lessons,
            difficulty_topics=difficulty_topics
        )

        # Create the AUTONOMOUS AGENT using OpenAI Agents SDK with Gemini LLM
        # The agent gets instructions and tools, then DECIDES autonomously!
        self.agent = Agent(
            name="TutorGPT",
            instructions=instructions,
            tools=TUTORGPT_TOOLS,  # Agent can use these tools - IT DECIDES WHEN!
            model=model,  # Gemini 2.0 Flash via OpenAI-compatible API
        )

    async def teach(
        self,
        student_message: str,
        session_id: str = "default"
    ) -> str:
        """
        Teach a student by responding to their question autonomously.

        The agent (LLM) will:
        1. Read the student's question
        2. Decide which tools to use (search book? explain? provide example?)
        3. Execute the tools autonomously
        4. Formulate an encouraging, helpful response

        NO HARDCODED LOGIC! The LLM decides everything based on instructions.

        Args:
            student_message: The student's question or message
            session_id: Session ID for conversation persistence

        Returns:
            Agent's teaching response

        Examples:
            >>> agent = TutorGPTAgent(current_chapter="04-python")
            >>> response = await agent.teach("What is Python?")
            >>> print(response)
            # Agent autonomously:
            # 1. Searches the book for "Python"
            # 2. Explains the concept
            # 3. Returns encouraging response
        """
        # Create session for conversation memory
        session = SQLiteSession(session_id)

        # RUN THE AUTONOMOUS AGENT!
        # The LLM will decide which tools to use based on the student's question
        result = await Runner.run(
            self.agent,
            input=student_message,
            session=session
        )

        return result.final_output

    def teach_sync(
        self,
        student_message: str,
        session_id: str = "default"
    ) -> str:
        """
        Synchronous version of teach() for non-async contexts.

        Args:
            student_message: The student's question
            session_id: Session ID for conversation persistence

        Returns:
            Agent's teaching response
        """
        session = SQLiteSession(session_id)

        # Synchronous execution
        result = Runner.run_sync(
            self.agent,
            input=student_message,
            session=session
        )

        return result.final_output

    async def greet_student(self) -> str:
        """
        Generate a personalized greeting for the student.

        This creates a warm, encouraging welcome message tailored to the student's
        profile, level, and learning progress.

        Returns:
            Personalized greeting message

        Example:
            >>> agent = TutorGPTAgent(student_name="Ahmed", student_level="beginner")
            >>> greeting = await agent.greet_student()
            >>> print(greeting)
            # "Welcome back, Ahmed! Ready to continue your AI-Native learning journey? 🚀"
        """
        name_part = f"{self.student_name}" if self.student_name else "there"
        level_emoji = {
            "beginner": "🌱",
            "intermediate": "🌿",
            "advanced": "🌳"
        }.get(self.student_level, "📚")

        # Build personalized greeting
        greeting_parts = [f"Welcome back, {name_part}! {level_emoji}"]

        # Add progress acknowledgment
        if self.completed_lessons and len(self.completed_lessons) > 0:
            lesson_count = len(self.completed_lessons)
            greeting_parts.append(
                f"You've completed {lesson_count} lesson{'s' if lesson_count != 1 else ''} - great progress!"
            )

        # Add current learning context
        if self.current_chapter and self.current_lesson:
            greeting_parts.append(
                f"Let's continue with {self.current_lesson} in {self.current_chapter}."
            )
        elif self.current_chapter:
            greeting_parts.append(
                f"Ready to dive into {self.current_chapter}?"
            )

        # Add learning style note
        if self.learning_style:
            style_messages = {
                "visual": "I'll make sure to include visual examples and diagrams for you.",
                "code_focused": "I'll focus on practical code examples and hands-on practice.",
                "explanation_focused": "I'll provide detailed explanations to deepen your understanding."
            }
            if self.learning_style in style_messages:
                greeting_parts.append(style_messages[self.learning_style])

        # Add encouragement
        greeting_parts.append("\nWhat would you like to learn about today? 🚀")

        return "\n\n".join(greeting_parts)

    def greet_student_sync(self) -> str:
        """
        Synchronous version of greet_student().

        Returns:
            Personalized greeting message
        """
        import asyncio
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        return loop.run_until_complete(self.greet_student())

    def update_context(
        self,
        current_chapter: Optional[str] = None,
        current_lesson: Optional[str] = None,
        student_level: Optional[str] = None,
        student_name: Optional[str] = None,
        learning_style: Optional[str] = None,
        completed_lessons: Optional[list] = None,
        difficulty_topics: Optional[list] = None
    ):
        """
        Update the agent's context (chapter, lesson, student profile).

        This recreates the agent with updated instructions and personalization.

        Args:
            current_chapter: New current chapter
            current_lesson: New current lesson
            student_level: New student level
            student_name: New student name
            learning_style: New learning style preference
            completed_lessons: Updated list of completed lessons
            difficulty_topics: Updated list of difficulty topics
        """
        if current_chapter is not None:
            self.current_chapter = current_chapter
        if current_lesson is not None:
            self.current_lesson = current_lesson
        if student_level is not None:
            self.student_level = student_level
        if student_name is not None:
            self.student_name = student_name
        if learning_style is not None:
            self.learning_style = learning_style
        if completed_lessons is not None:
            self.completed_lessons = completed_lessons
        if difficulty_topics is not None:
            self.difficulty_topics = difficulty_topics

        # Recreate agent with updated context and personalization
        instructions = get_core_instructions(
            current_chapter=self.current_chapter,
            current_lesson=self.current_lesson,
            student_level=self.student_level,
            student_name=self.student_name,
            learning_style=self.learning_style,
            completed_lessons=self.completed_lessons,
            difficulty_topics=self.difficulty_topics
        )

        self.agent = Agent(
            name="TutorGPT",
            instructions=instructions,
            tools=TUTORGPT_TOOLS,
            model=model,  # Gemini 2.0 Flash
        )


# Convenience function to create agent quickly
def create_tutor_agent(
    current_chapter: Optional[str] = None,
    current_lesson: Optional[str] = None,
    student_level: str = "beginner",
    student_name: Optional[str] = None,
    learning_style: Optional[str] = None,
    completed_lessons: Optional[list] = None,
    difficulty_topics: Optional[list] = None
) -> TutorGPTAgent:
    """
    Create a TutorGPT autonomous agent with full personalization.

    Args:
        current_chapter: Current chapter student is reading
        current_lesson: Current lesson student is on
        student_level: Student's proficiency level
        student_name: Student's name for personalization
        learning_style: Student's learning preference
        completed_lessons: List of completed lesson IDs
        difficulty_topics: List of challenging topics

    Returns:
        TutorGPTAgent instance ready to teach

    Example:
        >>> agent = create_tutor_agent(
        ...     current_chapter="04-python",
        ...     student_level="beginner",
        ...     student_name="Ahmed",
        ...     learning_style="code_focused"
        ... )
        >>> response = await agent.teach("What is a variable?")
    """
    return TutorGPTAgent(
        current_chapter=current_chapter,
        current_lesson=current_lesson,
        student_level=student_level,
        student_name=student_name,
        learning_style=learning_style,
        completed_lessons=completed_lessons,
        difficulty_topics=difficulty_topics
    )
