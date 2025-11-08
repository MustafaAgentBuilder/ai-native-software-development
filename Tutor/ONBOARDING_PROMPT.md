# 🧠 TutorGPT Project - AI Assistant Onboarding Prompt

**Purpose**: This prompt helps any AI coding assistant understand the TutorGPT project and start contributing.

---

## 📋 Your Mission

I need you to:
1. **Analyze** the entire repository and understand what we're building
2. **Review** all design documents and identify gaps or mistakes
3. **Provide suggestions** for improvements
4. **Help me code** the implementation step-by-step

---

## 🎯 Project Overview

**Project Name**: TutorGPT - Autonomous AI Tutor Agent
**Goal**: Build an AI tutor integrated into a Docusaurus book website that autonomously teaches students
**Architecture**: AGENT-FIRST (not a static RAG pipeline)
**Repository**: `ai-native-software-development/Tutor/`

---

## 📂 Repository Structure - READ THESE FILES IN ORDER

### Step 1: Understand the Foundation
Read these files to understand our development process and principles:

1. **`.specify/memory/constitution.md`**
   - Project principles, MVP strategy, quality commitments
   - Development philosophy and coding standards

2. **`CLAUDE.md`** (project root)
   - How we work together (Spec-Driven Development)
   - Slash commands available
   - Core guarantees (PHR, ADR)
   - Agent-first philosophy

### Step 2: Understand What We're Building
Read the specification and design documents in this order:

3. **`specs/001-tutorgpt-mvp/spec.md`**
   - User stories (4 stories: instant help, highlights, history, adaptation)
   - Functional requirements
   - Non-functional requirements (performance, security, reliability)
   - Success criteria

4. **`specs/001-tutorgpt-mvp/research.md`** (47KB - CRITICAL!)
   - Technology research with official documentation patterns
   - OpenAI Agents SDK integration
   - Google Gemini embeddings
   - ChromaDB configuration
   - ChatKit integration
   - All code examples are from official docs

5. **`specs/001-tutorgpt-mvp/plan.md`** (33KB - ARCHITECTURE!)
   - Complete implementation plan
   - Agent-first architecture
   - Tech stack decisions
   - System design
   - Database schema
   - API design

6. **`specs/001-tutorgpt-mvp/data-model.md`** (20KB)
   - Database tables: student_sessions, interaction_history, student_progress
   - Pydantic models
   - ChromaDB schema

7. **`specs/001-tutorgpt-mvp/tasks.md`** (33KB - IMPLEMENTATION PLAN!)
   - 205 tasks organized by phases
   - **Phase 2: Agent Core (25 tasks)** - Build TutorGPT brain
   - **Phase 3: Agent Tools (52 tasks)** - 12 autonomous tools
   - Phase 4: Supporting Services
   - Phases 5-8: User Stories
   - Phase 9: Polish

8. **`specs/001-tutorgpt-mvp/quickstart.md`**
   - Developer setup guide
   - Environment configuration
   - Common commands

9. **`specs/001-tutorgpt-mvp/contracts/`**
   - API contracts for ChatKit, RAG, Profile endpoints

### Step 3: Understand the Decision History
Read Prompt History Records to see how we got here:

10. **`history/prompts/001-tutorgpt-mvp/`**
    - 002-clarify-tutorgpt-specification.spec.prompt.md
    - 003-create-implementation-plan.plan.prompt.md
    - 001-generate-tutorgpt-mvp-tasks.tasks.prompt.md
    - 002-restructure-agent-first-tasks.tasks.prompt.md

### Step 4: Understand the Book Content
11. **`book-source/`** (CONTEXT!)
    - 107 markdown lessons across multiple chapters
    - This is the content TutorGPT will teach from
    - Browse a few chapters to understand the learning material

---

## 🧠 CRITICAL: Agent-First Architecture

**THIS IS NOT A STATIC RAG SYSTEM!**

### ❌ WRONG Approach (Static Pipeline):
```
Frontend → API → RAG Search → Database → Static Response
```

