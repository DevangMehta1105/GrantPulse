# GrantPulse (Grant & Compliance Lifecycle Operating System)

> **GrantPulse** is an end-to-end Grant & Compliance Lifecycle Operating System designed for Indian MSMEs and NGOs. Its core differentiator is an explainable decision-support layer: a transparent, explainable Abstract Syntax Tree (AST) eligibility engine that tells an organization not just whether it qualifies for a grant, but why, what's missing, and what regulatory steps would unlock higher funding.

---

## 🏛️ Architectural Pillars

1. **Ingestion Layer:** Ingests government and CSR schemes (`myScheme.gov.in`, `csrxchange.gov.in`, BIRAC, Startup India, KVIC, MoMSME).
2. **Explainable AST Eligibility Engine (Core Differentiator #1):** Recursive evaluator (`AND`, `OR`, `NOT`, `GTE`, `LTE`, `EQUALS`, `IN`) comparing applicant profiles against scheme syntax trees with full reasoning traces.
3. **Counterfactual Simulation Engine (Core Differentiator #2):** "What-if" analysis calculating newly unlocked schemes and exact INR delta funding value from compliance additions (12A/80G, Udyam, NGO Darpan, FCRA, CSR-1).
4. **Document Audit & OCR Pipeline:** Hosted OCR regex engine validating GSTIN, PAN, Udyam, 12A/80G, NGO Darpan, CSR-1, and FCRA identifiers with a Document Readiness Score (0-100%).
5. **Deterministic FSM Kanban Workspace:** Lifecycle state transitions (`Discovered` → `Docs Verified` → `Drafting` → `Applied` → `Under Review` → `Sanctioned` / `Rejected`) with transition guards and cryptographically verified **SHA-256 hash chains**.
6. **AI Proposal Co-Pilot & Dossier Exporter:** Synthesizes AST evaluation rules, regulatory parameters, and applicant profile to draft executive summaries and GFR milestone budget tables.
7. **Post-Sanction Ledger & Compliance:** Vouched expense ledger, category cap enforcement, and auto-generated **Utilization Certificate (Form GFR 12-A)**.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4, Lucide Icons, Glassmorphic Dark Design System
- **State & Flow:** React Context, `@dnd-kit`, Recharts
- **Cryptography:** Native Web Crypto API SHA-256 state chain verification
- **Validation:** Regex & AST evaluation engines

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📁 Repository Structure

```
GrantPulse/
├── Spec_v3.md                        # Original Project Specification
├── README.md                         # Project documentation
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with Sidebar & Header
│   │   ├── page.tsx                  # Executive Analytics Dashboard
│   │   ├── schemes/                  # Schemes Catalog & Search
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx         # AST Node Tree Inspector & Requirements
│   │   ├── eligibility/page.tsx      # AST Eligibility Reasoning Trace Inspector
│   │   ├── counterfactual/page.tsx   # "What-If" Delta Funding Simulator
│   │   ├── documents/page.tsx        # Document Vault & OCR Regex Validator
│   │   ├── pipeline/page.tsx         # FSM Kanban Pipeline with SHA-256 Hash Chain
│   │   ├── copilot/page.tsx          # AI Proposal Co-Pilot & Budget Generator
│   │   ├── compliance/page.tsx       # Post-Sanction Ledger & Form GFR 12-A
│   │   └── api/                      # Backend API Endpoints (Schemes, Evaluate, Pipeline)
│   ├── components/
│   │   ├── layout/                   # Sidebar, Header
│   │   ├── ast/                      # Recursive AST Node Visualizer
│   │   └── kanban/                   # Kanban Board & SHA-256 Audit Modal
│   ├── context/
│   │   └── AppContext.tsx            # Global state for Active Org, Schemes, Applications, Docs
│   ├── data/
│   │   ├── seed-organizations.ts     # Sample MSMEs & NGOs
│   │   ├── seed-schemes.ts           # Authentic Indian grant schemes with AST trees
│   │   ├── seed-documents.ts         # OCR-extracted document records
│   │   └── seed-applications.ts      # Kanban applications & audit history
│   └── lib/
│       ├── types.ts                  # Domain TypeScript types
│       ├── utils.ts                  # INR currency formatter, dates, SHA-256 hasher
│       ├── ast-engine/               # Recursive AST evaluator & Counterfactual simulator
│       ├── fsm/                      # Deterministic FSM state machine & SHA-256 logger
│       └── ocr/                      # Indian regulatory regex patterns & validators
```