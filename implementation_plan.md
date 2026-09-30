# Implementation Plan: Regulatory Intelligence Hub India

## Executive Summary
**Regulatory Intelligence Hub India** is an enterprise-grade regulatory intelligence and compliance research web platform tailored for Indian financial institutions, digital payment operators, cloud governance, cybersecurity, audit, and risk officers.

The platform continuously tracks, indexes, extracts, and summarizes regulatory publications from five key Indian regulators:
1. **Reserve Bank of India (RBI)**
2. **Securities and Exchange Board of India (SEBI)**
3. **Indian Computer Emergency Response Team (CERT-In)**
4. **National Payments Corporation of India (NPCI)**
5. **Insurance Regulatory and Development Authority of India (IRDAI)**

The system strictly enforces a **Three-Layer Content Separation Principle**:
- **Layer 1: Original Regulatory Document** (Immutable raw artifact, cryptographic hash, provenance URL)
- **Layer 2: Extracted Document Text** (Authoritative normalized plain text, page/section segmentation)
- **Layer 3: AI-Generated Interpretation** (Summaries, impacts, obligations, explicit citations to Layer 2, labeled as non-legal advisory interpretation)

---

## Phased Implementation Roadmap

### Phase 1: Architecture, Data Modeling & Project Foundations
- [x] Inspect workspace and runtime environment (Node v22.14, npm 10.9).
- [x] Create foundation planning documents:
  - `implementation_plan.md`
  - `architecture.md`
  - `data_model.md`
  - `source_registry.md`
  - `test_strategy.md`
- [x] Scaffold Next.js 14+ App Router project with TypeScript, Tailwind CSS, Lucide Icons.
- [x] Set up Prisma ORM with SQLite for zero-friction local execution (and Postgres-ready schema parity).
- [x] Configure environment variables template (`.env.example`) and application configuration.

### Phase 2: Database, Seed Engine & Source Connector Framework
- [x] Implement Prisma schema covering all 15 core entities:
  - `Regulator`, `SourceConnector`, `RegulatoryDocument`, `RegulatorySummary`, `Topic`, `DocumentTopic`, `SourceCitation`, `User`, `Watchlist`, `SavedSearch`, `Bookmark`, `ChatConversation`, `ChatMessage`, `IngestionJob`, `AuditLog`.
- [x] Implement database seed script containing:
  - 5 Indian Regulators (RBI, SEBI, CERT-In, NPCI, IRDAI).
  - 10 Initial Regulatory Topics (Cybersecurity, Technology Risk, AI Governance, Cloud Adoption, Outsourcing & Third-Party Risk, Data Protection, Digital Payments, Cyber Incident Reporting, Business Continuity & DR, Operational Resilience, IT Governance).
  - 4 Standard Enterprise Roles (`VISITOR`, `REGISTERED_USER`, `REVIEWER`, `ADMINISTRATOR`).
  - Seed users for verification.
  - Realistic clearly-labelled fixture documents (`isDemo: true`, `[DEMO_DATA]` label) for offline development.
- [x] Develop extensible `BaseSourceConnector` interface and lifecycle:
  - `checkForUpdates()`, `listDocuments()`, `fetchDocumentMetadata()`, `downloadOriginalDocument()`, `extractText()`, `generateFingerprint()`, `detectDuplicate()`, `detectDocumentRelationships()`, `saveDocument()`, `reportHealth()`.
- [x] Implement live connector for **CERT-In (Indian Computer Emergency Response Team)** public security advisories and circulars feed.
- [x] Implement connector shells for RBI, SEBI, NPCI, and IRDAI with rate limiting, user-agent compliance, and fixture failover.
- [x] Implement SHA-256 document hashing and deduplication pipeline.

### Phase 3: Extraction, AI Summarization Pipeline & Core UI
- [x] Implement document text extraction pipeline (HTML parser, text-based PDF extractor, structured section segmentation).
- [x] Build AI provider abstraction:
  - Interface `AIModelProvider` (`generateSummary`, `generateChatResponse`, `extractCitations`).
  - Native rule-based + LLM prompt-grounded provider fallback (Google Gemini / Anthropic / OpenAI compatible with structured JSON output and schema validation).
  - Version-controlled prompt templates (`src/prompts/regulatory_summary_v1.ts`, `src/prompts/regulatory_chat_v1.ts`).
  - Strict validation using Zod schemas for `RegulatorySummaryPayload`.
