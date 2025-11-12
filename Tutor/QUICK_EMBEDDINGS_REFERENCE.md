# 📚 Quick RAG Embeddings Reference

> **TL;DR - Fast commands for working with embeddings**

---

## 📂 **File Locations**

```
backend/data/embeddings/
├── chroma.sqlite3                    # Main database (19MB)
└── d69c732b-0a21-4f5b-a437-47cea526907e/
    ├── data_level0.bin               # Vector data
    ├── header.bin
    ├── index_metadata.pickle
    ├── length.bin
    └── link_lists.bin
```

---

## 📤 **Export Embeddings**

### **Copy to Another Project:**

```bash
# Windows
xcopy /E /I backend\data\embeddings "C:\other-project\embeddings"

# Linux/Mac
cp -r backend/data/embeddings /path/to/other-project/embeddings
```

### **Create Archive:**

```bash
# Windows
7z a embeddings.7z backend\data\embeddings\

# Linux/Mac
tar -czf embeddings.tar.gz backend/data/embeddings/
```

---

## 🔄 **Use in Another Project**

```python
import chromadb

# Load embeddings
client = chromadb.PersistentClient(path="./embeddings")
collection = client.get_collection(name="book_content")

# Search
results = collection.query(
    query_texts=["Your question here"],
    n_results=5
)

# Print results
for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
    print(f"{meta['chapter']} - {meta['lesson']}")
    print(f"{doc[:200]}...\n")
```

---

## ➕ **Add More Content**

### **Option 1: Add Markdown Files**

1. Add `.md` files to `book-source/docs/`
2. Run ingestion:
   ```bash
   cd backend
   uv run python quick_ingest.py
   ```

### **Option 2: Add Programmatically**

```python
import chromadb
import google.generativeai as genai

# Load embeddings
client = chromadb.PersistentClient(path="./backend/data/embeddings")
collection = client.get_collection(name="book_content")

# Generate embedding
genai.configure(api_key="your_key")
embedding = genai.embed_content(
    model="models/text-embedding-004",
    content="Your new content here"
)['embedding']

# Add to collection
collection.add(
    documents=["Your new content here"],
    embeddings=[embedding],
    metadatas=[{"chapter": "Custom", "lesson": "New"}],
    ids=["custom_001"]
)
```

---

## 🔍 **Quick Search Examples**

### **Basic Search:**
```python
results = collection.query(
    query_texts=["What is RAG?"],
    n_results=5
)
```

### **Filter by Chapter:**
```python
results = collection.query(
    query_texts=["Python basics"],
    where={"chapter": {"$contains": "Python"}},
    n_results=5
)
```

### **Get Total Count:**
```python
count = collection.count()
print(f"Total documents: {count}")
```

### **Peek at Data:**
```python
sample = collection.peek(limit=5)
```

---

## 🛠️ **Common Operations**

### **Backup:**
```bash
# Create backup
tar -czf embeddings_backup.tar.gz backend/data/embeddings/
```

### **Restore:**
```bash
# Extract backup
tar -xzf embeddings_backup.tar.gz
```

### **Check Size:**
```bash
# Windows
dir backend\data\embeddings

# Linux/Mac
du -sh backend/data/embeddings/
```

---

## 🚀 **Quick Integration**

### **FastAPI Endpoint:**
```python
from fastapi import FastAPI
import chromadb

app = FastAPI()
client = chromadb.PersistentClient(path="./embeddings")
collection = client.get_collection(name="book_content")

@app.get("/search")
async def search(q: str):
    results = collection.query(query_texts=[q], n_results=5)
    return {"results": results['documents'][0]}
```

### **RAG with OpenAI:**
```python
from openai import OpenAI

def rag_query(question: str):
    # 1. Search embeddings
    results = collection.query(query_texts=[question], n_results=3)
    context = "\n".join(results['documents'][0])

    # 2. Query LLM
    llm = OpenAI()
    response = llm.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f"Context: {context}"},
            {"role": "user", "content": question}
        ]
    )
    return response.choices[0].message.content
```

---

## 📊 **Stats**

| Metric | Value |
|--------|-------|
| Total Chunks | 587 |
| Lessons | 107 |
| Chapters | 13 |
| Size | ~19 MB |
| Model | text-embedding-004 |
| Dimension | 768 |

---

## 🆘 **Troubleshooting**

**Collection not found:**
```python
collection = client.get_or_create_collection(name="book_content")
```

**Permission denied:**
```bash
# Fix permissions (Linux/Mac)
chmod -R 755 backend/data/embeddings/
```

**Path issues:**
```python
import os
path = os.path.abspath("./backend/data/embeddings")
client = chromadb.PersistentClient(path=path)
```

---

📖 **Full Guide:** See [EMBEDDINGS_GUIDE.md](EMBEDDINGS_GUIDE.md) for detailed documentation.
