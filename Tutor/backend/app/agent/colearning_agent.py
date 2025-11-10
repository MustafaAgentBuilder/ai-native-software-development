"""
Co-Learning Agent - Autonomous Step-by-Step Teaching System

This module implements an advanced agentic teaching system that autonomously
guides students through the entire book using the 17-step teaching flow.

Based on:
- OpenAI Agents SDK patterns
- Anthropic's Effective Context Engineering
- Advanced prompt engineering techniques
- Autonomous decision-making loops
"""

import os
import json
from typing import Optional, Dict, List, Any
from enum import Enum
from agents import Agent, Runner, SQLiteSession, AsyncOpenAI, OpenAIChatCompletionsModel
from dotenv import load_dotenv

from app.agent.personality import AgentPersonality
from app.tools.teaching_tools import TUTORGPT_TOOLS

load_dotenv()

# Gemini API configuration
Provider = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

model = OpenAIChatCompletionsModel(
    model=os.getenv("AGENT_MODEL", "gemini-2.0-flash"),
    openai_client=Provider,
)


class TeachingPhase(Enum):
    """Current phase in the teaching flow"""
    GREETING = "greeting"
    LANGUAGE_SELECTION = "language_selection"
    CHAPTER_SELECTION = "chapter_selection"
    LESSON_PLAN = "lesson_plan"
    SECTION_TEACHING = "section_teaching"
    REFLECTION_QUESTION = "reflection_question"
    STUDENT_ANSWER_EVAL = "student_answer_evaluation"
    PRACTICE_TASK = "practice_task"
    KEY_POINT_REPEAT = "key_point_repeat"
    CHAPTER_SUMMARY = "chapter_summary"
    QUIZ_PREPARATION = "quiz_preparation"
    QUIZ_TAKING = "quiz_taking"
    QUIZ_GRADING = "quiz_grading"
    REMEDIAL_PATH = "remedial_path"
    PROGRESS_UPDATE = "progress_update"
    NEXT_STEP_CHOICE = "next_step_choice"
    BOOK_COMPLETION = "book_completion"


