"""
Unit tests for TutorGPT Decision Engine (TDD)

Test File: tests/unit/agent/test_decision_engine.py
Implementation: app/agent/decision_engine.py

Purpose: Verify autonomous decision-making logic for tool selection.
"""

import pytest
from app.agent.decision_engine import DecisionEngine, TeachingContext, StudentMessage


class TestDecisionEngine:
    """Test suite for DecisionEngine class."""

    def test_decision_engine_exists(self):
        """Test that DecisionEngine can be instantiated."""
        engine = DecisionEngine()
        assert engine is not None

    def test_should_search_book_for_content_question(self):
        """Test that engine recommends book search for content questions."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="What is Python?",
            is_book_question=True,
            highlighted_text=None
        )

        context = TeachingContext(
            current_chapter="04-python",
            current_lesson="01-intro",
            student_level="beginner"
        )

        decision = engine.decide_tools(message, context)

        # Should always search book for content questions
        assert "search_book_content" in decision.tools
        assert decision.primary_tool == "search_book_content"

    def test_should_use_explain_concept_after_search(self):
        """Test that engine adds explain_concept after search."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="What is async programming?",
            is_book_question=True
        )

        context = TeachingContext(
            current_chapter="04-python",
            current_lesson="03-async"
        )

        decision = engine.decide_tools(message, context)

        # Should search AND explain
        assert "search_book_content" in decision.tools
        assert "explain_concept" in decision.tools

    def test_detects_confusion_from_multiple_questions(self):
        """Test that engine detects confusion patterns."""
        engine = DecisionEngine()

        # Simulate 3 questions about same topic
        context = TeachingContext(
            current_chapter="04-python",
            recent_topics=["variables", "variables", "variables"]  # 3x same topic
        )

        message = StudentMessage(
            text="I still don't understand variables",
            is_book_question=True
        )

        decision = engine.decide_tools(message, context)

        # Should detect confusion
        assert "detect_confusion" in decision.tools
        # Should simplify explanation
        assert decision.explanation_depth == "simple"
        assert decision.use_analogy is True

    def test_suggests_code_example_for_how_questions(self):
        """Test that 'how' questions trigger code examples."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="How do I use async/await?",
            is_book_question=True
        )

        context = TeachingContext(
            current_chapter="04-python",
            current_lesson="03-async"
        )

        decision = engine.decide_tools(message, context)

        # Should provide code example for "how" questions
        assert "provide_code_example" in decision.tools

    def test_uses_socratic_method_for_intermediate_students(self):
        """Test that Socratic method is used for intermediate+ students."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="What's the difference between sync and async?",
            is_book_question=True
        )

        context = TeachingContext(
            student_level="intermediate",  # Intermediate student
            current_chapter="04-python"
        )

        decision = engine.decide_tools(message, context)

        # Should use Socratic questioning for open-ended questions (intermediate+)
        assert decision.teaching_strategy == "socratic"

    def test_uses_direct_explanation_for_beginners(self):
        """Test that beginners get direct explanations."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="What is a variable?",
            is_book_question=True
        )

        context = TeachingContext(
            student_level="beginner",  # Beginner
            current_chapter="04-python"
        )

        decision = engine.decide_tools(message, context)

        # Beginners should get direct explanations
        assert decision.teaching_strategy in ["direct", "analogy"]

    def test_celebrates_milestone_on_chapter_completion(self):
        """Test that engine celebrates chapter completion."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="I finished Chapter 4!",
            is_milestone=True,
            milestone_type="chapter_complete"
        )

        context = TeachingContext(
            current_chapter="04-python"
        )

        decision = engine.decide_tools(message, context)

        # Should celebrate AND suggest next lesson
        assert "celebrate_milestone" in decision.tools
        assert "suggest_next_lesson" in decision.tools

    def test_redirects_off_topic_questions(self):
        """Test that off-topic questions are redirected gracefully."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="What's the weather today?",
            is_book_question=False  # Off-topic
        )

        context = TeachingContext(
            current_chapter="04-python"
        )

        decision = engine.decide_tools(message, context)

        # Should redirect, not search book
        assert decision.should_redirect is True
        assert "search_book_content" not in decision.tools

    def test_prioritizes_highlighted_text(self):
        """Test that highlighted text gets priority in search."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="Explain this",
            is_book_question=True,
            highlighted_text="Python is an interpreted language"
        )

        context = TeachingContext(
            current_chapter="04-python"
        )

        decision = engine.decide_tools(message, context)

        # Should search with highlighted text as query
        assert decision.search_query == "Python is an interpreted language"
        assert decision.search_scope == "highlighted"

    def test_optimizes_tool_count_for_efficiency(self):
        """Test that engine doesn't recommend unnecessary tools."""
        engine = DecisionEngine()

        message = StudentMessage(
            text="What is Python?",
            is_book_question=True
        )

        context = TeachingContext(
            current_chapter="04-python"
        )

        decision = engine.decide_tools(message, context)

        # Should be efficient - only 2-3 tools max for simple question
        assert len(decision.tools) <= 3
        # Should prioritize fast tools
        assert decision.estimated_time_ms < 3000  # Under 3 seconds


class TestTeachingContext:
    """Test suite for TeachingContext dataclass."""

    def test_context_has_required_fields(self):
        """Test that TeachingContext has all required fields."""
        context = TeachingContext(
            current_chapter="04-python",
            current_lesson="01-intro",
            student_level="beginner"
        )

        assert context.current_chapter == "04-python"
        assert context.current_lesson == "01-intro"
        assert context.student_level == "beginner"


class TestStudentMessage:
    """Test suite for StudentMessage dataclass."""

    def test_message_has_text(self):
        """Test that StudentMessage has text."""
        message = StudentMessage(text="What is Python?")
        assert message.text == "What is Python?"

    def test_message_detects_book_question(self):
        """Test that message can be flagged as book question."""
        message = StudentMessage(
            text="What is async?",
            is_book_question=True
        )
        assert message.is_book_question is True
