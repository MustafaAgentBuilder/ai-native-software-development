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

## 🏗️ **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                            │
│                  http://localhost:3000                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📚 Docusaurus Book UI (107 Lessons, 13 Chapters)          │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  🤖 Olivia Chat  │         │ 📌 Sidebar Help  │         │
│  │  (Bottom Right)  │         │  (Right Side)    │         │
│  │  Co-Learning     │         │  Quick Answers   │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                            │                    │
└───────────┼────────────────────────────┼────────────────────┘
            │                            │
            │ WebSocket                  │ WebSocket
            │                            │
┌───────────▼────────────────────────────▼────────────────────┐
│              FASTAPI BACKEND SERVER                          │
│              http://localhost:8000                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔌 REST API          📡 WebSocket API                      │
│  /health              /api/colearn/chat                      │
│  /api/search          /api/sidebar/chat                      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │           AI AGENTS (Olivia + Sidebar)            │      │
│  │  • Reads from .env (API key + model)              │      │
│  │  • Dynamic provider switching (no code changes)   │      │
│  └────────┬─────────────────────────────────┬────────┘      │
│           │                                 │                │
│           ▼                                 ▼                │
│  ┌─────────────────┐             ┌──────────────────┐      │
│  │   🧠 LLM API    │             │  📚 RAG System   │      │
│  │  (Your Choice)  │             │  (ChromaDB)      │      │
│  │                 │             │                  │      │
│  │  • Gemini       │             │  • 107 Lessons   │      │
│  │  • OpenAI       │             │  • Embeddings    │      │
│  │  • Groq         │             │  • Semantic      │      │
│  │  • DeepSeek     │             │    Search        │      │
│  │  • OpenRouter   │             │                  │      │
│  └─────────────────┘             └──────────────────┘      │
│                                                              │
│  💾 SQLite (Session Storage)                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. **User** reads book in browser (Frontend UI)
2. **User** asks question via Olivia or Sidebar chat
3. **Frontend** sends WebSocket message to Backend
4. **Backend Agent** searches RAG system for relevant book content
5. **Backend Agent** sends context + query to LLM API (your chosen provider)
6. **LLM** generates response based on book content
7. **Backend** sends response back via WebSocket
8. **Frontend** displays answer in chat UI

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

### 4. Start Backend Server

```bash
# Make sure you're in backend/ directory
uv run uvicorn app.main:app --reload --port 8000
```

**Backend is now running!**
- 🌐 API Server: `http://localhost:8000`
- 📚 API Docs: `http://localhost:8000/docs`
- 📖 ReDoc: `http://localhost:8000/redoc`
- ✅ Health Check: `http://localhost:8000/health`

**Keep this terminal running!**

### 5. Start Frontend (New Terminal)

Open a **NEW terminal window** and run:

```bash
# Navigate to frontend
cd book-source

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

**Frontend is now running!**
- 🎨 Website: `http://localhost:3000`
- 📚 AI-Native Book with integrated TutorGPT agents
- 💬 Real-time chat with Olivia (Co-Learning Agent)
- 🔍 Sidebar help from TutorGPT

**Your browser will automatically open to `http://localhost:3000`**

---

## 🎨 **Using the TutorGPT UI**

Once both backend and frontend are running, you'll see:

### **📚 Main Book Interface**

The Docusaurus-based book website with:
- **107 lessons** across 13 chapters
- **Interactive navigation**
- **Dark/Light mode toggle**
- **Search functionality**

### **🤖 Olivia - Co-Learning Agent**

**Location:** Click the chat icon (bottom right corner)

**Features:**
- ✅ Greets you warmly on first interaction
- ✅ Teaches book content with enthusiasm
- ✅ Searches the book before answering
- ✅ Provides real-world analogies
- ✅ Tracks your progress through chapters
- ✅ Adaptive teaching based on your level

**Try asking:**
- "Hey Olivia, teach me Chapter 1"
- "What is AI-Native Development?"
- "Explain Spec-Driven Development"
- "Show me Python examples"

### **📌 Sidebar Agent - Quick Help**

**Location:** Sidebar (right side of page)

