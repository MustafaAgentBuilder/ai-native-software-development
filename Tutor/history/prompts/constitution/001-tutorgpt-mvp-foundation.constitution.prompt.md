---
id: 001
title: TutorGPT MVP Foundation Constitution
stage: constitution
date: 2025-11-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: Developer
command: /sp.constitution
labels: ["constitution", "mvp", "tutorgpt", "chatkit", "docusaurus", "ai-tutor"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document)
---

## Prompt

```text

# 🏛️ TutorGPT Constitution - MVP Foundation

**Version:** MVP 1.0 (ChatKit + Docusaurus Only)
**Date:** November 8, 2025
**Focus:** Ship Book + Sidebar Agent FAST

---

## 🎯 **Our Mission**

Build an AI tutor that sits beside students as they read the "AI-Native Software Development" book, ready to explain anything instantly.

**MVP Goal:** Ship production-ready ChatKit integration in 4 weeks.

---

## 💎 **Core Principles**

### **1. Ship Fast, Ship Well**

**This means:**
- Focus on ONE thing: Book + ChatKit sidebar
- ChatKit appears on ALL Docusaurus pages
- Multi-level RAG works perfectly
- Agent gives accurate, contextual answers
- Launch in 4 weeks maximum

**Not:**
- Building multiple interfaces at once
- Perfect features before launch
- Custom UI from scratch
- Over-engineering the MVP

### **2. Context is Everything**

**The Agent must know:**
- Which page student is reading
- Which section they're viewing
- What text they highlighted
- Their learning history
- Their confused topics

**This means:**
- Multi-level Agent checks understanding
- Encouragement and guidance

### **5. Personalization Through Observation**

**Agent learns about student by:**
- Tracking questions asked
- Noticing repeated confusion
- Observing reading pace
- Identifying strong topics

**Then adapts:**
- Simpler explanations for confused topics
- Faster pace for strong students
- More examples when needed
- References previous learning

**Not:**
- Annoying surveys
- Manual preference settings
- Forcing students to configure

### **6. Production Quality from Day One**

**MVP means Minimum VIABLE:**
- Fast responses (< 3 seconds)
- Works on all Docusaurus pages
- Accurate answers from book
- Sessions persist
- No critical bugs

**Not:**
- "We'll fix it later" attitude
- Shipping broken features
- Slow or unRAG (4 levels) from day one
- Page context captured automatically
- Highlight detection working
- Session persistence implemented

**Not:**
- Generic answers without context
- Treating every question the same
- Forgetting previous conversations

### **3. The Agent is Autonomous**

**This is NOT a chatbot:**
- Agent understands student's mental model
- Agent decides best teaching approach
- Agent adapts explanations in real-time
- Agent makes autonomous decisions
- Agent greets warmly when student arrives

**Using:**
- OpenAI Agents SDK (latest: https://openai.github.io/openai-agents-python/)
- LangChain for RAG coordination
- GPT-4 for intelligence

**Not:**
- Simple pattern matching
- Static Q&A responses
- One-size-fits-all answers

### **4. Students Learn Better with Help**

**Reading alone is hard:**
- Get stuck on confusing concepts
- Don't know what to ask
- No feedback on understanding
- Easy to quit

**With our Agent:**
- Highlight text → instant explanation
- Ask questions → contextual answers
- reliable system

---

## 🚀 **MVP Strategy**

### **What We're Building:**

**ONE Interface:** Book + ChatKit Sidebar
- Student reads Docusaurus book
- ChatKit widget in corner of every page
- Click to open chat
- Ask questions, get help
- Highlight text for explanations

### **What We're NOT Building (Yet):**

**Save for Phase 2:**
- Standalone chat interface
- Pure conversational learning mode
- Custom frontend
- Mobile app
- User accounts/authentication

### **Why This Strategy:**

**Focus = Speed:**
- 4 weeks to production
- One thing done well
- Proven concept
- Real user feedback

**Then Expand:**
- Add conversational mode later
- Build on solid foundation
- Based on user needs

---

## 🎓 **Learning Philosophy**

### **Students Need Different Help at Different Times:**

**Sometimes they need:**
- Quick definition of a term
- Detailed explanation of concept
- Example to clarify
- Connection to previous learning
- Encouragement to continue

**Agent provides all of these:**
- Autonomously decides what type of help
- Adapts based on context
- Personalizes to student's level

### **Reading + Guidance = Best Learning:**

**Independent reading:**
- Student controls pace
- Can revisit sections
- Builds comprehension skills

**Plus AI guidance:**
- Removes frustration blocks
- Provides instant feedback
- Ensures understanding
- Maintains motivation

---

## 🏗️ **Development Philosophy**

### **Build Backend First:**

**Week 1-2:**
- FastAPI foundation
- Multi-level RAG system
- OpenAI Agents SDK integration
- Session management
- Database setup

**Why first:**
- Backend is the intelligence
- RAG must work perfectly
- Agent needs proper setup
- Can test independently

### **Then Frontend:**

**Week 3:**
- ChatKit integration in Docusaurus
- Context capture
- Highlight detection
- UI polish

**Why second:**
- ChatKit is ready-made UI
- Quick integration
- Backend already tested

### **Finally Polish:**

**Week 4:**
- End-to-end testing
- Performance optimization
- Bug fixes
- Documentation
- Deploy

### **Test Everything:**

**Every component:**
- Unit tests for functions
- Integration tests for API
- End-to-end tests for flows
- Manual testing of UX

**Before shipping:**
- All tests pass
- No critical bugs
- Performance acceptable
- Ready for real users

---

## 💪 **Quality Commitments**

### **To Students:**

**We promise:**
- Agent answers accurately (uses book content)
- Responses come quickly (< 3 seconds)
- Your progress is saved
- The system is reliable
- Help is always available

**We will NOT:**
- Give wrong information
- Let the system be slow
- Lose your conversation history
- Ship with major bugs

### **To the Book:**

**We promise:**
- Respect author's content
- Keep explanations aligned with book
- Cite sources properly
- Direct students to original material

**We will NOT:**
- Misrepresent book content
- Replace the book experience
- Give contradictory information

### **To Ourselves:**

**We promise:**
- Ship in 4 weeks
- Build quality foundation
- Write maintainable code
- Document everything
- Learn from this project

**We will NOT:**
- Miss the deadline
- Cut corners on quality
- Write messy code
- Skip documentation

---

## 🎯 **MVP Success Criteria**

### **We'll Know We Succeeded When:**

**Technical Success:**
- ✅ ChatKit appears on all 107 book pages
- ✅ Agent gives accurate answers from book content
- ✅ Multi-level RAG retrieves correct content
- ✅ Responses come in < 3 seconds
- ✅ Sessions persist across visits
- ✅ Highlighting text triggers correct explanation
- ✅ Zero critical bugs

**User Success:**
- ✅ Students say "This helped me understand"
- ✅ Students return to continue learning
- ✅ Students ask multiple questions (engaged)
- ✅ Students complete more lessons (effective)
- ✅ Positive feedback from real users

**Business Success:**
- ✅ Shipped in 4 weeks
- ✅ Production-ready quality
- ✅ Can demo confidently
- ✅ Ready to scale
- ✅ Foundation for Phase 2

### **We'll Know We Failed If:**

- ❌ Agent gives wrong information
- ❌ System is too slow (> 5 seconds)
- ❌ Students get frustrated
- ❌ Critical bugs in production
- ❌ Can't ship in 4 weeks
- ❌ Code is unmaintainable

---

## 🚀 **Launch Plan**

### **Week 1-2: Backend Core**
Build the intelligence:
- FastAPI setup
- Multi-level RAG working
- OpenAI Agents SDK integrated
- Database and sessions
- API endpoints tested

### **Week 3: ChatKit Integration**
Build the interface:
- ChatKit widget in Docusaurus
- Context capture working
- Highlight detection
- Full integration tested

### **Week 4: Polish & Deploy**
Make it production-ready:
- End-to-end testing
- Performance optimization
- Bug fixes
- Documentation
- Deploy to production

### **Post-Launch:**
- Monitor usage
- Collect feedback
- Fix issues quickly
- Plan Phase 2

---

## 📈 **Post-MVP Roadmap**

### **Phase 2 (After MVP Success):**
**Add Conversational Learning Mode:**
- Standalone chat interface
- Pure agentic teaching
- Agent guides full journey
- Student learns without reading

**Why wait:**
- Prove MVP first
- Learn from users
- Build on solid foundation
- Based on real needs

### **Phase 3 (Future):**
- User accounts/authentication
- Progress analytics
- Multiple books
- Community features
- Mobile app

---

## 🎓 **Team Approach**

### **How We Work:**

**Clear Focus:**
- Everyone knows: Ship Book + Sidebar in 4 weeks
- No scope creep
- No distractions
- Finish what we start

**Communication:**
- Daily progress updates
- Weekly team meetings
- Quick problem solving
- Celebrate wins

**Quality First:**
- Test before commit
- Review each other's code
- Document as we build
- No "quick hacks"

**Fast Iteration:**
- Build → Test → Fix → Repeat
- Don't wait for perfect
- Ship when it works
- Improve continuously

---

## 💡 **Decision Framework**

### **When Making Decisions, Ask:**

**Does this help MVP?**
- ✅ Yes → Do it
- ❌ No → Save for Phase 2

**Does this improve learning?**
- ✅ Yes → Prioritize
- ❌ No → Reconsider

**Can we ship this in 4 weeks?**
- ✅ Yes → Include in MVP
- ❌ No → Move to Phase 2

**Will this work in production?**
- ✅ Yes → Build it properly
- ❌ No → Fix architecture

---

## 🎯 **What Makes This Special**

### **Not Just Another Chatbot:**

**We're building:**
- Autonomous AI Agent (real intelligence)
- Multi-level context awareness
- Deep personalization
- Production-quality system
- Foundation for expansion

**Not building:**
- Simple Q&A bot
- Generic responses
- Prototype/demo
- One-off project

### **Smart MVP Scope:**

**Including:**
- Core value: AI help while reading
- Technical excellence: Multi-level RAG
- Quality: Production-ready
- Foundation: Expandable architecture

**Excluding (for now):**
- Additional interfaces
- Advanced features
- Nice-to-haves
- Unproven concepts

---

## ✅ **Our Commitment**

**We will:**
- Ship production-ready MVP in 4 weeks
- Build autonomous AI Agent properly
- Implement multi-level RAG correctly
- Test everything thoroughly
- Document the system well
- Make students learn better

**We will not:**
- Rush and ship broken code
- Skip testing
- Ignore user needs
- Over-engineer the MVP
- Miss the deadline

---

## 🎉 **Success Vision**

### **4 Weeks from Now:**

**We'll have:**
- ChatKit on all book pages ✅
- Autonomous Agent working ✅
- Multi-level RAG accurate ✅
- Sessions persisting ✅
- Students using it ✅
- Positive feedback ✅
- Ready for Phase 2 ✅

**Students will say:**
- "This helped me understand the book"
- "I could ask questions anytime"
- "The explanations were clear"
- "I completed more lessons"
- "I'm recommending this to others"

**Then we'll add:**
- Conversational learning mode
- More features
- More books
- Scale up

---

## 📜 **Living Constitution**

**This document guides us through MVP.**

**Core principles stay:**
- Ship fast, ship well
- Context is everything
- Agent is autonomous
- Students learn better with help
- Quality from day one

**Review before every sprint.**
**Update as we learn.**
**Always serve the student.**

---

**Signed by the Team**
**MVP Launch:** 4 weeks from today
**Mission:** Help students learn better

---

*"The best teacher is always available. We're building that teacher. Starting with the sidebar."*
```

