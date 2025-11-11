"""Co-Learning Agent - FULLY AUTONOMOUS - REAL TEACHER"""
import os
from typing import Optional, Dict, Any
from agents import Agent, Runner, SQLiteSession, AsyncOpenAI, OpenAIChatCompletionsModel
from dotenv import load_dotenv
from app.agent.personality import AgentPersonality
from app.tools.teaching_tools import TUTORGPT_TOOLS

load_dotenv()

Provider = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

model = OpenAIChatCompletionsModel(
    model=os.getenv("AGENT_MODEL", "gemini-2.0-flash"),
    openai_client=Provider,
)


class CoLearningAgent:
    """Fully Autonomous Co-Learning Agent - Real Teacher who TEACHES!"""

    def __init__(self, session_id: str, student_profile: Optional[Dict[str, Any]] = None):
        self.session_id = session_id
        self.student_profile = student_profile or {}
        self.personality = AgentPersonality()
        self.student_name = self.student_profile.get('name', None)
        self.current_chapter = self.student_profile.get('current_chapter', 1)
        self.student_level = self.student_profile.get('level', 'beginner')
        self.completed_chapters = self.student_profile.get('completed_chapters', [])
        self.last_session_info = self.student_profile.get('last_session_info', None)
        self.is_new_student = len(self.completed_chapters) == 0 and not self.last_session_info
        self.agent = self._create_agent()

    def _create_agent(self) -> Agent:
        instructions = self._generate_teaching_instructions()
        return Agent(name="CoLearningTutor", instructions=instructions, tools=TUTORGPT_TOOLS, model=model)

    def _generate_teaching_instructions(self) -> str:
        if self.is_new_student:
            ctx = "FIRST CONVERSATION - Student is brand new"
        else:
            ctx = f"RETURNING STUDENT - Name: {self.student_name}, Completed: {len(self.completed_chapters)} chapters"

        instructions = f"""# You are a REAL AI TEACHER who TEACHES

{ctx}

BOOK: AI-Native Software Development (5 parts, 13 chapters total)

## CRITICAL RULES

**RULE 1: GREET ONLY ONCE!**
- First message EVER → Brief greeting + ask what they want to learn
- Student already responded → STOP GREETING! START TEACHING!
- NEVER repeat "Hello I'm an AI Teacher" - do this ONCE only!

**RULE 2: SEARCH BOOK BEFORE EVERY TEACHING RESPONSE!**
1. Call search_book_content(query=topic, scope="book") FIRST
2. Read results carefully
3. Teach using book content
4. Always cite: "According to Chapter X..."

**RULE 3: START TEACHING WHEN STUDENT SHOWS INTEREST!**
If student says:
- "I want to learn about X"
- "Tell me about Y"
- "ya" or "yes" or "okay"

ACTION: IMMEDIATELY search book + START TEACHING!
DO NOT ask "what do you want to learn" again!

## TEACHING FLOW

**CORRECT CONVERSATION:**

Msg 1 (first ever):
Student: "hello"
You: "Hey! I'm your AI teacher. What do you want to learn - AI agents, coding, or something else?"

Msg 2 (student shows interest):
Student: "I want to learn about AI agents"
You: [IMMEDIATELY calls search_book_content("AI agents", scope="book")]
You: "Great! Let's learn about AI agents! According to Chapter X, an AI agent is like a smart assistant that makes its own decisions. Think of Tesla's self-driving car - it observes the road and decides when to turn, brake, or accelerate without human input. What interests you most - how they make decisions or how they learn?"

Msg 3+ (continue teaching):
Keep teaching, give examples, check understanding, build on previous topics.

## WHAT NOT TO DO

❌ DO NOT greet repeatedly!
❌ DO NOT keep asking "what do you want to learn" after they told you!
❌ DO NOT give generic responses!
❌ DO NOT forget to search book!
❌ DO NOT forget to cite chapters!

## WHAT TO DO

✅ Greet ONCE (first message only)
✅ START TEACHING immediately when student shows interest
✅ ALWAYS search book before teaching
✅ Give concrete examples and analogies
✅ Ask questions to check understanding
✅ Build on conversation history
✅ Cite book chapters

## TOOLS

1. search_book_content - USE FIRST!
2. explain_concept
3. provide_code_example
4. detect_student_confusion
5. celebrate_milestone
6. suggest_next_lesson

NOW TEACH! Greet once, then teach!
"""
        return instructions

    async def teach(self, student_message: str) -> Dict[str, Any]:
        """Autonomous teaching - Search book first, then teach!"""
        os.makedirs("data", exist_ok=True)
        session_file = f"data/{self.session_id}.db"
        session = SQLiteSession(session_file)
        result = await Runner.run(self.agent, input=student_message, session=session)
        return {
            'response': result.final_output,
            'chapter': self.current_chapter,
            'metadata': {
                'student_level': self.student_level,
                'completed_chapters': self.completed_chapters,
                'is_new_student': self.is_new_student
            }
        }

    def update_profile(self, updates: Dict[str, Any]):
        """Update profile and recreate agent"""
        self.student_profile.update(updates)
        if 'name' in updates:
            self.student_name = updates['name']
        if 'current_chapter' in updates:
            self.current_chapter = updates['current_chapter']
        if 'level' in updates:
            self.student_level = updates['level']
        if 'completed_chapters' in updates:
            self.completed_chapters = updates['completed_chapters']
        if 'last_session_info' in updates:
            self.last_session_info = updates['last_session_info']
        self.is_new_student = len(self.completed_chapters) == 0 and not self.last_session_info
        self.agent = self._create_agent()


def create_colearning_agent(session_id: str, student_profile: Optional[Dict[str, Any]] = None) -> CoLearningAgent:
    """Create fully autonomous Co-Learning Agent"""
    return CoLearningAgent(session_id=session_id, student_profile=student_profile)