**Features:**
- ✅ Context-aware (knows which lesson you're reading)
- ✅ Fast answers with book citations
- ✅ Semantic search across all content
- ✅ Perfect for quick clarifications

**Try asking:**
- "Summarize this lesson"
- "What are the key concepts here?"
- "How does RAG work?"

---

## 🚀 **Complete Startup Workflow**

**Terminal 1 (Backend):**
```bash
cd ai-native-software-development/Tutor/backend
uv run uvicorn app.main:app --reload --port 8000
# Wait for "Application startup complete"
```

**Terminal 2 (Frontend):**
```bash
cd ai-native-software-development/Tutor/book-source
npm start
# Wait for browser to open at localhost:3000
```

**Access Points:**
| Service | URL | Purpose |
|---------|-----|---------|
| 📚 **Book UI** | `http://localhost:3000` | Main learning interface |
| 🤖 **Olivia Chat** | Click chat icon in UI | Co-learning agent |
| 📌 **Sidebar Agent** | Right sidebar in UI | Quick help |
| 🔌 **Backend API** | `http://localhost:8000` | REST + WebSocket API |
| 📖 **API Docs** | `http://localhost:8000/docs` | Interactive API documentation |

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

## 🔧 **Troubleshooting**

### **Backend Issues**

#### ❌ "Authentication Error" or "API Rate Limit"
**Problem:** API key invalid or rate limit exceeded

**Solution:**
1. Check your `.env` file has correct `GEMINI_API_KEY`
2. Verify API key is active at provider dashboard
3. For rate limits: Wait 60 seconds or get additional API key
4. Try different provider (e.g., switch from Gemini to Groq)

```bash
# Test your API key
curl http://localhost:8000/health
```

#### ❌ "ModuleNotFoundError" or Import Errors
**Problem:** Dependencies not installed

**Solution:**
```bash
cd backend
uv sync          # Recommended
# OR
pip install -r requirements.txt
```

#### ❌ "Database not found" or RAG Errors
**Problem:** Book content not ingested

**Solution:**
```bash
cd backend
uv run python quick_ingest.py
# Wait 5-10 minutes for ingestion to complete
```

#### ❌ "Port 8000 already in use"
**Problem:** Another process using port 8000

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# OR use different port
uvicorn app.main:app --reload --port 8001
```

---

### **Frontend Issues**

#### ❌ "Cannot connect to backend" or CORS Errors
**Problem:** Backend not running or wrong URL

**Solution:**
1. Ensure backend is running at `http://localhost:8000`
2. Check `backend/.env` has:
   ```env
   CORS_ORIGINS=http://localhost:3000,http://localhost:8000
   ```
3. Restart both backend and frontend

#### ❌ "npm install" Fails
**Problem:** Node version incompatible or corrupted cache

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Use correct Node version (18+)
node --version  # Should be 18.x or higher

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "Port 3000 already in use"
**Problem:** Another app using port 3000

**Solution:**
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# OR use different port
PORT=3001 npm start
```

#### ❌ Agents Not Responding in UI
**Problem:** WebSocket connection failed

**Solution:**
1. Check browser console for errors (F12)
2. Verify backend is running and accessible
3. Test API directly:
   ```bash
   curl http://localhost:8000/health
   ```
4. Check firewall isn't blocking connections
5. Restart both backend and frontend

---

### **Common Questions**

**Q: Can I use this without a paid API key?**
✅ Yes! Google Gemini, Groq, and DeepSeek offer generous free tiers.

**Q: Do I need both backend and frontend running?**
✅ Yes! Backend provides AI agents, frontend provides the UI.

**Q: Can I deploy this to production?**
✅ Yes! See deployment guides in `docs/` folder.

**Q: How do I switch models?**
✅ Just edit `backend/.env` and change `GEMINI_MODEL` - no code changes!

**Q: The ingestion is taking too long!**
⏱️ It processes 107 lessons (5-10 min is normal). Progress shows in terminal.

**Q: Can I use my own book content?**
✅ Yes! Replace files in `book-source/docs/` and re-run ingestion.

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