## Response snapshot

Successfully created TutorGPT Constitution v1.0.0 with comprehensive principles for MVP development.

**Key sections created:**

1. **Core Principles (6 principles):**
   - I. Ship Fast, Ship Well (4-week MVP focus, ChatKit + Docusaurus only)
   - II. Context is Everything (4-level RAG: page → section → chapter → book)
   - III. The Agent is Autonomous (OpenAI Agents SDK + LangChain)
   - IV. Students Learn Better with Help (pedagogical rationale)
   - V. Personalization Through Observation (invisible, automatic adaptation)
   - VI. Production Quality from Day One (< 3 seconds, reliable, tested)

2. **MVP Strategy:**
   - ONE interface: Book + ChatKit sidebar
   - Technical stack: FastAPI, OpenAI Agents SDK, LangChain, PostgreSQL
   - Phase 2 deferred: standalone chat, mobile, user accounts

3. **Development Philosophy:**
   - Week 1-2: Backend (RAG + Agent)
   - Week 3: Frontend (ChatKit integration)
   - Week 4: Polish & Deploy

4. **Quality Commitments:**
   - To Students: accurate, fast, reliable
   - To Book: respect content, cite sources
   - To Team: ship in 4 weeks, maintainable code

5. **Success Criteria:**
   - Technical: ChatKit on 107 pages, 4-level RAG, < 3 sec responses
   - User: "helped me understand", >50% return rate, 5+ questions/session
   - Business: shipped in 4 weeks, production-ready, Phase 2 ready

