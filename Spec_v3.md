# Project Specification v3: GrantPulse (Grant & Compliance Lifecycle Operating System)

**Note on this revision:** Full original scope is retained — scraping, OCR, AST matching, FSM/Kanban, semantic matching, LLM co-pilot, post-sanction compliance are all in. What changes from v2 is *how* it gets built: given the actual remaining timeline is 3 months of weekends-only work (~150-200 hours), several components are built on managed/hosted services instead of from-scratch infrastructure, so scope stays intact without requiring 6 months of full-time-equivalent effort. Where a component is described as "production design" below, it means: implement a working version now, describe the fuller production architecture in the report/documentation.

---

## 1. Project Overview & System Purpose
GrantPulse is an end-to-end Grant & Compliance Lifecycle Operating System for Indian MSMEs and NGOs. Its core differentiator is the decision-support layer: a transparent, explainable eligibility engine that tells an organization not just whether it qualifies for a grant, but why, what's missing, and what it would take to qualify. Document verification, application tracking, semantic discovery, and compliance reporting build on top of that core.

---

## 2. Core Architectural Pillars & Developer-Level Implementation

### A. Ingestion Layer — Scraping + Manual Import (Build vs. Use: simplified infra, same capability)
* **Scrapers:** BeautifulSoup4/Playwright (or Cheerio) targeting 2-3 source portals (e.g. `myScheme.gov.in`, `csrxchange.gov.in`). Scheduled as simple weekly scripts (APScheduler or a cron job), not a Celery+Redis worker queue.
* **Resilience:** Basic retry-on-failure and logging is enough for a working demo. Pydantic/Zod schema validation still guards against silent DOM-drift breakage. Full exponential-backoff/queue-based resilience architecture is documented as the intended production design rather than fully implemented under this timeline.
* **Fail-safe path:** Admin CSV/JSON bulk import remains the primary seed method so the demo dataset is never dependent on scrapers succeeding on demo day.
* **Storage:** PostgreSQL with `JSONB` columns for scheme metadata, funding caps, deadlines, prerequisite parameters.

### B. Explainable AST Eligibility Engine (Core Differentiator #1)
* Eligibility criteria as an Abstract Syntax Tree (JSON): `AND`/`OR`/`NOT`, `GTE`/`LTE`/`IN`/`EQUALS`.
* Recursive evaluator compares applicant profile (entity type, turnover, Udyam tier, 12A/80G, NGO Darpan, FCRA, CSR-1, location) against each scheme's tree.
* **Reasoning trace:** returns which AST nodes passed/failed (e.g. "✅ Turnover ≤ ₹5Cr", "❌ Missing 80G registration"), not just a percentage — the core UI centerpiece.
* **Counterfactual / "what-if" matching:** reuses the same evaluator to answer "if this org also had FCRA registration, which additional schemes would it qualify for, and what's the funding delta?"

### C. Semantic Matching Layer (Core Differentiator #2 — Build vs. Use: hosted embeddings)
* Rule-based AST matching handles hard eligibility; this layer catches soft fit — whether a scheme's intent matches an org's mission/activities.
* Use a hosted embeddings API (OpenAI or Cohere) to embed scheme descriptions and org mission statements, store vectors in Postgres via `pgvector`, rank by cosine similarity. No custom model training or infra — a few API calls plus a SQL query.
* Surfaced as a secondary "related schemes you might not have found by rules alone" list.

### D. Document Audit & OCR Pipeline (Build vs. Use: hosted OCR)
* Async upload pipeline (PDF/PNG/JPG).
* **OCR:** use a hosted OCR API (Google Cloud Vision or similar) instead of building a custom OpenCV deskew/denoise/threshold pipeline — same extraction capability, a fraction of the dev time. If a hosted API isn't viable (cost/access), fall back to Tesseract with minimal preprocessing (grayscale + basic threshold only, not a full CV pipeline).
* Regex validation of GSTIN/PAN/12A/80G/Udyam formats; cross-verification against the org's profile; expiry-date checks.
* Computes a per-scheme "Document Readiness Score" and generates actionable upload requirements.

