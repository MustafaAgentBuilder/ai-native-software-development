"""
TutorGPT Decision Engine - Autonomous Tool Selection

The BRAIN's decision-making center. This module determines which tools the agent
should use based on student messages and teaching context.

Key Design: EFFICIENT and SMART
- Minimal tool calls (fast response < 3 seconds)
- Context-aware decisions
- Adaptive to student level
- Autonomous (not hardcoded rules)
"""

from dataclasses import dataclass, field
from typing import List, Optional, Set
import re


@dataclass
class StudentMessage:
    """
    Represents a student's message/question.

    Attributes:
        text: The student's message
        is_book_question: Whether question is about book content
        highlighted_text: Text highlighted by student (if any)
        is_milestone: Whether this is a milestone moment
        milestone_type: Type of milestone (chapter_complete, etc.)
    """

    text: str
    is_book_question: bool = True  # Default: assume book questions
    highlighted_text: Optional[str] = None
    is_milestone: bool = False
    milestone_type: Optional[str] = None


@dataclass
class TeachingContext:
    """
    Current teaching context for decision-making.

    Attributes:
        current_chapter: Chapter student is reading (e.g., "04-python")
        current_lesson: Lesson student is on (e.g., "01-intro")
        student_level: Proficiency level (beginner/intermediate/advanced)
        recent_topics: List of recent topics discussed (for confusion detection)
        session_history_count: Number of messages in current session
    """

    current_chapter: Optional[str] = None
    current_lesson: Optional[str] = None
    student_level: str = "beginner"
    recent_topics: List[str] = field(default_factory=list)
    session_history_count: int = 0


@dataclass
class TeachingDecision:
    """
    The decision about which tools to use and how to teach.

    Attributes:
        tools: List of tools to use (ordered by priority)
        primary_tool: The most important tool for this interaction
        teaching_strategy: Which teaching approach to use
        explanation_depth: Level of detail (simple/detailed/advanced)
        use_analogy: Whether to use analogies
        should_redirect: Whether to redirect off-topic question
        search_query: What to search for in book
        search_scope: Scope of search (highlighted/lesson/chapter/book)
        estimated_time_ms: Estimated response time in milliseconds
    """

    tools: List[str] = field(default_factory=list)
    primary_tool: Optional[str] = None
    teaching_strategy: str = "direct"  # direct/socratic/analogy/example-driven
    explanation_depth: str = "detailed"  # simple/detailed/advanced
    use_analogy: bool = False
    should_redirect: bool = False
    search_query: Optional[str] = None
    search_scope: str = "lesson"  # highlighted/lesson/chapter/book
    estimated_time_ms: int = 2000  # Target: under 3 seconds


