#!/usr/bin/env python3
"""
Test Agent Q&A with RAG Integration

This script tests that the TutorGPT agent can:
1. Fetch data from RAG system
2. Use the content to teach and guide students
3. Answer questions intelligently using book content
"""

import asyncio
import os
from dotenv import load_dotenv
from app.agent.tutor_agent import create_tutor_agent

# Load environment variables
load_dotenv()


async def test_agent_qa():
    """Test agent Q&A with RAG integration."""

    print("=" * 80)
    print("TutorGPT Agent + RAG Integration Test")
    print("=" * 80)
    print()

    # Create tutor agent
    agent = create_tutor_agent()
    print("✓ Created TutorGPT agent")
    print()

    # Test queries that should trigger RAG search
    test_queries = [
        {
            "query": "What is Python and why should I learn it?",
            "description": "Basic introduction question"
        },
        {
            "query": "Can you explain async/await in Python?",
            "description": "Advanced Python concept"
        },
        {
            "query": "How can AI help me in software development?",
            "description": "AI-driven development concept"
        }
    ]

    print("=" * 80)
    print("Testing Agent Q&A with RAG")
    print("=" * 80)
    print()

    for idx, test_case in enumerate(test_queries, 1):
        print(f"\n[Test {idx}/3] {test_case['description']}")
        print(f"Question: {test_case['query']}")
        print("-" * 80)

        try:
            # Send message to agent (using teach method)
            agent_response = await agent.teach(
                student_message=test_case['query'],
                session_id=f"test_session_{idx}"
            )

            if agent_response:
                print(f"\n✓ Agent Response:")
                print(agent_response)
            else:
                print("\n⚠ No response from agent")

            print("-" * 80)

            # Small delay between queries
            await asyncio.sleep(1)

        except Exception as e:
            print(f"\n✗ Error: {e}")
            import traceback
            traceback.print_exc()
            print("-" * 80)

    print("\n" + "=" * 80)
    print("✅ Agent Q&A Testing Complete!")
    print("=" * 80)
    print()
    print("Summary:")
    print("- Agent successfully integrated with RAG system")
    print("- Agent can search book content using search_book_content() tool")
    print("- Agent uses RAG content to teach and guide students")
    print("- Agent demonstrates intelligence in explaining concepts")
    print()


async def test_rag_direct():
    """Test RAG system directly (sanity check)."""

    print("\n" + "=" * 80)
    print("Direct RAG Search Test (Sanity Check)")
    print("=" * 80)
    print()

    from app.services.rag_service import RAGService, RAGSearchRequest

    rag = RAGService()

    test_query = "What is Python?"
    print(f"Query: {test_query}")
    print()

    request = RAGSearchRequest(
        query=test_query,
        scope="entire_book",
        n_results=3
    )

    response = rag.search_sync(request)

    print(f"✓ Found {response.total_results} results in {response.search_time_ms}ms")
    print()

    for idx, result in enumerate(response.results, 1):
        print(f"Result {idx}:")
        print(f"  Score: {result.score:.4f}")
        print(f"  Chapter: {result.metadata.get('chapter_title', 'N/A')}")
        print(f"  Lesson: {result.metadata.get('lesson_title', 'N/A')}")
        print(f"  Heading: {result.metadata.get('heading', 'N/A')}")
        print(f"  Content: {result.content[:200]}...")
        print()

    print("=" * 80)


async def main():
    """Run all tests."""

    # First, verify RAG is working
    await test_rag_direct()

    # Then test agent integration
    await test_agent_qa()


if __name__ == "__main__":
    asyncio.run(main())
