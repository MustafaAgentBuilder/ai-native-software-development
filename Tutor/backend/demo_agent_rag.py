#!/usr/bin/env python3
"""
DEMO: Agent Fetching Content from RAG and Answering Questions

This demo shows exactly what the agent does:
1. Student asks a question
2. Agent's tool searches ChromaDB (RAG)
3. Agent gets book content
4. Agent answers using that content

Run this to see your RAG system in action!
"""

import sys
from app.services.rag_service import RAGService, RAGSearchRequest


def simulate_agent_workflow(student_question: str, scope: str = "entire_book"):
    """
    Simulate what the TutorGPT agent does when a student asks a question.

    This shows the EXACT workflow:
    1. Student asks question
    2. Agent decides to use search_book_content() tool
    3. Tool searches ChromaDB with embeddings
    4. Tool returns relevant book content
    5. Agent uses content to formulate answer
    """

    print("=" * 80)
    print("🎓 TutorGPT Agent Workflow Demonstration")
    print("=" * 80)
    print()

    # Step 1: Student asks question
    print("📝 STEP 1: Student asks question")
    print("-" * 80)
    print(f'Student: "{student_question}"')
    print()

    # Step 2: Agent decides to search RAG
    print("🤖 STEP 2: Agent decides to use search_book_content() tool")
    print("-" * 80)
    print(f"Agent thinking: 'I should search the book for: {student_question}'")
    print(f"Tool call: search_book_content(query='{student_question}', scope='{scope}')")
    print()

    # Step 3: Tool searches ChromaDB
    print("🔍 STEP 3: Tool searches ChromaDB with embeddings")
    print("-" * 80)
    print("Loading embedding model...")

    rag = RAGService()

    print("✓ Embedding model loaded (all-mpnet-base-v2)")
    print(f"✓ Converting query to 768-dimensional vector...")
    print(f"✓ Searching ChromaDB (2,026 chunks from 107 lessons)...")

    request = RAGSearchRequest(
        query=student_question,
        scope=scope,
        n_results=3
    )

    response = rag.search_sync(request)

    print(f"✓ Search complete in {response.search_time_ms}ms!")
    print(f"✓ Found {response.total_results} relevant results")
    print()

    # Step 4: Tool returns content to agent
    print("📚 STEP 4: Tool returns book content to agent")
    print("-" * 80)

    if response.results:
        for i, result in enumerate(response.results, 1):
            print(f"\n[Result {i}] Relevance Score: {result.score:.2f}")
            print(f"Chapter: {result.metadata.get('chapter_title', 'N/A')}")
            print(f"Lesson: {result.metadata.get('lesson_title', 'N/A')}")
            print(f"Heading: {result.metadata.get('heading', 'N/A')}")
            print(f"\nContent:")
            print(f"{result.content[:300]}...")
            print("-" * 40)
    else:
        print("No results found")

    print()

    # Step 5: Agent formulates answer
    print("💡 STEP 5: Agent formulates answer using book content")
    print("-" * 80)
    print("Agent would now:")
    print("1. Read the retrieved content")
    print("2. Understand the context")
    print("3. Formulate a teaching response")
    print("4. Answer the student with citations")
    print()
    print("Example answer format:")
    print("-" * 80)

    if response.results:
        best_result = response.results[0]

        print(f"🤖 TutorGPT: Great question! Let me help you understand this.")
        print()
        print(f"According to Chapter '{best_result.metadata.get('chapter_title', 'N/A')}',")
        print(f"Lesson '{best_result.metadata.get('lesson_title', 'N/A')}':")
        print()
        print(f"{best_result.content[:200]}...")
        print()
        print(f"[Additional explanation based on LLM reasoning...]")
        print()
        print(f"📖 Source: {best_result.metadata.get('chapter', 'N/A')} > {best_result.metadata.get('lesson', 'N/A')}")

    print()
    print("=" * 80)
    print("✅ This is EXACTLY what your agent does with RAG!")
    print("=" * 80)
    print()


def interactive_demo():
    """Interactive demo where you can ask questions."""

    print("\n" + "=" * 80)
    print("🎓 Interactive TutorGPT RAG Demo")
    print("=" * 80)
    print()
    print("This shows how the agent fetches content from ChromaDB and answers.")
    print("The book content is already embedded in your local database!")
    print()
    print("Type your question, or try these examples:")
    print("  - What is Python?")
    print("  - How does AI help in development?")
    print("  - Explain async programming")
    print("  - What are the benefits of AI-driven development?")
    print()
    print("Type 'quit' to exit")
    print("=" * 80)
    print()

    rag = RAGService()
    print("✓ RAG system loaded and ready!")
    print()

    while True:
        question = input("Your question: ").strip()

        if question.lower() in ['quit', 'exit', 'q']:
            print("\nGoodbye! 👋")
            break

        if not question:
            continue

        print()
        print("🔍 Searching ChromaDB...")

        request = RAGSearchRequest(
            query=question,
            scope="entire_book",
            n_results=3
        )

        response = rag.search_sync(request)

        print(f"✓ Found {response.total_results} results in {response.search_time_ms}ms")
        print()

        if response.results:
            print("📚 Book Content (what agent would use):")
            print("-" * 80)

            for i, result in enumerate(response.results, 1):
                print(f"\n[{i}] Score: {result.score:.2f} | Chapter: {result.metadata.get('chapter_title', 'N/A')}")
                print(f"Lesson: {result.metadata.get('lesson_title', 'N/A')}")
                if result.metadata.get('heading'):
                    print(f"Heading: {result.metadata.get('heading')}")
                print()
                print(result.content[:400] + "...")
                print()

            print("-" * 80)
            print()
            print("🤖 Agent would use this content to teach you!")
            print()
        else:
            print("⚠ No relevant content found")
            print()


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        interactive_demo()
    else:
        # Run demo with example questions
        example_questions = [
            ("What is Python and why should I learn it?", "entire_book"),
            ("How can AI help me in software development?", "entire_book"),
        ]

        for question, scope in example_questions:
            simulate_agent_workflow(question, scope)
            input("\nPress Enter to continue to next demo...\n")

        print("\n" + "=" * 80)
        print("Want to try your own questions?")
        print("Run: python demo_agent_rag.py --interactive")
        print("=" * 80)


if __name__ == "__main__":
    main()
