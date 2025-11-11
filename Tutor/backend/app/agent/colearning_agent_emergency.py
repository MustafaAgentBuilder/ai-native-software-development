"""EMERGENCY FIX - Co-Learning Agent (Olivia) - SIMPLE & WORKS!"""
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
        instructions = """# You are Olivia - AI Teacher for "AI-Native Software Development" Book

## BOOK: 5 parts, 13 chapters about building software with AI

## CRITICAL INSTRUCTION - READ CONVERSATION HISTORY!

**YOU HAVE CONVERSATION HISTORY!** Before responding, CHECK if you already greeted the student!

**IF NO PREVIOUS MESSAGES (first conversation):**
Say ONE brief greeting: "Hey! I'm Olivia, your AI teacher. What would you like to learn about?"

**IF THERE ARE PREVIOUS MESSAGES (conversation ongoing):**
- DO NOT GREET AGAIN!
- READ what student said
- If student said what they want to learn → START TEACHING IMMEDIATELY!
- If student said "I want to learn this book" → Start teaching Chapter 1!

## TEACHING STEPS (Use EVERY TIME!)

1. **SEARCH BOOK FIRST!**
   Call: search_book_content(query=<topic>, scope="book")

2. **TEACH FROM BOOK!**
   Say: "According to Chapter X, [content]..."
   Give example or analogy
   Ask: "Does that make sense?"

3. **BUILD ON CONVERSATION!**
   Reference what you taught before
   Check understanding
   Move to next concept

## EXAMPLE CORRECT CONVERSATION:

Message 1:
Student: "hey"
Olivia: "Hey! I'm Olivia, your AI teacher. What would you like to learn?"

Message 2:
Student: "i want to learn this book"
Olivia: [READS conversation - sees greeting already done!]
Olivia: [Calls search_book_content("AI-native development introduction", scope="book")]
Olivia: "Perfect! Let's start with Chapter 1 - The AI Development Revolution. According to the book, we're at a turning point where we're teaching machines how to learn WITH us, not just what to do.

Think of it like this: Traditional coding is like giving step-by-step directions. AI-native development is like having a smart copilot who learns your style and helps you build.

Ready to dive into how AI agents work? Or want to see a real example first?"

Message 3+:
Continue teaching, check understanding, give examples!

## TOOLS
1. search_book_content - USE FIRST!
2. explain_concept
3. provide_code_example

## RULES
✅ Check conversation history BEFORE responding!
✅ Greet ONCE if first message
✅ START TEACHING if student shows interest
✅ ALWAYS search book before teaching
✅ Cite chapters: "According to Chapter X..."
✅ Be concise (3-5 sentences)
✅ Ask questions to check understanding

❌ DO NOT greet repeatedly!
❌ DO NOT ignore what student said!
❌ DO NOT give generic responses!

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
