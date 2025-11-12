# 📚 RAG Embeddings Guide - Export, Reuse & Extend

> **Complete guide for managing, exporting, and reusing TutorGPT embeddings in other projects**

---

## 📂 **Embedding Files Location**

All RAG embeddings are stored in:

```
backend/data/embeddings/
```

### **File Structure:**

```
backend/data/embeddings/
├── chroma.sqlite3                              # 🗄️ Main ChromaDB database (19MB)
└── d69c732b-0a21-4f5b-a437-47cea526907e/      # 📊 Vector index directory
    ├── data_level0.bin                         # Vector embeddings data
    ├── header.bin                              # Header information
    ├── index_metadata.pickle                   # Index metadata
    ├── length.bin                              # Length information
    └── link_lists.bin                          # HNSW index links
```

**Total Size:** ~19-20 MB (for 107 book lessons)

---

## 📤 **Export Embeddings for Other Projects**

### **Method 1: Copy Entire Directory (Recommended)**

**Windows:**
```powershell
# Copy embeddings to another project
xcopy /E /I backend\data\embeddings "C:\path\to\other-project\embeddings"

# Or use robocopy (faster for large files)
robocopy backend\data\embeddings "C:\path\to\other-project\embeddings" /E
```

**Linux/Mac:**
```bash
# Copy embeddings to another project
cp -r backend/data/embeddings /path/to/other-project/embeddings
```

---

### **Method 2: Create Portable Archive**

**Create ZIP archive:**
```bash
cd backend/data
zip -r embeddings.zip embeddings/

# Or use 7-zip on Windows
7z a embeddings.7z embeddings/
```

**Extract in other project:**
```bash
unzip embeddings.zip -d /path/to/other-project/data/
```

---

## 🔄 **Use Embeddings in Another Project**

### **Step 1: Copy Embeddings**

Copy the entire `embeddings/` folder to your new project:

```
your-new-project/
├── embeddings/                    # ← Paste here
│   ├── chroma.sqlite3
│   └── d69c732b-0a21-4f5b-a437-47cea526907e/
└── your_code.py
```

---

### **Step 2: Python Code to Load Embeddings**

Create `load_embeddings.py`:

```python
import chromadb
from chromadb.config import Settings

# Initialize ChromaDB client pointing to your embeddings
client = chromadb.PersistentClient(
    path="./embeddings",  # Path to embeddings folder
    settings=Settings(
        anonymized_telemetry=False,
        allow_reset=False
    )
)

# Get the collection
collection = client.get_collection(name="book_content")

# Now you can search!
def search_content(query: str, top_k: int = 5):
    """Search the book content using embeddings"""
    results = collection.query(
        query_texts=[query],
        n_results=top_k
    )

    return results

# Example usage
if __name__ == "__main__":
    results = search_content("What is AI-Native Development?")

    print(f"Found {len(results['documents'][0])} results:\n")

    for i, (doc, metadata) in enumerate(zip(results['documents'][0], results['metadatas'][0])):
        print(f"{i+1}. {metadata['chapter']} - {metadata['lesson']}")
        print(f"   Content: {doc[:200]}...")
        print()
```

**Run it:**
```bash
python load_embeddings.py
```

---

### **Step 3: Use with Your Own API**

```python
import os
import chromadb
from openai import OpenAI

# Load embeddings
client = chromadb.PersistentClient(path="./embeddings")
collection = client.get_collection(name="book_content")

# Initialize your LLM
llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ask_question(question: str):
    """RAG-powered Q&A using your embeddings"""

    # 1. Search embeddings for relevant context
    results = collection.query(
        query_texts=[question],
        n_results=3
    )

    # 2. Build context from search results
    context = "\n\n".join(results['documents'][0])

    # 3. Create prompt with context
    prompt = f"""Based on this book content:

{context}

Answer the question: {question}"""

    # 4. Get LLM response
    response = llm.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful AI tutor."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content

# Use it!
answer = ask_question("What is Spec-Driven Development?")
print(answer)
```

---

## ➕ **Add More Content to Embeddings**

### **Option 1: Add New Markdown Files**

**1. Add your markdown files:**
```
book-source/docs/
├── existing-chapters/...
└── your-new-content/              # ← Add new folder
    ├── lesson1.md
    ├── lesson2.md
    └── lesson3.md
```

**2. Run ingestion again:**
```bash
cd backend
uv run python quick_ingest.py
```

This will **add new content** to existing embeddings without deleting old ones!

---

### **Option 2: Add Custom Content Programmatically**

Create `add_custom_content.py`:

