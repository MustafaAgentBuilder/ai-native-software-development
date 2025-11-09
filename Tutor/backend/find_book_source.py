#!/usr/bin/env python3
"""
Find book-source folder location
"""

import os
from pathlib import Path

print("\n" + "=" * 80)
print("🔍 Looking for book-source folder...")
print("=" * 80)
print()

# Check current directory
current = Path.cwd()
print(f"Current directory: {current}")
print()

# Check expected locations
locations_to_check = [
    Path("../../book-source/docs"),
    Path("../../../book-source/docs"),
    Path("../../book-source"),
    Path("../../../book-source"),
]

print("Checking these locations:")
for loc in locations_to_check:
    full_path = (current / loc).resolve()
    exists = full_path.exists()
    status = "✅ FOUND!" if exists else "❌ Not found"
    print(f"  {status} - {full_path}")

    if exists:
        # Count markdown files
        md_files = list(full_path.rglob("*.md"))
        print(f"         ({len(md_files)} markdown files)")

print()
print("=" * 80)
print()

# Search in parent directories
print("Searching parent directories...")
search_path = current
for _ in range(5):  # Search up 5 levels
    book_source = search_path / "book-source"
    if book_source.exists():
        print(f"✅ FOUND: {book_source}")
        docs_path = book_source / "docs"
        if docs_path.exists():
            print(f"✅ Docs folder: {docs_path}")
            md_files = list(docs_path.rglob("*.md"))
            print(f"   ({len(md_files)} markdown files)")
            print()
            print("=" * 80)
            print("📝 To fix quick_ingest.py:")
            print("=" * 80)
            print()
            print(f"Use this path:")
            print(f'book_source = Path(r"{docs_path}")')
            break
        break
    search_path = search_path.parent
else:
    print("❌ book-source not found in parent directories")
    print()
    print("💡 Possible solutions:")
    print("1. Clone book-source repository")
    print("2. Download book-source folder")
    print("3. Update quick_ingest.py with correct path")