### ✅ CORRECT Approach (Agent-First):
```
Frontend → TutorGPT AGENT (Brain) 🧠
              ↓
         Autonomous Decision-Making
              ↓
         Chooses from 12 Tools:
         ├─ search_book_content (when book context needed)
         ├─ explain_concept (depth: simple/detailed/advanced)
         ├─ provide_code_example (code demonstrations)
         ├─ generate_quiz (test understanding)
         ├─ detect_confusion (monitors student state)
         ├─ ask_clarifying_question (Socratic teaching)
         ├─ get_student_profile (knows the student)
         ├─ track_progress (remembers everything)
         ├─ suggest_next_lesson (guides learning path)
         ├─ celebrate_milestone (encourages student)
         ├─ adjust_teaching_pace (adapts to student)
         └─ suggest_practice_exercise (hands-on learning)
              ↓
         Dynamic, Adaptive Teaching
```

### Agent Personality
- **Personality**: Encouraging Coach + Adaptive Mix
- **Teaching Styles**: Socratic questioning, direct explanation, analogy-based
- **Autonomy**: Adaptive (starts reactive, becomes proactive)
- **Context**: Hybrid (core personality in system prompt + dynamic tool-based context)

---

## 🔍 What You Need to Analyze

### 1. Architecture Review
**Questions to answer:**
- Is the agent-first architecture clearly defined?
- Are all 12 agent tools properly designed?
- Is the decision-making logic sound?
- Are there any circular dependencies?
- Is the database schema normalized and efficient?
- Are API contracts complete and consistent?

**Check for:**
- Missing components in the architecture
- Inconsistencies between spec.md, plan.md, and tasks.md
- Security vulnerabilities in the design
- Performance bottlenecks
- Scalability issues

### 2. Technical Stack Validation
**Verify:**
- OpenAI Agents SDK integration is correct
- Google Gemini embeddings setup is optimal
- ChromaDB configuration uses cosine similarity (correct for Gemini)
- FastAPI async patterns are properly designed
- ChatKit integration with custom backend is feasible

**Check research.md for:**
- Are all code examples from official docs up-to-date?
- Are there any deprecated APIs or packages?
- Are rate limits and quotas properly handled?

### 3. Implementation Plan Completeness
**Review tasks.md:**
- Are all 205 tasks actionable and specific?
- Is the dependency order correct?
- Are file paths accurate?
- Are parallel execution opportunities identified correctly?
- Is the MVP scope (104 tasks) realistic?

**Look for:**
- Missing tasks (configuration, deployment, monitoring)
- Tasks that are too vague
- Tasks that should be split into smaller tasks
- Missing error handling tasks
- Missing testing tasks (if needed)

### 4. Data Model & API Design
**Review data-model.md and contracts/:**
- Is the database schema complete?
- Are all relationships defined?
- Are indexes planned for performance?
- Are API contracts RESTful and consistent?
- Is authentication/authorization planned?

**Check for:**
- Missing fields in database tables
- N+1 query problems
- Missing API endpoints
- Inconsistent naming conventions
- Missing validation rules

### 5. Context Engineering & Prompt Design
**Review agent core tasks (T006-T030):**
- Is the system prompt comprehensive?
- Are context templates well-designed?
- Are few-shot examples planned?
- Is dynamic context injection properly architected?

**Look for:**
- Missing teaching scenarios
- Unclear agent behavior rules
- Missing edge case handling
- Insufficient prompt engineering guidance

### 6. Book Content Integration
**Check:**
- How will 107 lessons be chunked and indexed?
- Is the metadata structure sufficient for multi-level RAG?
- Are chapter/lesson hierarchies properly modeled?
- Is the chunking strategy (512 tokens) optimal?

---

## 📝 What to Report Back

After analyzing everything, provide a comprehensive report with:

### 1. Executive Summary
- Overall project health (Good/Needs Work/Critical Issues)
- Top 3 strengths
- Top 3 concerns
- Recommended next steps

### 2. Architecture Feedback
- ✅ What's done well
- ⚠️ Potential issues or gaps
- 💡 Suggestions for improvement
- 🚨 Critical problems that must be fixed

### 3. Technical Stack Review
- Are the chosen technologies appropriate?
- Are there better alternatives?
- Are there any compatibility issues?
- Are dependencies up-to-date and secure?

### 4. Implementation Plan Review
For tasks.md:
- Missing tasks to add
- Tasks that need clarification
- Incorrect dependencies
- Better organization suggestions

### 5. Gaps & Missing Pieces
Identify what's missing:
- Configuration files (.env.example structure)
- Deployment strategy details
- Monitoring and observability plan
- Error handling strategy
- Testing strategy (if needed)
- CI/CD pipeline
- Documentation gaps