```python
import chromadb
from chromadb.config import Settings
import google.generativeai as genai
import os

# Load existing embeddings
client = chromadb.PersistentClient(path="./backend/data/embeddings")
collection = client.get_collection(name="book_content")

# Initialize Gemini for embeddings
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def add_custom_content(content: str, metadata: dict):
    """Add custom content to embeddings"""

    # Generate embedding for new content
    embedding = genai.embed_content(
        model="models/text-embedding-004",
        content=content,
        task_type="retrieval_document"
    )['embedding']

    # Add to collection
    collection.add(
        documents=[content],
        embeddings=[embedding],
        metadatas=[metadata],
        ids=[f"custom_{metadata.get('id', 'new')}"]
    )

    print(f"✅ Added: {metadata.get('title', 'Custom content')}")

# Example: Add your own content
add_custom_content(
    content="""
    Python FastAPI is a modern web framework for building APIs.
    It's fast, easy to use, and supports async operations.
    """,
    metadata={
        "chapter": "Custom Chapter",
        "lesson": "FastAPI Basics",
        "part": "Additional Content",
        "id": "fastapi_001"
    }
)

print("✅ Custom content added to embeddings!")
```

**Run it:**
```bash
cd backend
uv run python add_custom_content.py
```

---

### **Option 3: Merge Multiple Embedding Databases**

If you have embeddings from multiple projects:

```python
import chromadb

# Load source embeddings
source_client = chromadb.PersistentClient(path="./project1/embeddings")
source_collection = source_client.get_collection(name="book_content")

# Load destination embeddings
dest_client = chromadb.PersistentClient(path="./backend/data/embeddings")
dest_collection = dest_client.get_collection(name="book_content")

# Get all data from source
all_data = source_collection.get(include=["documents", "metadatas", "embeddings"])

# Add to destination
dest_collection.add(
    documents=all_data['documents'],
    embeddings=all_data['embeddings'],
    metadatas=all_data['metadatas'],
    ids=[f"merged_{i}" for i in range(len(all_data['documents']))]
)

print(f"✅ Merged {len(all_data['documents'])} documents!")
```

---

## 📊 **Inspect Your Embeddings**

Check what's in your embeddings:

```python
import chromadb

client = chromadb.PersistentClient(path="./backend/data/embeddings")
collection = client.get_collection(name="book_content")

# Get stats
count = collection.count()
print(f"Total documents: {count}")

# Get sample data
sample = collection.peek(limit=5)
print(f"\nSample documents:")
for i, (doc, meta) in enumerate(zip(sample['documents'], sample['metadatas'])):
    print(f"{i+1}. {meta['chapter']} - {meta['lesson']}")
    print(f"   Preview: {doc[:100]}...")
    print()
```

**Output:**
```
Total documents: 587

Sample documents:
1. Part 1 Introducing AI-Driven Development - Chapter 1
   Preview: # The AI Development Revolution

The software development landscape is undergoing its most signif...

2. Part 1 Introducing AI-Driven Development - Chapter 2
   Preview: # AI Turning Point...
```

---

## 🔍 **Search & Query Embeddings**

### **Basic Search:**

```python
import chromadb

client = chromadb.PersistentClient(path="./backend/data/embeddings")
collection = client.get_collection(name="book_content")

# Search by query
results = collection.query(
    query_texts=["How to build AI agents?"],
    n_results=5
)

for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
    print(f"Chapter: {meta['chapter']}")
    print(f"Lesson: {meta['lesson']}")
    print(f"Content: {doc[:200]}...\n")
```

### **Filter by Metadata:**

```python
# Search only in specific chapter
results = collection.query(
    query_texts=["Python basics"],
    n_results=5,
    where={"chapter": {"$contains": "Python"}}
)
```

### **Advanced Search:**

```python
# Search with multiple filters
results = collection.query(
    query_texts=["RAG implementation"],
    n_results=10,
    where={
        "$and": [
            {"chapter": {"$contains": "Building"}},
            {"lesson": {"$contains": "RAG"}}
        ]
    }
)
```

---

## 📦 **Backup & Restore Embeddings**

### **Create Backup:**

```bash
# Full backup with timestamp
cd backend/data
tar -czf embeddings_backup_$(date +%Y%m%d).tar.gz embeddings/

# Or on Windows
7z a embeddings_backup_%date%.7z embeddings/
```

### **Restore from Backup:**

```bash
# Extract backup
tar -xzf embeddings_backup_20250112.tar.gz

# Or on Windows
7z x embeddings_backup_20250112.7z
```

---

## 🚀 **Share Embeddings with Team**

### **Option 1: Git LFS (Large Files)**

```bash
# Install Git LFS
git lfs install

# Track embeddings folder
git lfs track "backend/data/embeddings/**"

# Commit
git add .gitattributes
git add backend/data/embeddings/
git commit -m "Add pre-computed embeddings"
git push
```

### **Option 2: Cloud Storage (AWS S3)**

