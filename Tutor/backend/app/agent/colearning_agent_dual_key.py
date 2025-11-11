"""Co-Learning Agent (Olivia) - SEPARATE API KEY FOR RATE LIMITS"""
import os
from typing import Optional, Dict, Any
from agents import Agent, Runner, SQLiteSession, AsyncOpenAI, OpenAIChatCompletionsModel
from dotenv import load_dotenv
from app.agent.personality import AgentPersonality
from app.tools.teaching_tools import TUTORGPT_TOOLS

load_dotenv()

# SEPARATE API KEY FOR CO-LEARNING AGENT!
Provider = AsyncOpenAI(
    api_key=os.getenv("COLEARNING_AGENT_API_KEY", os.getenv("GEMINI_API_KEY")),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

model = OpenAIChatCompletionsModel(
    model=os.getenv("AGENT_MODEL", "gemini-2.0-flash"),
    openai_client=Provider,
)

class CoLearningAgent:
    """Olivia - Co-Learning Agent with dedicated API key"""
    def __init__(self, session_id: str, student_profile: Optional[Dict[str, Any]] = None):
        self.session_id = session_id
        self.student_profile = student_profile or {}
        self.personality = AgentPersonality()
        self.student_name = self.student_profile.get('name', None)
        self.current_chapter = self.student_profile.get('current_chapter', 1)
        self.student_level = self.student_profile.get('level', 'beginner')
        self.completed_chapters = self.student_profile.get('completed_chapters', [])
        self.agent = self._create_agent()

    def _create_agent(self) -> Agent:
        instructions = """# You are Olivia - AI Teacher for "AI-Native Software Development"

BOOK: 5 parts, 13 chapters about building software with AI

## CRITICAL - READ CONVERSATION HISTORY!

**CHECK HISTORY BEFORE RESPONDING!**

**IF NO PREVIOUS MESSAGES:**
"Hey! I'm Olivia. What would you like to learn?"

**IF PREVIOUS MESSAGES EXIST:**
- DO NOT GREET AGAIN!
- READ what student said
- If student wants to learn → START TEACHING IMMEDIATELY!
- Search book first, then teach

## TEACHING STEPS

1. **SEARCH BOOK!** Call: search_book_content(query=topic, scope="book")
2. **TEACH!** Say: "According to Chapter X..." + example + question
3. **BUILD!** Reference previous topics, check understanding

## EXAMPLE:

Msg 1: Student: "hey"
Olivia: "Hey! I'm Olivia. What would you like to learn?"

Msg 2: Student: "i want to learn this book"
Olivia: [Calls search_book_content("AI-native development", scope="book")]
Olivia: "Perfect! Let's start Chapter 1 - The AI Development Revolution. According to the book, we're teaching machines how to learn WITH us. Think of it like having a smart copilot who learns your style. Ready to see how AI agents work?"

Msg 3+: Continue teaching!

## TOOLS
1. search_book_content - USE FIRST!
2. explain_concept
3. provide_code_example

✅ Greet ONCE if first message
✅ START TEACHING when student shows interest
✅ ALWAYS search book before teaching
✅ Cite chapters
❌ DO NOT repeat greetings!

NOW TEACH!
"""
        return Agent(name="Olivia", instructions=instructions, tools=TUTORGPT_TOOLS, model=model)

    async def teach(self, student_message: str) -> Dict[str, Any]:
        os.makedirs("data", exist_ok=True)
        session_file = f"data/{self.session_id}.db"
        session = SQLiteSession(session_file)
        result = await Runner.run(self.agent, input=student_message, session=session)
        return {
            'response': result.final_output,
            'chapter': self.current_chapter,
            'metadata': {
                'student_level': self.student_level,
                'completed_chapters': self.completed_chapters
            }
        }

    def update_profile(self, updates: Dict[str, Any]):
        self.student_profile.update(updates)
        if 'name' in updates:
            self.student_name = updates['name']
        if 'current_chapter' in updates:
            self.current_chapter = updates['current_chapter']
        if 'completed_chapters' in updates:
            self.completed_chapters = updates['completed_chapters']
        self.agent = self._create_agent()

def create_colearning_agent(session_id: str, student_profile: Optional[Dict[str, Any]] = None):
    return CoLearningAgent(session_id=session_id, student_profile=student_profile)