6. **Governance:**
   - Amendment process defined
   - Compliance requirements (all PRs verify adherence)
   - Versioning: 1.0.0 (MAJOR.MINOR.PATCH)

**Sync Impact Report (in constitution file):**
- Version: [initial] → 1.0.0
- Templates aligned: plan-template.md, spec-template.md, tasks-template.md
- No placeholders remaining
- All sections complete

**Constitution file:** `.specify/memory/constitution.md`

## Outcome

- ✅ Impact: Established project foundation with 6 core principles, MVP strategy, development philosophy, quality commitments, success criteria, and governance structure
- 🧪 Tests: N/A (constitution document - no code)
- 📁 Files: Created/updated `.specify/memory/constitution.md` (713 lines)
- 🔁 Next prompts: `/sp.specify` to create first feature specification, `/sp.plan` to create implementation plan
- 🧠 Reflection: Constitution provides clear focus (4-week MVP: ChatKit + Docusaurus + 4-level RAG + autonomous agent). Decision framework prevents scope creep. All principles have explicit rationale. Smart MVP scope: prove one interface excellently before expanding to Phase 2 (conversational mode).

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution creation completed successfully with all placeholders filled
- Graders run and results (PASS/FAIL): Manual review PASS - all sections complete, rationale provided, no unexplained placeholders, version 1.0.0 established
- Prompt variant (if applicable): Standard constitution creation workflow via `/sp.constitution` command
- Next experiment (smallest change to try): Test constitution compliance by creating first feature spec with `/sp.specify` and verifying alignment with principles
