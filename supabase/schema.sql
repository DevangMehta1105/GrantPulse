-- ==============================================================================
-- GrantPulse: Grant & Compliance Lifecycle Operating System
-- PostgreSQL / Supabase Production Schema & Seed Migration
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    turnover_inr BIGINT NOT NULL DEFAULT 0,
    incorporation_date DATE NOT NULL,
    years_of_operation INT NOT NULL DEFAULT 0,
    udyam_tier TEXT NOT NULL DEFAULT 'None',
    state TEXT NOT NULL,
    sector TEXT NOT NULL,
    compliance_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    mission_description TEXT NOT NULL DEFAULT '',
    contact_email TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Schemes Table
CREATE TABLE IF NOT EXISTS schemes (
    id TEXT PRIMARY KEY,
    source_type TEXT NOT NULL CHECK (source_type IN ('scraped', 'manual', 'csv')),
    source_portal TEXT NOT NULL,
    title TEXT NOT NULL,
    ministry_or_funder TEXT NOT NULL,
    description TEXT NOT NULL,
    grant_type TEXT NOT NULL,
    max_funding_amount BIGINT NOT NULL DEFAULT 0,
    min_funding_amount BIGINT,
    subsidy_percentage NUMERIC(5,2),
    deadline TEXT NOT NULL DEFAULT 'Rolling (Open All Year)',
    sector TEXT[] NOT NULL DEFAULT '{}',
    official_portal_url TEXT,
    eligibility_ast JSONB NOT NULL DEFAULT '{}'::jsonb,
    required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Documents Vault Table
CREATE TABLE IF NOT EXISTS user_documents (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INT NOT NULL DEFAULT 0,
    file_url TEXT NOT NULL DEFAULT '',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('VERIFIED', 'FAILED', 'PENDING_REVIEW')),
    ocr_extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    validation_errors TEXT[] NOT NULL DEFAULT '{}',
    verified_at TIMESTAMPTZ
);

-- 5. Applications Pipeline Table (with SHA-256 Chained History)
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scheme_id TEXT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    current_state TEXT NOT NULL CHECK (current_state IN ('Discovered', 'Docs Verified', 'Drafting', 'Applied', 'Under Review', 'Sanctioned', 'Rejected')),
    external_application_id TEXT,
    filing_receipt_url TEXT,
    match_score INT NOT NULL DEFAULT 0,
    match_trace JSONB,
    requested_amount BIGINT NOT NULL DEFAULT 0,
    sanctioned_amount BIGINT,
    state_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Grant Expenses Ledger (GFR 12-A Post-Sanction Compliance)
CREATE TABLE IF NOT EXISTS grant_expenses (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount BIGINT NOT NULL,
    invoice_number TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    invoice_url TEXT NOT NULL DEFAULT '',
    is_compliant BOOLEAN NOT NULL DEFAULT true,
    compliance_notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Indexes for High Performance AST Queries & Search
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orgs_state_sector ON organizations (state, sector);
CREATE INDEX IF NOT EXISTS idx_orgs_compliance ON organizations USING GIN (compliance_flags);

CREATE INDEX IF NOT EXISTS idx_schemes_grant_type ON schemes (grant_type);
CREATE INDEX IF NOT EXISTS idx_schemes_portal ON schemes (source_portal);
CREATE INDEX IF NOT EXISTS idx_schemes_ast ON schemes USING GIN (eligibility_ast);
CREATE INDEX IF NOT EXISTS idx_schemes_docs ON schemes USING GIN (required_documents);
CREATE INDEX IF NOT EXISTS idx_schemes_title_trgm ON schemes USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_docs_org_type ON user_documents (org_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_docs_ocr ON user_documents USING GIN (ocr_extracted_data);

CREATE INDEX IF NOT EXISTS idx_apps_org_scheme ON applications (org_id, scheme_id);
CREATE INDEX IF NOT EXISTS idx_apps_state ON applications (current_state);
CREATE INDEX IF NOT EXISTS idx_apps_state_history ON applications USING GIN (state_history);

CREATE INDEX IF NOT EXISTS idx_expenses_app ON grant_expenses (application_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_expenses ENABLE ROW LEVEL SECURITY;

-- Permissive demo policies (allows full public read/write for GrantPulse OS workflow)
CREATE POLICY "Allow public read organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Allow public insert organizations" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update organizations" ON organizations FOR UPDATE USING (true);

CREATE POLICY "Allow public read schemes" ON schemes FOR SELECT USING (true);
CREATE POLICY "Allow public insert schemes" ON schemes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update schemes" ON schemes FOR UPDATE USING (true);

CREATE POLICY "Allow public read user_documents" ON user_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_documents" ON user_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_documents" ON user_documents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete user_documents" ON user_documents FOR DELETE USING (true);

CREATE POLICY "Allow public read applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update applications" ON applications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete applications" ON applications FOR DELETE USING (true);

CREATE POLICY "Allow public read grant_expenses" ON grant_expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert grant_expenses" ON grant_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update grant_expenses" ON grant_expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete grant_expenses" ON grant_expenses FOR DELETE USING (true);

CREATE POLICY "Allow public delete organizations" ON organizations FOR DELETE USING (true);
CREATE POLICY "Allow public delete schemes" ON schemes FOR DELETE USING (true);