- [x] Develop Navigation & Layout:
  - Top navigation with search, role switchers, disclaimer badges, live update timestamp.
  - Institutional Navy (`#0A192F` / `#0F172A`) and slate/teal theme.
  - High-contrast accessible design without distracting motion.
- [x] Build **Home Page (`/`)**:
  - Hero with global search and Ask Regulatory Assistant call-to-action.
  - Last source refresh banner and official disclaimer.
  - Latest regulatory developments grid with multi-attribute cards.
  - High-impact updates section.
  - Topics breakdown and regulator status badges.
  - Email digest simulation signup.
- [x] Build **Updates Page (`/updates`)**:
  - Multi-faceted filtering (regulator, topic, document type, status, verification status, dates).
  - Instant client and server-side search, sort controls, reset filters, pagination.
- [x] Build **Document Detail Page (`/documents/[id]`)**:
  - Clear 3-tier visual hierarchy (Official Metadata, Authoritative Extracted Text, AI Interpretation).
  - Summary sections: Executive Summary, Why Issued, Affected Entities, Key Requirements (Mandatory vs Advisory), Important Dates, Cybersecurity / Tech / Operational Impacts.
  - Document relationships (amends, supersedes, withdrawn).
  - Supporting source passages modal/drawer with highlighted citations.
  - Bookmark and "Ask a question about this document" actions.

### Phase 4: Search Engine & Regulatory Assistant (RAG Chat)
- [x] Implement multi-modal search service:
  - Keyword and full-text search across titles, document numbers, extracted text, and summaries.
  - Document number exact matching (e.g. `CERT-In/ADV-2024`, `RBI/2023-24/105`).
  - Search result relevancy scoring with matched passage snippet highlighting.
- [x] Build **Search Results Page (`/search`)**:
  - Structured results showing "Why it matched" and official source jump links.
- [x] Implement Grounded Regulatory Assistant service:
  - Contextual retrieval strictly from indexed official documents.
  - Anti-hallucination and prompt injection guards: ignores prompt overrides found inside regulatory text.
  - Strict mandatory citation generation linking to section and document ID.
  - Insufficient evidence refusal clause ("I could not find sufficient supporting information in the indexed official documents.").
  - Ambiguity resolution mechanism with single narrowing question.
  - Conflict detection across regulators or superseded documents.
- [x] Build **Regulatory Assistant Page (`/assistant`)**:
  - Conversational chat UI with history, starter question pills, and session management.
  - Document scoping selector (all documents vs specific document).
  - Sources & citations inspection drawer.
  - Copy response, feedback controls, clear conversation.

### Phase 5: User Workspaces, Watchlists & Governance Interfaces
- [x] Role-Based Access Control (RBAC) & mockable authentication session provider:
  - Role switcher for testing (`Visitor`, `Compliance Officer`, `Lead Reviewer`, `System Administrator`).
  - Protected API routes and page guards.
- [x] Build **Watchlist Page (`/watchlists`)**:
  - Custom watchlist builder (regulators, topics, frequency: daily/weekly).
  - Digest preview simulator showing matching updates.
- [x] Build **Bookmarks & Saved Searches (`/saved`)**:
  - Persisted user bookmarks with notes.
  - Saved query rerun and management.
- [x] Build **Reviewer Workbench (`/reviewer`)**:
  - Protected queue for documents in `AI_GENERATED` or `PENDING_REVIEW` states.
  - Side-by-side view: Original extracted text vs AI-generated summary.
  - Verification controls: Approve, Reject, Request Regeneration, Reviewer Notes.
  - Audit log recorder.
- [x] Build **Administration Dashboard (`/admin`)**:
  - Source connector telemetry (status, last check, failure counters, trigger manual sync).
  - Manual document upload form for administrative ingestion.
  - Duplicate detection queue and partial extraction alerts.
  - System audit logs and metrics.

### Phase 6: Quality Engineering, Verification & Documentation
- [x] Automated Unit & Integration Tests:
  - Metadata parsing, date parsing, document hashing, duplicate detection.
  - Summary schema validation, search filters, citation construction.
  - Grounded RAG refusal & safety guards against injection in documents.
  - Reviewer workflow authorization checks.
- [x] Verification of all key user journeys (Home, Search, Details, Assistant, Watchlists, Reviewer, Admin).
- [x] Comprehensive `README.md` with exact local setup and architecture documentation.
- [x] Deliver project artifacts and final status report.
