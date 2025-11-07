---
id: 001
title: Create TutorGPT MVP Specification
stage: spec
date: 2025-11-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-tutorgpt-mvp
branch: 001-tutorgpt-mvp
user: USER
command: /sp.specify
labels: ["specification", "tutorgpt", "mvp", "ai-tutor", "chatkit", "docusaurus"]
links:
  spec: specs/001-tutorgpt-mvp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-tutorgpt-mvp/spec.md
  - specs/001-tutorgpt-mvp/checklists/requirements.md
tests:
  - Specification quality checklist validation (all items passed)
---

## Prompt

```
/sp.specify # 📐 TutorGPT Specification - MVP Features

**Version:** MVP 1.0 (ChatKit + Docusaurus Only)
**Date:** November 8, 2025
**Scope:** Book + Sidebar Agent Interface

---

## 🎯 **Executive Summary**

**What:** AI tutor that appears in sidebar while students read the book
**How:** ChatKit widget integrated into Docusaurus website
**Why:** Students get stuck reading alone - need instant help
**Timeline:** 4 weeks to production launch

---

## 📚 **The Book**

**Title:** AI-Native Software Development
**Website:** https://ai-native.panaversity.org/
**Format:** Docusaurus website with 107 markdown lessons
**Structure:**
- Chapter 1: Introducing AI-Driven Development (4 lessons)
- Chapter 2: AI Tool Landscape (3 lessons)
- Chapter 3: Markdown, Prompt & Context (2 lessons)
- Chapter 4: Python Fundamentals (1 lesson)
- Chapter 5: Spec-Driven Development (4 lessons)
- ...and more

**Our Goal:** Add AI tutor to help students understand this content better.

---

[Full comprehensive specification provided with 7 key features, user personas, user journeys, technical specs, success metrics, MVP scope, and launch criteria - approximately 3500 words total describing the AI tutor system for the Docusaurus book website]
```

## Response snapshot

Created comprehensive specification for TutorGPT MVP following Spec-Driven Development methodology:

**Specification Created**: `specs/001-tutorgpt-mvp/spec.md`

### Key Accomplishments:

1. **Branch Setup**: Confirmed existing branch `001-tutorgpt-mvp` and specs directory structure

2. **Specification Structure**:
   - 4 prioritized user stories (P1-P4) with independent test criteria
   - 25 functional requirements (technology-agnostic)
   - 15 measurable success criteria (no implementation details)
   - 10+ edge cases identified
   - 20+ documented assumptions
   - Clear MVP scope with Phase 2 deferrals

3. **User Stories Created**:
   - P1: First-time student gets instant help (core value)
   - P2: Highlight detection for automatic explanations
   - P3: Session persistence and conversation history
   - P4: Personalized learning adaptation

4. **Quality Validation**:
   - Created `specs/001-tutorgpt-mvp/checklists/requirements.md`
   - Ran 2-iteration validation process
   - Fixed all implementation detail leaks:
     - Removed specific technology names (FastAPI, ChromaDB, LangChain, SQLite, OpenAI)
     - Made all requirements technology-agnostic
     - Updated success criteria to focus on user outcomes
     - Cleaned assumptions section

5. **Validation Results**: ✅ ALL CHECKS PASSED
   - No implementation details in spec
   - All requirements testable and unambiguous
   - Success criteria measurable and technology-agnostic
   - No [NEEDS CLARIFICATION] markers
   - Comprehensive edge cases
   - Clear scope boundaries

### Key Design Decisions:

- **4-level RAG priority system**: Highlighted text > Current lesson > Current chapter > Entire book
- **Performance target**: <3 second response time (95th percentile)
- **Scalability**: Support 100+ concurrent users in MVP
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Session persistence**: Full conversation history across browser sessions
- **Anonymous by default**: No authentication required for MVP

### Files Created:
- `specs/001-tutorgpt-mvp/spec.md` (comprehensive specification)
- `specs/001-tutorgpt-mvp/checklists/requirements.md` (quality validation checklist)

### Ready for Next Phase:
The specification is complete and validated. Ready to proceed with:
- `/sp.clarify` - if any questions arise during review
- `/sp.plan` - to create architectural plan and select technologies

All technology decisions have been properly deferred to the planning phase where they belong.

## Outcome

- ✅ Impact: Complete, validated specification created for TutorGPT MVP feature. Provides clear requirements for AI tutor system integrated into Docusaurus book website. All 4 user stories are independently testable with measurable acceptance criteria.
- 🧪 Tests: Specification quality checklist created and validated (2 iterations). All validation items passed. No implementation details, all requirements testable, success criteria measurable and technology-agnostic.
- 📁 Files: 2 files created - spec.md (main specification) and checklists/requirements.md (validation checklist)
- 🔁 Next prompts: `/sp.plan` to create architectural plan, or `/sp.clarify` if questions arise during spec review
- 🧠 Reflection: Successfully transformed detailed feature description into formal specification. Initial draft contained implementation details (specific technologies) which were caught and removed during validation. This demonstrates the value of the automated checklist - it caught issues that would have leaked tech decisions into the requirements phase. The specification now properly focuses on WHAT and WHY, leaving HOW for the planning phase.

## Evaluation notes (flywheel)

- Failure modes observed: Initial specification included specific technology names (FastAPI, ChromaDB, LangChain, OpenAI, SQLite) in functional requirements and assumptions. This is a common pattern when converting detailed technical descriptions directly into specs. The automated validation checklist caught all instances.
- Graders run and results (PASS/FAIL): Specification quality checklist - PASS (after 2 iterations). All 14 validation criteria passed after removing implementation details.
- Prompt variant (if applicable): Standard /sp.specify workflow with automatic validation and correction loop
- Next experiment (smallest change to try): Consider adding a pre-validation step that flags technology-specific terms before writing the spec, to reduce iteration cycles. Could create a "forbidden words" list for specifications (e.g., framework names, database names, cloud providers).