```bash
# Upload to S3
aws s3 sync backend/data/embeddings/ s3://your-bucket/tutorgpt-embeddings/

# Download in other project
aws s3 sync s3://your-bucket/tutorgpt-embeddings/ ./embeddings/
```

### **Option 3: Google Drive / Dropbox**

1. Upload `backend/data/embeddings/` folder to cloud
2. Share link with team
3. Team downloads and places in their project

---

## 🎯 **Use Cases for Reusing Embeddings**

### **1. Build Chatbot with Same Knowledge**

```python
# Use embeddings in Flask/FastAPI chatbot
from chromadb import PersistentClient

client = PersistentClient(path="./embeddings")
collection = client.get_collection(name="book_content")

@app.post("/chat")
async def chat(question: str):
    # Search embeddings
    results = collection.query(query_texts=[question], n_results=3)
    context = "\n".join(results['documents'][0])

    # Send to LLM with context
    response = llm.generate(context=context, question=question)
    return {"answer": response}
```

### **2. Semantic Search API**

```python
# Build search API using embeddings
@app.get("/search")
async def search(q: str, limit: int = 5):
    results = collection.query(query_texts=[q], n_results=limit)
    return {
        "query": q,
        "results": [
            {
                "content": doc,
                "chapter": meta['chapter'],
                "lesson": meta['lesson']
            }
            for doc, meta in zip(results['documents'][0], results['metadatas'][0])
        ]
    }
```

### **3. Mobile App with Offline Search**

1. Export embeddings
2. Include in mobile app bundle
3. Use ChromaDB mobile client
4. Instant offline semantic search!

---

## 📈 **Embedding Statistics**

Current TutorGPT embeddings:

| Metric | Value |
|--------|-------|
| **Total Chunks** | 587 |
| **Total Lessons** | 107 |
| **Total Chapters** | 13 |
| **Database Size** | ~19 MB |
| **Embedding Model** | text-embedding-004 (Google) |
| **Embedding Dimension** | 768 |
| **Index Type** | HNSW (Hierarchical Navigable Small World) |

---

## ⚙️ **Configuration**

Embedding settings in `backend/.env`:

```env
# Embedding Model
EMBEDDING_MODEL=text-embedding-004
GOOGLE_API_KEY=your_key_here

# ChromaDB Path
CHROMADB_PATH=./data/embeddings

# Embedding Dimensions
EMBEDDING_DIMENSIONS=768

# RAG Search Settings
RAG_TOP_K=5
CHUNK_SIZE=512
CHUNK_OVERLAP=50
```

---

## 🔗 **Integration Examples**

### **Integrate with LangChain:**

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import GoogleGenerativeAIEmbeddings

# Load embeddings with LangChain
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
vectorstore = Chroma(
    persist_directory="./backend/data/embeddings",
    embedding_function=embeddings,
    collection_name="book_content"
)

# Use with LangChain
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
docs = retriever.get_relevant_documents("What is AI-Native Development?")
```

### **Integrate with LlamaIndex:**

```python
from llama_index import VectorStoreIndex
from llama_index.vector_stores import ChromaVectorStore
import chromadb

# Load with LlamaIndex
chroma_client = chromadb.PersistentClient(path="./backend/data/embeddings")
chroma_collection = chroma_client.get_collection("book_content")

vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
index = VectorStoreIndex.from_vector_store(vector_store)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("Explain Spec-Driven Development")
```

---

## 🎓 **Best Practices**

1. ✅ **Backup embeddings** before major updates
2. ✅ **Version control** your embedding files (use Git LFS)
3. ✅ **Document metadata structure** for team collaboration
4. ✅ **Use consistent chunking** when adding new content
5. ✅ **Test searches** after adding new content
6. ✅ **Keep embeddings updated** when book content changes
7. ✅ **Monitor database size** as content grows
8. ✅ **Use same embedding model** for consistency

---

## 🚨 **Common Issues**

**❌ "Collection not found"**
```python
# Solution: Create collection if it doesn't exist
collection = client.get_or_create_collection(name="book_content")
```

**❌ "Path not found"**
```python
# Solution: Use absolute path
import os
embeddings_path = os.path.abspath("./backend/data/embeddings")
client = chromadb.PersistentClient(path=embeddings_path)
```

**❌ "Dimension mismatch"**
- Ensure you use the same embedding model (text-embedding-004)
- Don't mix embeddings from different models

---

## 📚 **Resources**

- **ChromaDB Docs:** https://docs.trychroma.com/
- **Google Embeddings:** https://ai.google.dev/tutorials/embeddings
- **Vector Databases:** https://www.pinecone.io/learn/vector-database/

---

**🎉 Now you can export, reuse, and extend your embeddings in any project!**