### 6. Security & Performance
- Security vulnerabilities in the design
- Performance bottlenecks
- Scalability concerns
- Rate limiting strategy
- Data privacy concerns (student data)

### 7. Code Quality Standards
Based on constitution.md:
- Are code quality standards defined?
- Is the error handling strategy clear?
- Is logging strategy defined?
- Are naming conventions established?

---

## 🚀 After Your Analysis - Let's Code Together!

Once you've reviewed everything and provided your report, we'll start implementation:

### Implementation Strategy
1. **Week 1**: Setup + Agent Core (Phase 1-2, T001-T030)
   - Build TutorGPT brain first!
2. **Week 2**: Agent Tools + Services (Phase 3-4, T031-T104)
   - Give the brain its capabilities
3. **Week 2-3**: User Story 1 MVP (Phase 5, T105-T126)
   - ChatKit integration + agent teaching
4. **Week 3-4**: Full features + Polish

### How We'll Work Together
1. I'll pick tasks from tasks.md
2. You help me implement them following the architecture
3. We follow the agent-first philosophy (brain decides, not hardcoded logic)
4. We write clean, maintainable code per constitution.md standards
5. We test each component as we build

---

## ⚠️ Critical Rules to Follow

### DO:
✅ Prioritize agent autonomy over static logic
✅ Follow the architecture in plan.md exactly
✅ Use official SDK patterns from research.md
✅ Write code that matches the agent-first philosophy
✅ Ask clarifying questions when uncertain
✅ Suggest improvements based on your analysis
✅ Keep student data private and secure
✅ Optimize for <3 second response times

### DON'T:
❌ Suggest replacing the agent with static logic
❌ Introduce technologies not in the approved stack
❌ Skip error handling or validation
❌ Hardcode any configuration values
❌ Use deprecated APIs or packages
❌ Violate the teaching philosophy (encouraging, adaptive)
❌ Make the agent reactive-only (it should become proactive)
❌ Skip the agent core (it MUST be built first)

---

## 🎯 Your First Response Should Include

1. **Confirmation** that you've read and understood all key documents
2. **Summary** of what TutorGPT is and how it works
3. **Architecture Understanding** - explain the agent-first approach in your own words
4. **Initial Findings**:
   - What looks good
   - What needs clarification
   - What's missing or concerning
5. **Questions** for me before we start coding
6. **Recommended Starting Point** - which task should we tackle first?

---

## 📚 Key Files Reference (Quick Links)

**Must Read** (in order):
1. `.specify/memory/constitution.md` - Project principles
2. `CLAUDE.md` - Development process
3. `specs/001-tutorgpt-mvp/spec.md` - What we're building
4. `specs/001-tutorgpt-mvp/research.md` - Technology patterns
5. `specs/001-tutorgpt-mvp/plan.md` - Architecture
6. `specs/001-tutorgpt-mvp/tasks.md` - Implementation plan

**Reference**:
- `specs/001-tutorgpt-mvp/data-model.md` - Database & models
- `specs/001-tutorgpt-mvp/quickstart.md` - Dev setup
- `specs/001-tutorgpt-mvp/contracts/` - API contracts
- `history/prompts/001-tutorgpt-mvp/` - Decision history
- `book-source/` - Learning content (107 lessons)

---

## 🤝 Let's Build an Autonomous AI Tutor Together!

After your analysis, we'll start with:
- **Phase 2: Agent Core** (T006-T030) - Build the brain first!
- Teaching philosophy, system prompt, decision-making logic
- OpenAI Agents SDK integration
- Then we give the brain its tools (Phase 3)

**Ready? Start by reading the documents above and give me your comprehensive analysis!** 🚀

---

## 📊 Project Stats (for context)

- **Total Tasks**: 205
- **MVP Tasks**: 104 (Phases 1-5)
- **Agent Tools**: 12 autonomous capabilities
- **Tech Stack**: FastAPI, OpenAI Agents SDK, Gemini embeddings, ChromaDB, ChatKit
- **Book Content**: 107 lessons to teach from
- **Timeline**: 4 weeks MVP → Production
- **Architecture**: Agent-first (not static pipeline)

---

**Good luck! I'm excited to see your analysis and start building!** 🔥