### E. Deterministic FSM & Kanban Workspace
* Transition guards: `Discovered → Docs Verified → Drafting → Applied → Under Review → Sanctioned / Rejected`.
* Drag-and-drop Kanban (`@dnd-kit`) in Next.js.
* User-driven tracking (external reference IDs, filing receipts); automated status poller where public endpoints exist.
* SHA-256 hash chain linking each state transition — cheap, strong audit-integrity talking point.

### F. AI-Assisted Proposal Co-Pilot & Dossier Exporter
* LLM API integration with system prompts combining scheme evaluation guidance + validated applicant profile.
* Drafts executive summary, milestone-based budget breakdown table, SROI/impact KPIs.
* Exports a ready-to-file PDF dossier (PDFKit/ReportLab).

### G. Post-Sanction Fund Utilization & Milestone Compliance
* Tranche/expense ledger unlocked once an application reaches `Sanctioned`.
* Budget-cap enforcement against category thresholds.
* Auto-generated Utilization Certificate (Form GFR 12-A) summary.
* **Designated fallback pillar:** if a weekend is lost anywhere in the plan, simplify here first (e.g. ledger + cap check only, skip the auto-generated certificate) rather than cutting A-F.

---

## 3. Technology Stack Specification

* **Frontend:** Next.js (App Router, TypeScript), Tailwind CSS, Lucide Icons, Shadcn UI/Radix, `@dnd-kit`, Recharts.
* **Backend:** Python (FastAPI) or Node.js (Express/Hono), Pydantic/Zod validation.
* **Background jobs:** APScheduler or cron-triggered scripts — not Celery+Redis, to keep ops overhead low for a solo weekends-only build.
* **OCR:** Hosted OCR API (primary) or Tesseract with minimal preprocessing (fallback).
* **Semantic matching:** Hosted embeddings API (OpenAI/Cohere) + `pgvector`.
* **Data & Storage:** PostgreSQL (Supabase/Neon) with `pg_trgm` + `pgvector`; S3-compatible object storage; RBAC, RLS, JWT auth.
* **Build acceleration:** Use Antigravity/AI-assisted coding aggressively for boilerplate (CRUD routes, schema definitions, Kanban scaffolding, form validation) to reclaim hours for the differentiator pillars (B, C).

---

## 4. Key Data Entities & Relationships
1. `Organizations`: `id`, `name`, `entity_type`, `turnover`, `incorporation_date`, `udyam_tier`, `compliance_flags` (JSONB), `mission_description`, `created_at`.
2. `Schemes`: `id`, `source_type` (scraped/manual/csv), `source_portal`, `title`, `description`, `grant_type`, `max_funding_amount`, `deadline`, `eligibility_ast` (JSONB), `required_documents` (JSONB), `embedding_vector`, `created_at`.
3. `UserDocuments`: `id`, `org_id`, `doc_type`, `file_url`, `ocr_extracted_data` (JSONB), `verification_status`, `verified_at`.
4. `Applications`: `id`, `org_id`, `scheme_id`, `current_state`, `external_application_id`, `match_score`, `match_trace` (JSONB), `state_history` (JSONB with SHA-256 signatures), `created_at`.
5. `GrantExpenses`: `id`, `application_id`, `category`, `amount`, `invoice_url`, `is_compliant`, `timestamp`.

---

## 5. Execution Plan — 12 Weekends (3 Months, Weekends Only)

| Weekends | Focus |
|---|---|
| 1-2 | Schema + seed dataset + AST engine + explainability trace |
| 3 | Scraping workers (2-3 sources, simple retry, no queue infra) |
| 4-5 | Document vault + hosted OCR + regex validation |
| 6-7 | FSM Kanban + SHA-256 audit log |
| 8 | Counterfactual matching |
| 9 | Semantic matching (hosted embeddings + pgvector) |
| 10 | LLM co-pilot (exec summary + budget table) |
| 11 | Post-sanction ledger + compliance cert (fallback pillar if behind) |
| 12 | Polish, deploy, demo prep |

**No buffer weekend exists in this plan.** If any weekend slips, Pillar G (post-sanction compliance) is the pre-agreed place to simplify first — not B or C, which carry the project's core narrative.