class DecisionEngine:
    """
    Autonomous decision-making engine for TutorGPT.

    Makes intelligent decisions about:
    1. Which tools to use
    2. What teaching strategy to apply
    3. How to optimize for speed and quality
    """

    def __init__(self):
        """Initialize decision engine with optimization rules."""
        # Tool execution time estimates (milliseconds)
        self.tool_time_estimates = {
            "search_book_content": 800,  # RAG search
            "explain_concept": 500,  # Fast
            "provide_code_example": 600,
            "detect_confusion": 300,  # Very fast
            "ask_clarifying_question": 400,
            "get_student_profile": 200,  # DB lookup
            "track_progress": 200,
            "celebrate_milestone": 400,
            "adjust_teaching_pace": 300,
            "suggest_next_lesson": 400,
            "suggest_practice_exercise": 500,
            "generate_quiz": 700,
        }

    def decide_tools(
        self, message: StudentMessage, context: TeachingContext
    ) -> TeachingDecision:
        """
        Make autonomous decision about which tools to use.

        This is the CORE decision-making logic. Analyzes the student's message
        and context to determine the best teaching approach.

        Args:
            message: Student's message/question
            context: Current teaching context

        Returns:
            TeachingDecision: Recommended tools and teaching approach
        """
        decision = TeachingDecision()

        # Step 1: Check if off-topic (redirect gracefully)
        if not message.is_book_question:
            decision.should_redirect = True
            decision.tools = []  # Don't use any tools for off-topic
            return decision

        # Step 2: Check for milestone (celebrate first!)
        if message.is_milestone:
            decision.tools.append("celebrate_milestone")
            decision.tools.append("suggest_next_lesson")
            decision.primary_tool = "celebrate_milestone"
            decision.teaching_strategy = "encouraging"
            decision.estimated_time_ms = self._estimate_time(decision.tools)
            return decision

        # Step 3: Determine search query and scope
        if message.highlighted_text:
            # Priority: highlighted text
            decision.search_query = message.highlighted_text
            decision.search_scope = "highlighted"
        else:
            # Extract key terms from question
            decision.search_query = self._extract_search_query(message.text)
            decision.search_scope = "lesson"  # Start with current lesson

        # Step 4: ALWAYS search book for content questions (efficiency: search first)
        decision.tools.append("search_book_content")
        decision.primary_tool = "search_book_content"

        # Step 5: Detect confusion (check recent topics)
        if self._is_confused(message, context):
            decision.tools.append("detect_confusion")
            decision.explanation_depth = "simple"
            decision.use_analogy = True
            decision.teaching_strategy = "analogy"

        # Step 6: Determine teaching strategy based on student level
        else:
            decision.teaching_strategy = self._choose_teaching_strategy(
                message, context
            )

            # Socratic method for intermediate+ students on open-ended questions
            if (
                decision.teaching_strategy == "socratic"
                and context.student_level in ["intermediate", "advanced"]
            ):
                decision.explanation_depth = "detailed"
                decision.use_analogy = False

            # Direct explanation for beginners
            elif context.student_level == "beginner":
                decision.teaching_strategy = "direct"
                decision.explanation_depth = "simple"
                decision.use_analogy = self._should_use_analogy(message.text)

        # Step 7: Add explanation tool (after search)
        decision.tools.append("explain_concept")

        # Step 8: Check if code example would help (for "how" questions)
        if self._needs_code_example(message.text):
            decision.tools.append("provide_code_example")

        # Step 9: Optimize - remove redundant tools, limit to 3 max for efficiency
        decision.tools = self._optimize_tools(decision.tools)

        # Step 10: Estimate response time
        decision.estimated_time_ms = self._estimate_time(decision.tools)

        return decision

    def _is_confused(self, message: StudentMessage, context: TeachingContext) -> bool:
        """
        Detect if student is confused based on patterns.

        Indicators:
        - 3+ questions about same topic
        - Negative phrasing ("I don't understand", "confused", "lost")
        - Very short messages ("??", "what?")

        Args:
            message: Student's message
            context: Teaching context

        Returns:
            bool: True if confusion detected
        """
        # Check recent topics for repetition (3+ same topic = confusion)
        if len(context.recent_topics) >= 3:
            # Count occurrences of most common topic
            if context.recent_topics:
                most_common = max(
                    set(context.recent_topics), key=context.recent_topics.count
                )
                if context.recent_topics.count(most_common) >= 3:
                    return True

        # Check for confusion keywords
        confusion_words = [
            "don't understand",
            "confused",
            "lost",
            "stuck",
            "help",
            "still",
            "again",
        ]
        text_lower = message.text.lower()
        if any(word in text_lower for word in confusion_words):
            return True

        return False

    def _choose_teaching_strategy(
        self, message: StudentMessage, context: TeachingContext
    ) -> str:
        """
        Choose optimal teaching strategy based on message and context.

        Strategies:
        - socratic: For open-ended questions (intermediate+ students)
        - direct: For specific questions (all students)
        - analogy: For complex concepts (especially beginners)
        - example-driven: For "how" questions

        Args:
            message: Student's message
            context: Teaching context

        Returns:
            str: Teaching strategy name
        """
        text_lower = message.text.lower()

        # "How" questions → example-driven
        if text_lower.startswith("how"):
            return "example-driven"

        # Open-ended "what/why" questions + intermediate+ → Socratic
        if (
            text_lower.startswith(("what", "why"))
            and context.student_level in ["intermediate", "advanced"]
        ):
            return "socratic"

        # Default: direct explanation
        return "direct"

    def _should_use_analogy(self, text: str) -> bool:
        """
        Determine if analogy would help understanding.

        Args:
            text: Student's question

        Returns:
            bool: True if analogy is recommended
        """
        # Complex technical terms benefit from analogies
        complex_terms = [
            "async",
            "threading",
            "concurrency",
            "recursion",
            "closure",
            "decorator",
        ]

        text_lower = text.lower()
        return any(term in text_lower for term in complex_terms)

    def _needs_code_example(self, text: str) -> bool:
        """
        Determine if student would benefit from code example.

        Args:
            text: Student's question

        Returns:
            bool: True if code example is recommended
        """
        # "How" questions almost always need examples
        if text.lower().startswith("how"):
            return True

        # Questions about usage/implementation
        usage_keywords = ["use", "implement", "write", "code", "syntax", "example"]
        return any(keyword in text.lower() for keyword in usage_keywords)

    def _extract_search_query(self, text: str) -> str:
        """
        Extract key search terms from student question.

        Removes question words and focuses on content terms.

        Args:
            text: Student's question

        Returns:
            str: Optimized search query
        """
        # Remove common question words
        question_words = ["what", "how", "why", "when", "where", "is", "are", "the"]

        words = text.lower().split()
        filtered_words = [w for w in words if w not in question_words]

        # Return filtered query (or original if too short)
        return " ".join(filtered_words) if filtered_words else text

    def _optimize_tools(self, tools: List[str]) -> List[str]:
        """
        Optimize tool list for efficiency.

        Rules:
        - Maximum 3 tools (for speed)
        - Remove duplicates
        - Prioritize fast tools

        Args:
            tools: Original tool list

        Returns:
            List[str]: Optimized tool list
        """
        # Remove duplicates while preserving order
        seen: Set[str] = set()
        unique_tools = []
        for tool in tools:
            if tool not in seen:
                seen.add(tool)
                unique_tools.append(tool)

        # Limit to 3 tools maximum (efficiency)
        return unique_tools[:3]

    def _estimate_time(self, tools: List[str]) -> int:
        """
        Estimate total response time for tool combination.

        Args:
            tools: List of tools to execute

        Returns:
            int: Estimated time in milliseconds
        """
        total_time = sum(
            self.tool_time_estimates.get(tool, 500) for tool in tools
        )

        # Add LLM generation time (approximately 500ms)
        total_time += 500

        return total_time