class CoLearningAgent:
    """
    Advanced Co-Learning Agent with autonomous decision-making.

    This agent implements the 17-step teaching flow with full autonomy:
    - Dynamically manages teaching context
    - Makes pedagogical decisions autonomously
    - Adapts to student responses in real-time
    - Maintains conversation state and learning progress
    """

    def __init__(
        self,
        session_id: str,
        student_profile: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize Co-Learning Agent.

        Args:
            session_id: Unique session identifier for conversation persistence
            student_profile: Student's learning profile (name, level, language, etc.)
        """
        self.session_id = session_id
        self.student_profile = student_profile or {}
        self.personality = AgentPersonality()

        # Teaching state
        self.current_phase = TeachingPhase.GREETING
        self.current_chapter = self.student_profile.get('current_chapter', 1)
        self.current_section = self.student_profile.get('current_section', 0)
        self.language = self.student_profile.get('language', 'en')
        self.student_level = self.student_profile.get('level', 'beginner')
        self.completed_chapters = self.student_profile.get('completed_chapters', [])
        self.wrong_answer_streak = 0
        self.confusion_indicators = []

        # Create the autonomous agent with enhanced instructions
        self.agent = self._create_agent()

    def _create_agent(self) -> Agent:
        """
        Create the autonomous teaching agent with context-aware instructions.

        Returns:
            Configured Agent instance
        """
        instructions = self._generate_dynamic_instructions()

        return Agent(
            name="CoLearningTutor",
            instructions=instructions,
            tools=TUTORGPT_TOOLS,
            model=model,
        )

    def _generate_dynamic_instructions(self) -> str:
        """
        Generate dynamic, context-aware system instructions.

        Uses principles from:
        - Anthropic's Effective Context Engineering
        - OpenAI Prompt Engineering Guide
        - Prompt Engineering Guide (promptingguide.ai)

        Returns:
            Complete system instructions with current context
        """
        # Get student info
        student_name = self.student_profile.get('name', 'Student')
        learning_style = self.student_profile.get('learning_style', 'balanced')

        # Language-specific greetings
        language_config = {
            'en': {
                'name': 'English',
                'greeting': 'Hello',
                'emoji': '🇬🇧'
            },
            'roman_ur': {
                'name': 'Roman Urdu',
                'greeting': 'Assalam-o-Alaikum',
                'emoji': '🇵🇰'
            },
            'es': {
                'name': 'Spanish',
                'greeting': 'Hola',
                'emoji': '🇪🇸'
            }
        }

        lang_info = language_config.get(self.language, language_config['en'])

        instructions = f"""# You are an AUTONOMOUS Co-Learning AI Tutor

## Core Identity & Mission
You are an expert AI tutor teaching the "AI-Native Software Development" book.
Your mission: Guide {student_name} through the ENTIRE book step-by-step using adaptive, engaging teaching.

Language: {lang_info['name']} {lang_info['emoji']}
Student Level: {self.student_level.title()}
Learning Style: {learning_style.title()}
Current Chapter: {self.current_chapter}
Current Phase: {self.current_phase.value}

## CRITICAL: Your Autonomous Teaching Loop

You are NOT following a script. You are THINKING and DECIDING like a real teacher.

### Decision-Making Framework

For EVERY student message, autonomously decide:

1. **What phase am I in?** (greeting, teaching, quiz, feedback, etc.)
2. **What does the student need right now?**
   - Clarification? → Ask targeted question
   - Example? → Provide code/analogy
   - Encouragement? → Celebrate and motivate
   - Challenge? → Deepen the concept
   - Confusion? → Simplify and retry

3. **What tools should I use?**
   - `search_book_content` - ALWAYS for book content (mandatory first step)
   - `explain_concept` - For clear explanations
   - `provide_code_example` - For practical demonstrations
   - `detect_confusion` - Check if student is struggling
   - `ask_clarifying_question` - Socratic method
   - `celebrate_milestone` - Motivation and encouragement
   - `generate_quiz` - Assessment
   - `track_progress` - Update learning metrics

4. **How should I respond?**
   - Tone: {self._get_tone_guidance()}
   - Length: Concise but complete (3-5 sentences ideal)
   - Structure: Note → Explanation → Example → Question/Next Step

### 17-Step Teaching Flow (Your Navigation Map)

You autonomously guide students through these phases:

**Phase 1-3: Onboarding**
1. Greet & choose language → Ask: "Which language: English/Roman Urdu/Spanish?"
2. Choose starting point → Ask: "Start from Chapter 1 or jump to specific chapter?"
3. Set expectations → Explain: "Here's what we'll cover in this chapter..."

**Phase 4-9: Active Teaching**
4. Section teaching → Show: Note + Explanation + Example
5. Reflection question → Ask: "Can you explain this in your own words?"
6. Evaluate answer → Decide: Continue / Clarify / Simplify
7. Practice task → Give: Small coding task or thought exercise
8. Key point repetition → Ask: "What's the main takeaway?"
9. Continue through sections → Repeat 4-8 for each section

**Phase 10-13: Assessment**
10. Chapter summary → Provide: 3-4 line recap
11. Quiz preparation → Say: "Ready for 10-question quiz?"
12. Quiz taking → Present: 10 mixed questions
13. Quiz grading → Show: Score + Detailed feedback

**Phase 14-17: Progression**
14. Adaptive path → Decide: Remedial (<50%) / Advanced (>90%) / Continue (50-90%)
15. Progress update → Mark chapter complete, update progress bar
16. Next step choice → Ask: "Next chapter / Repeat / Review mistakes?"
17. Book completion → When all done: Full summary + Next steps

### Autonomous Adaptation Rules

**RULE 1: Detect Confusion (Adaptive Simplification)**
IF student:
- Asks 3+ questions on same topic
- Says "I don't understand"
- Gives wrong answer multiple times
THEN you MUST:
1. Call `detect_confusion()`
2. Simplify explanation (use analogies)
3. Provide concrete example
4. Ask simpler reflection question
5. Reset complexity after they succeed

**RULE 2: Adaptive Pacing**
IF student:
- Answers quickly and correctly → Increase depth/complexity
- Hesitates or asks for clarification → Maintain current level
- Struggles consistently → Decrease complexity, add examples

**RULE 3: Book-First Always**
For EVERY content question:
1. FIRST: Call `search_book_content(query, scope="current_chapter")`
2. Read search results carefully
3. Base your answer on book content
4. CITE the source: "In Chapter X, Section Y..."
5. NEVER fabricate information not in the book

**RULE 4: Engagement & Motivation**
- Start each teaching session with encouragement
- Celebrate small wins: "Great thinking!", "You're getting it!", "Perfect!"
- Normalize struggle: "This is tricky for everyone at first"
- End with curiosity: "Ready to see how this applies?" "Want to try?"

### Response Quality Standards

Every response MUST include:

✅ **Context Awareness** - Reference what we just discussed
✅ **Book Citation** - "According to Chapter X..." when teaching content
✅ **Encouragement** - Positive, supportive tone
✅ **Clarity** - Simple language for {self.student_level} level
✅ **Engagement Hook** - Question or next step at the end

**Tone Examples:**

✅ EXCELLENT:
"Great question about async programming! Let me check the book...
[searches]

According to Chapter 4, Section 3, async programming allows your code to handle multiple tasks without waiting. Think of it like a restaurant kitchen - the chef doesn't wait for one dish to finish before starting another!

Here's a simple example:
[code example]

Does this make sense? Try to explain it back to me in your own words! 💡"

❌ BAD:
"Async programming is when your code doesn't block. It's important for performance."
(No book reference, no encouragement, no engagement, too brief, no check for understanding)

### Context Engineering (Dynamic Context Window)

**Priority Hierarchy:**
1. **Current conversation** (last 5-7 messages) - Most important
2. **Current chapter/section** - Teaching focus
3. **Student profile** - Learning style, level, progress
4. **Historical struggles** - Topics they found difficult
5. **Recent milestones** - What they've accomplished

**Context Injection:**
When student asks a question:
- Inject: Current chapter, section, and last 3 student messages
- Search: Chapter-specific content first, then broader
- Reference: "Building on what we discussed about [previous topic]..."

### Advanced Pedagogical Techniques

**Socratic Method** (for intermediate+ students):
- Ask leading questions: "What do you think happens when...?"
- Guide discovery: "How might this relate to...?"
- Confirm understanding: "Can you connect this to...?"

**Scaffolding** (for all students):
- Start simple, build complexity
- Provide examples before abstractions
- Use familiar analogies: "It's like when you..."

**Active Recall** (memory reinforcement):
- "Before we continue, can you remind me what X means?"
- "How does this relate to what we learned yesterday?"
- "What was the key difference between X and Y?"

### Error Handling & Edge Cases

**Student off-topic:**
"I'm focused on teaching you AI-Native Development! 📚 Let's get back to [current topic]. What specific part can I clarify?"

**Student stuck:**
"No worries! This is a tricky concept. Let me explain it a different way..."
Then: Provide analogy + example + simpler question

**Student ahead:**
"Wow, you're thinking ahead! That's great. We'll cover that in Chapter X. For now, let's master [current topic] so you have the foundation."

**Book content not found:**
"I don't see that exact topic in this chapter. Are you thinking of [related concept]? Or shall we search the full book?"

## YOUR AUTONOMY

You are NOT a chatbot following rules mechanically.
You are a TEACHER making real-time pedagogical decisions.

- THINK about what the student needs
- DECIDE which tools to use
- ADAPT your approach based on responses
- CELEBRATE progress genuinely
- STAY CURIOUS about student understanding

Be the best teacher {student_name} has ever had! 🚀

## Language: {lang_info['name']}

Respond in {lang_info['name']}. Use clear, simple language appropriate for {self.student_level} level.
"""

        return instructions.strip()

    def _get_tone_guidance(self) -> str:
        """Get tone guidance based on student level"""
        tone_map = {
            'beginner': 'Warm, encouraging, simple language. Lots of analogies.',
            'intermediate': 'Friendly but technical. Balance explanation and challenge.',
            'advanced': 'Professional, deep technical detail. Socratic questions.'
        }
        return tone_map.get(self.student_level, tone_map['beginner'])

    async def teach(self, student_message: str) -> Dict[str, Any]:
        """
        Main teaching method - autonomous response to student.

        The agent autonomously:
        1. Analyzes student message and context
        2. Determines current teaching phase
        3. Selects appropriate tools to use
        4. Generates pedagogically sound response
        5. Updates teaching state

        Args:
            student_message: Student's message or question

        Returns:
            Dict with response, phase, metadata
        """
        # Create session for conversation memory
        session = SQLiteSession(self.session_id)

        # Run the autonomous agent
        result = await Runner.run(
            self.agent,
            input=student_message,
            session=session
        )

        # Update teaching state based on response
        await self._update_teaching_state(student_message, result.final_output)

        return {
            'response': result.final_output,
            'phase': self.current_phase.value,
            'chapter': self.current_chapter,
            'section': self.current_section,
            'metadata': {
                'language': self.language,
                'level': self.student_level,
                'wrong_streak': self.wrong_answer_streak,
                'completed_chapters': self.completed_chapters
            }
        }

    async def _update_teaching_state(self, student_input: str, agent_response: str):
        """
        Update internal teaching state based on conversation.

        This implements state transitions in the 17-step flow.
        """
        # Detect phase transitions autonomously
        lower_input = student_input.lower()
        lower_response = agent_response.lower()

        # Language selection detection
        if any(lang in lower_input for lang in ['english', 'urdu', 'spanish', 'roman']):
            if 'english' in lower_input:
                self.language = 'en'
            elif 'urdu' in lower_input or 'roman' in lower_input:
                self.language = 'roman_ur'
            elif 'spanish' in lower_input:
                self.language = 'es'
            self.current_phase = TeachingPhase.CHAPTER_SELECTION

        # Chapter selection detection
        if 'chapter' in lower_input and any(str(i) in lower_input for i in range(1, 11)):
            for i in range(1, 11):
                if str(i) in lower_input:
                    self.current_chapter = i
                    self.current_phase = TeachingPhase.LESSON_PLAN
                    break

        # Quiz transition detection
        if 'quiz' in lower_response or 'test your understanding' in lower_response:
            self.current_phase = TeachingPhase.QUIZ_PREPARATION

        # Confusion detection (wrong answer streak)
        if 'not quite' in lower_response or 'let me explain differently' in lower_response:
            self.wrong_answer_streak += 1
        else:
            self.wrong_answer_streak = 0

        # Chapter completion detection
        if 'completed chapter' in lower_response or 'chapter done' in lower_response:
            if self.current_chapter not in self.completed_chapters:
                self.completed_chapters.append(self.current_chapter)
            self.current_phase = TeachingPhase.PROGRESS_UPDATE

    def update_profile(self, updates: Dict[str, Any]):
        """
        Update student profile and regenerate agent with new context.

        Args:
            updates: Dictionary of profile updates
        """
        self.student_profile.update(updates)

        # Update internal state
        if 'current_chapter' in updates:
            self.current_chapter = updates['current_chapter']
        if 'language' in updates:
            self.language = updates['language']
        if 'level' in updates:
            self.student_level = updates['level']
        if 'completed_chapters' in updates:
            self.completed_chapters = updates['completed_chapters']

        # Recreate agent with updated context
        self.agent = self._create_agent()

    async def get_lesson_plan(self, chapter: int) -> str:
        """
        Generate lesson plan for a chapter (Step 3 of teaching flow).

        Args:
            chapter: Chapter number

        Returns:
            Lesson plan summary
        """
        self.current_chapter = chapter
        self.current_phase = TeachingPhase.LESSON_PLAN

        # Use agent to generate personalized lesson plan
        prompt = f"Generate a brief lesson plan for Chapter {chapter}. What will we cover?"
        result = await self.teach(prompt)
        return result['response']

    async def generate_quiz(self, chapter: int, num_questions: int = 10) -> List[Dict]:
        """
        Generate quiz questions for a chapter (Step 11-12).

        Args:
            chapter: Chapter number
            num_questions: Number of questions

        Returns:
            List of quiz questions
        """
        self.current_phase = TeachingPhase.QUIZ_PREPARATION

        # Use agent's quiz generation tool
        prompt = f"Generate a {num_questions}-question quiz for Chapter {chapter}. Mix multiple choice, true/false, and short answer."

        session = SQLiteSession(self.session_id)
        result = await Runner.run(self.agent, input=prompt, session=session)

        # Parse quiz from response (agent should format it)
        return self._parse_quiz_questions(result.final_output)

    def _parse_quiz_questions(self, quiz_text: str) -> List[Dict]:
        """Parse quiz questions from agent's formatted response"""
        # This would parse the structured quiz output from the agent
        # For now, return a placeholder structure
        return []


def create_colearning_agent(
    session_id: str,
    student_profile: Optional[Dict[str, Any]] = None
) -> CoLearningAgent:
    """
    Factory function to create a Co-Learning Agent.

    Args:
        session_id: Unique session identifier
        student_profile: Student's learning profile

    Returns:
        Configured CoLearningAgent instance

    Example:
        >>> agent = create_colearning_agent(
        ...     session_id="student-123",
        ...     student_profile={
        ...         'name': 'Ahmed',
        ...         'level': 'beginner',
        ...         'language': 'en',
        ...         'current_chapter': 1
        ...     }
        ... )
        >>> response = await agent.teach("I want to start learning!")
    """
    return CoLearningAgent(session_id=session_id, student_profile=student_profile)
