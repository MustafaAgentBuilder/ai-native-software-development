# 🧠 TutorGPT - AI-Native Learning Companion

> **An intelligent AI tutor integrated into the "AI-Native Software Development" book — demonstrating AI-Native development principles in action.**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18%2B-61dafb?logo=react)](https://react.dev)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.5%2B-3ECC5F?logo=docusaurus)](https://docusaurus.io)
[![Open Source](https://img.shields.io/badge/Open%20Source-MIT-green)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)](CONTRIBUTING.md)

---

## 🌟 **OPEN SOURCE PROJECT - Clone, Configure & Run!**

**This is a fully open-source project!** Anyone can:

✅ **Clone this repository**
✅ **Add your own API key** (Gemini, OpenAI, or any OpenAI-compatible API)
✅ **Change the model** (GPT-4, Claude, Gemini, DeepSeek, etc.)
✅ **Run the entire system** in minutes

### 🎯 **One File to Rule Them All: `.env`**

**All configuration happens in ONE place:** `backend/.env`

Change your API key and model → **All agents automatically update!**

```env
# Switch between ANY OpenAI-compatible API
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Want to use OpenAI instead?
# GEMINI_API_KEY=sk-your-openai-key
# GEMINI_MODEL=gpt-4o

# Or DeepSeek, Claude, Groq, etc.
```

**No code changes needed!** The agents automatically detect and use your configuration.

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
- **UV Package Manager** (recommended) - [Install UV](https://docs.astral.sh/uv/)
- **API Key** from ANY of these providers (all FREE tiers available):
  - [Google Gemini](https://aistudio.google.com/apikey) - Recommended
  - [OpenAI](https://platform.openai.com/api-keys)
  - [Groq](https://console.groq.com/keys) - Fast & Free
  - [DeepSeek](https://platform.deepseek.com/)
  - [OpenRouter](https://openrouter.ai/) - Access to 100+ models

### 1. Clone Repository

```bash
git clone https://github.com/MustafaAgentBuilder/ai-native-software-development.git
cd ai-native-software-development/Tutor
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies with UV (recommended)
uv sync

# Or with pip
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env and add YOUR API key
nano .env  # or use any text editor
```

**Edit `backend/.env`:**
```env
# ADD YOUR API KEY HERE (required)
GEMINI_API_KEY=your_api_key_here

# ADD YOUR MODEL (optional - defaults to gemini-2.0-flash-exp)
GEMINI_MODEL=gemini-2.0-flash-exp
```

**That's it!** All agents will automatically use your configuration.

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

## 🔑 Configuration - Switch APIs & Models Easily!

### 🎯 **Core Configuration (Required)**

All you need to change is in `backend/.env`:

```env
# 1️⃣ ADD YOUR API KEY (required)
GEMINI_API_KEY=your_api_key_here

# 2️⃣ CHOOSE YOUR MODEL (optional)
GEMINI_MODEL=gemini-2.0-flash-exp

# 3️⃣ EMBEDDING MODEL (optional - for RAG)
EMBEDDING_MODEL=text-embedding-004
```

### 🔄 **Switch Between API Providers**

**All agents automatically detect and use your configuration!** Just edit `.env`:

#### Option 1: Google Gemini (Recommended - Free)
```env
GEMINI_API_KEY=AIzaSy...your_key
GEMINI_MODEL=gemini-2.0-flash-exp
EMBEDDING_MODEL=text-embedding-004
```
Get key: https://aistudio.google.com/apikey

#### Option 2: OpenAI (GPT-4, GPT-4o)
```env
GEMINI_API_KEY=sk-proj-...your_openai_key
GEMINI_MODEL=gpt-4o
# For embeddings, use Google Gemini or OpenAI embeddings
GOOGLE_API_KEY=AIzaSy...  # Keep for embeddings
EMBEDDING_MODEL=text-embedding-004
```
Get key: https://platform.openai.com/api-keys

**Note:** Change base URL in agent files to OpenAI endpoint:
```python
base_url="https://api.openai.com/v1"
```

#### Option 3: Groq (Ultra Fast - Free)
```env
GEMINI_API_KEY=gsk_...your_groq_key
GEMINI_MODEL=llama-3.1-70b-versatile
# Use Google for embeddings
GOOGLE_API_KEY=AIzaSy...
EMBEDDING_MODEL=text-embedding-004
```
Get key: https://console.groq.com/keys

**Note:** Change base URL in agent files:
```python
base_url="https://api.groq.com/openai/v1"
```

#### Option 4: DeepSeek (Cheap & Powerful)
```env
GEMINI_API_KEY=sk-...your_deepseek_key
GEMINI_MODEL=deepseek-chat
# Use Google for embeddings
GOOGLE_API_KEY=AIzaSy...
EMBEDDING_MODEL=text-embedding-004
```
Get key: https://platform.deepseek.com/

#### Option 5: OpenRouter (100+ Models)
```env
GEMINI_API_KEY=sk-or-v1-...your_openrouter_key
GEMINI_MODEL=google/gemini-flash-1.5
# Or any other model from OpenRouter catalog
# GEMINI_MODEL=anthropic/claude-3.5-sonnet
```
Get key: https://openrouter.ai/

**Note:** Change base URL:
```python
base_url="https://openrouter.ai/api/v1"
```

### ⚙️ **Advanced Configuration (Optional)**

```env
# Application Settings
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# RAG Configuration
RAG_TOP_K=5                # Number of relevant chunks to retrieve
CHUNK_SIZE=512             # Size of text chunks for RAG
CHUNK_OVERLAP=50           # Overlap between chunks

# Agent Behavior
AGENT_TEMPERATURE=0.5      # Creativity (0.0-1.0)
AGENT_MAX_TOKENS=500       # Max response length
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
