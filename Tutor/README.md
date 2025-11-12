# 🧠 TutorGPT - AI-Native Learning Companion

> **An intelligent AI tutor integrated into the "AI-Native Software Development" book — demonstrating AI-Native development principles in action.**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18%2B-61dafb?logo=react)](https://react.dev)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.5%2B-3ECC5F?logo=docusaurus)](https://docusaurus.io)
[![Google Gemini](https://img.shields.io/badge/Gemini-API-4285F4?logo=google)](https://ai.google.dev)

---

## 🎯 What is TutorGPT?

TutorGPT is an **AI-Native learning companion** built to demonstrate modern AI-driven development principles. It features:

- **🤖 Dual AI Agents**: Olivia (Co-Learning Agent) and Sidebar Agent for contextual help
- **📚 RAG System**: Retrieval-Augmented Generation using the complete book content
- **💬 Real-time Chat**: WebSocket-based conversational interface
- **🎓 Personalized Learning**: Adaptive teaching based on student progress
- **🔍 Semantic Search**: Find relevant book sections instantly

### Tech Stack

**Backend:**
- Python 3.11+ with FastAPI
- OpenAI Agents SDK
- Google Gemini API (LLM + Embeddings)
- ChromaDB (Vector Database)
- SQLite (Session Management)
- WebSockets (Real-time Communication)

**Frontend:**
- React 18 + TypeScript
- Docusaurus 3.5 (Book Platform)
- Modern UI Components

---

## 📁 Project Structure

```
Tutor/
├── backend/                    # FastAPI Backend Application
│   ├── app/
│   │   ├── agent/              # AI Agents (Olivia & Tutor)
│   │   ├── api/                # API Routes (REST + WebSocket)
│   │   ├── services/           # Business Logic & RAG
│   │   └── tools/              # Teaching Tools & RAG Integration
│   ├── data/                   # SQLite DB & ChromaDB Embeddings
│   ├── tests/                  # Test Suite
│   ├── .env                    # Environment Variables
│   ├── main.py                 # Application Entry Point
│   ├── quick_ingest.py         # Book Content Ingestion
│   └── pyproject.toml          # UV Project Configuration
│
├── book-source/                # Docusaurus Frontend
│   ├── docs/                   # Book Content (107 Lessons)
│   ├── src/                    # React Components
│   └── docusaurus.config.ts   # Docusaurus Configuration
│
├── .claude/                    # Claude Code Commands
├── .specify/                   # Spec-Driven Development Templates
├── history/                    # Prompt History Records (PHR)
├── specs/                      # Feature Specifications
├── CLAUDE.md                   # AI Assistant Instructions
├── ONBOARDING_PROMPT.md        # Development Onboarding
└── README.md                   # This File
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** installed
- **Node.js 18+** and npm
- **UV Package Manager** (recommended)
- **Google Gemini API Key** ([Get one free](https://aistudio.google.com/apikey))

### 1. Clone & Setup

```bash
git clone <repository-url>
cd Tutor
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies with UV
uv sync

# Or with pip
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_key_here
# GOOGLE_API_KEY=your_key_here
```

### 3. Ingest Book Content

```bash
# This creates embeddings for the book content (one-time setup)
uv run python quick_ingest.py

# Expected: ~5-10 minutes for 107 lessons
```

### 4. Start Backend

```bash
uv run uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### 5. Start Frontend

```bash
cd ../book-source
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Configuration

### Environment Variables (`.env`)

```env
# Google Gemini API Keys
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_gemini_api_key_here

# Model Configuration
GEMINI_MODEL=gemini-2.0-flash-exp
EMBEDDING_MODEL=text-embedding-004

# Application Settings
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# RAG Configuration
RAG_TOP_K=5
CHUNK_SIZE=512
CHUNK_OVERLAP=50

# Agent Configuration
AGENT_TEMPERATURE=0.5
AGENT_MAX_TOKENS=500
```

---

## 🤖 AI Agents

### Olivia - Co-Learning Agent

**Personality:** Enthusiastic, motivational, friendly teacher
**Role:** Guide students through the book content with engaging teaching style
**Features:**
- Greets students once and remembers context
- Searches book content before teaching
- Provides real-world analogies and examples
- Tracks student progress and adapts difficulty

**Usage:**
```python
from app.agent.colearning_agent import create_colearning_agent

agent = create_colearning_agent(
    session_id="student_123",
    student_profile={"name": "Alex", "level": "beginner"}
)

response = await agent.teach("teach me Chapter 1")
```

### TutorGPT - Sidebar Agent

**Personality:** Fast, accurate, context-aware helper
**Role:** Answer quick questions while student reads
**Features:**
- Instant answers with book citations
- Context-aware (knows current chapter/lesson)
- Semantic search across all content

**Usage:**
```python
from app.agent.tutor_agent import create_tutor_agent

agent = create_tutor_agent(
    current_chapter="Chapter 1",
    current_lesson="Introduction"
)

response = await agent.teach("What is AI-Native Development?")
```

---

## 📚 RAG System

The RAG (Retrieval-Augmented Generation) system uses ChromaDB for semantic search:

**Book Content:**
- 107 markdown lessons
- 13 chapters across 5 parts
- Semantic embeddings using Google's `text-embedding-004`

**Search Capabilities:**
```python
from app.services.rag_service import search_content

results = search_content(
    query="How do I build AI agents?",
    scope="chapter",  # or "book", "lesson"
    top_k=5
)
```

---

## 🧪 Testing

```bash
cd backend

# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/integration/test_agent_with_llm.py

# Check API health
curl http://localhost:8000/health
```

---

## 📖 API Documentation

Once the backend is running, visit:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/chat` | POST | Send message to agent |
| `/api/colearn/chat` | WebSocket | Real-time chat with Olivia |
| `/api/sidebar/chat` | WebSocket | Quick help sidebar |
| `/api/search` | POST | Search book content |

---

## 🛠️ Development Workflow

This project follows **Spec-Driven Development (SDD)** methodology:

1. **Write Specification** → `/sp.specify`
2. **Clarify Requirements** → `/sp.clarify`
3. **Plan Architecture** → `/sp.plan`
4. **Generate Tasks** → `/sp.tasks`
5. **Implement** → `/sp.implement`
6. **Create ADR** → `/sp.adr` (for significant decisions)
7. **Record History** → `/sp.phr` (automatic)

See `.claude/commands/` for all available slash commands.

---

## 📝 Contributing

This project is part of the **AI-Native Software Development** book and follows:

- **Spec-Driven Development** principles
- **PHR (Prompt History Records)** for all AI interactions
- **ADR (Architecture Decision Records)** for significant decisions
- **Constitution-based development** (see `.specify/memory/constitution.md`)

---

## 🔗 Links

- **Live Book:** [https://ai-native.panaversity.org](https://ai-native.panaversity.org)
- **Panaversity:** [https://panaversity.com](https://panaversity.com)
- **Google Gemini API:** [https://ai.google.dev](https://ai.google.dev)
- **OpenAI Agents SDK:** [https://github.com/openai/agents-sdk](https://github.com/openai/agents-sdk)

---

## 📄 License

This project is part of the **AI-Native Software Development** open-source curriculum.

---

## 🎓 Learn More

This TutorGPT application demonstrates:
- ✅ AI-Native architecture (AI as core feature)
- ✅ RAG implementation with real-world data
- ✅ Multi-agent systems (Olivia + Sidebar)
- ✅ Real-time WebSocket communication
- ✅ Spec-Driven Development workflow
- ✅ Production-ready Python backend
- ✅ Modern React frontend integration

**Built with AI, for teaching AI development.** 🚀
