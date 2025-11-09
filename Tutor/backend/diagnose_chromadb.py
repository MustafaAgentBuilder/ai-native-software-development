#!/usr/bin/env python3
"""
ChromaDB Diagnostic Tool

This script diagnoses why ChromaDB is returning 0 results.
"""

import os
from pathlib import Path

print("=" * 80)
print("🔍 ChromaDB Diagnostic Tool")
print("=" * 80)
print()

# Step 1: Check if ChromaDB directory exists
print("1️⃣  Checking ChromaDB directory...")
db_path = Path("./data/embeddings")
if db_path.exists():
    print(f"   ✓ Directory exists: {db_path.absolute()}")
    # List contents
    contents = list(db_path.rglob("*"))
    print(f"   ✓ Total files/folders: {len(contents)}")
else:
    print(f"   ❌ Directory NOT found: {db_path.absolute()}")
    print("   → Need to run: python scripts/ingest_book.py")
    exit(1)

print()

# Step 2: Load ChromaDB and check collection
print("2️⃣  Loading ChromaDB client...")
try:
    import chromadb
    client = chromadb.PersistentClient(path=str(db_path))
    print("   ✓ ChromaDB client loaded")
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

print()

# Step 3: Check collection exists
print("3️⃣  Checking 'book_content' collection...")
try:
    collections = client.list_collections()
    print(f"   ✓ Found {len(collections)} collection(s)")

    for col in collections:
        print(f"     - {col.name} ({col.count()} items)")

    if not any(col.name == "book_content" for col in collections):
        print("   ❌ 'book_content' collection NOT found!")
        print("   → Need to run: python scripts/ingest_book.py")
        exit(1)

    collection = client.get_collection("book_content")
    count = collection.count()
    print(f"   ✓ Collection 'book_content' has {count} chunks")

    if count == 0:
        print("   ❌ Collection is EMPTY!")
        print("   → Need to run: python scripts/ingest_book.py")
        exit(1)

except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

print()

# Step 4: Check embedding dimensions
print("4️⃣  Checking embedding dimensions...")
try:
    # Get a sample to check dimensions
    result = collection.get(limit=1, include=["embeddings"])

    if result and result['embeddings'] and len(result['embeddings']) > 0:
        stored_dim = len(result['embeddings'][0])
        print(f"   ✓ Stored embeddings dimension: {stored_dim}")
    else:
        print("   ⚠ Could not retrieve sample embedding")
        stored_dim = None

    # Check current model dimension
    from app.services.embedding_service import EmbeddingService
    print("   Loading current embedding model...")
    embed_service = EmbeddingService()
    test_embedding = embed_service.embed_query("test")
    current_dim = len(test_embedding)
    print(f"   ✓ Current model dimension: {current_dim}")

    if stored_dim and stored_dim != current_dim:
        print(f"   ❌ DIMENSION MISMATCH!")
        print(f"      Stored: {stored_dim}")
        print(f"      Current: {current_dim}")
        print("   → Solution: Re-run ingestion with current model")
        print("   → Command: python scripts/ingest_book.py --reset")
    elif stored_dim == current_dim:
        print(f"   ✓ Dimensions match: {current_dim}")

except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

print()

# Step 5: Test actual search
print("5️⃣  Testing search functionality...")
try:
    from app.services.embedding_service import EmbeddingService

    embed_service = EmbeddingService()
    query = "What is Python?"
    print(f"   Query: '{query}'")

    # Get query embedding
    query_embedding = embed_service.embed_query(query)
    print(f"   ✓ Query embedding generated: {len(query_embedding)} dimensions")

    # Search ChromaDB directly
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    num_results = len(results['ids'][0]) if results and results.get('ids') else 0
    print(f"   ✓ Search returned: {num_results} results")

    if num_results > 0:
        print("\n   Sample results:")
        for i, (doc_id, distance) in enumerate(zip(results['ids'][0], results['distances'][0])):
            metadata = results['metadatas'][0][i] if results.get('metadatas') else {}
            print(f"     [{i+1}] ID: {doc_id}")
            print(f"         Distance: {distance:.4f}")
            print(f"         Chapter: {metadata.get('chapter_title', 'N/A')}")
            print(f"         Lesson: {metadata.get('lesson_title', 'N/A')}")
    else:
        print("   ❌ NO RESULTS RETURNED!")
        print("\n   Possible causes:")
        print("   1. Dimension mismatch between stored and current embeddings")
        print("   2. Collection is empty or corrupted")
        print("   3. Different embedding model used during ingestion")
        print("\n   Solution: Re-ingest with current model:")
        print("   python scripts/ingest_book.py --reset")

except Exception as e:
    print(f"   ❌ Error during search: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 80)
print("🏁 Diagnosis Complete")
print("=" * 80)
print()
