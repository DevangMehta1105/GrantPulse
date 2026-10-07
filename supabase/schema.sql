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

CREATE POLICY "Allow public read applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update applications" ON applications FOR UPDATE USING (true);

CREATE POLICY "Allow public read grant_expenses" ON grant_expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert grant_expenses" ON grant_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update grant_expenses" ON grant_expenses FOR UPDATE USING (true);

-- ==============================================================================
-- Initial High-Entropy Seed Data
-- ==============================================================================

-- Seed Organizations
INSERT INTO organizations (id, name, entity_type, turnover_inr, incorporation_date, years_of_operation, udyam_tier, state, sector, compliance_flags, mission_description, contact_email)
VALUES 
(
    'org-vidyut-ev',
    'Vidyut Micro Mobility Private Limited',
    'Private Limited',
    42000000,
    '2022-09-01',
    2,
    'Micro',
    'Karnataka',
    'CleanTech & EV Manufacturing',
    '{"hasGstin": true, "gstin": "29AABCV9821K1Z3", "hasPan": true, "pan": "AAACG0567K", "hasUdyam": true, "udyamNumber": "UDYAM-KR-03-0048192", "has12A": false, "has80G": false, "hasNgoDarpan": false, "hasFcra": false, "hasCsr1": false, "isWomanLed": false, "isScStLed": false, "isGreenfield": true}'::jsonb,
    'Designing and manufacturing ruggedized solar-assisted electric freight two-wheelers for tier-2/3 agricultural and parcel logistics across Southern India.',
    'compliance@vidyutmobility.in'
),
(
    'org-arogya-trust',
    'Arogya Rural Healthcare & Water Trust',
    'Trust',
    18500000,
    '2019-04-12',
    5,
    'None',
    'Maharashtra',
    'Healthcare, WASH & Rural Livelihoods',
    '{"hasGstin": true, "gstin": "27AAATA4921K1Z9", "hasPan": true, "pan": "AABTA4921K", "hasUdyam": false, "has12A": true, "reg12ANumber": "AABTA4921KE20214", "has80G": true, "reg80GNumber": "AABTA4921KG20218", "hasNgoDarpan": true, "ngoDarpanId": "MH/2021/0289141", "hasFcra": false, "hasCsr1": true, "csr1Number": "CSR00049281", "isWomanLed": true, "isScStLed": false, "isGreenfield": false}'::jsonb,
    'Providing point-of-use solar-powered UV water filtration plants and primary diagnostic maternal health camps in tribal villages of Gadchiroli and Nandurbar.',
    'director@arogyatrust.org'
),
(
    'org-greenroots-ngo',
    'GreenRoots Agro Ecology Society',
    'Society',
    8200000,
    '2021-06-15',
    3,
    'None',
    'Rajasthan',
    'Agritech & Climate Resilience',
    '{"hasGstin": false, "hasPan": true, "pan": "AABTG8812M", "hasUdyam": false, "has12A": true, "reg12ANumber": "AABTG8812ME20221", "has80G": false, "hasNgoDarpan": true, "ngoDarpanId": "RJ/2022/0319482", "hasFcra": false, "hasCsr1": true, "csr1Number": "CSR00088192", "isWomanLed": false, "isScStLed": false, "isGreenfield": false}'::jsonb,
    'Empowering arid smallholder farmers with regenerative millet agroforestry, drip fertigation units, and community seed banks in Western Rajasthan.',
    'projects@greenrootsagro.org'
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    turnover_inr = EXCLUDED.turnover_inr,
    compliance_flags = EXCLUDED.compliance_flags;

-- Seed Schemes
INSERT INTO schemes (id, source_type, source_portal, title, ministry_or_funder, description, grant_type, max_funding_amount, deadline, sector, official_portal_url, eligibility_ast, required_documents, tags)
VALUES
(
    'scheme-msme-zed-subsidy',
    'scraped',
    'myScheme.gov.in',
    'MSME Sustainable (ZED) Certification Scheme 2.0',
    'Ministry of Micro, Small and Medium Enterprises',
    'Financial assistance up to ₹5.00 Lakhs for obtaining Bronze, Silver, and Gold Zero Defect Zero Effect (ZED) certification with 80% subsidy for Micro enterprises.',
    'Subsidy',
    500000,
    '2026-12-31',
    ARRAY['Manufacturing & CleanTech', 'General MSME'],
    'https://zed.msme.gov.in',
    '{"operator": "AND", "children": [{"field": "complianceFlags.hasUdyam", "operator": "EQUALS", "value": true, "description": "Must hold an active Udyam Registration"}, {"field": "turnoverInr", "operator": "LTE", "value": 500000000, "description": "Turnover must not exceed ₹50.00 Cr"}, {"field": "complianceFlags.hasGstin", "operator": "EQUALS", "value": true, "description": "Must possess a verified GSTIN"}]}'::jsonb,
    '[{"docType": "UDYAM_CERTIFICATE", "name": "Udyam Registration Certificate", "isMandatory": true, "description": "MoMSME Udyam certificate"}, {"docType": "GSTIN_CERTIFICATE", "name": "GST Registration (REG-06)", "isMandatory": true, "description": "Form REG-06 showing principal place of business"}, {"docType": "PAN_CARD", "name": "PAN Card", "isMandatory": true, "description": "Original entity PAN"}]'::jsonb,
    ARRAY['myScheme.gov.in', 'Subsidy', 'ZED 2.0', 'MoMSME']
),
(
    'scheme-tata-wash-csr',
    'scraped',
    'csrxchange.gov.in',
    'Tata Trusts Community Safe Drinking Water & Health Grant 2026',
    'Tata Trusts & Allied Philanthropies',
    'Multi-year CSR grant support up to ₹1.25 Crores for grassroots NGOs deploying scalable community water filtration, WASH infrastructure, and maternal healthcare interventions.',
    'CSR Grant',
    12500000,
    '2026-10-15',
    ARRAY['WASH, Healthcare & Rural Livelihoods', 'Philanthropy'],
    'https://www.csrxchange.gov.in',
    '{"operator": "AND", "children": [{"field": "entityType", "operator": "IN", "value": ["Trust", "Society", "Section 8"], "description": "Must be a registered Non-Profit entity"}, {"field": "complianceFlags.has12A", "operator": "EQUALS", "value": true, "description": "Active Section 12A / 12AB tax exemption"}, {"field": "complianceFlags.has80G", "operator": "EQUALS", "value": true, "description": "Active Section 80G Tax Exemption Certificate"}, {"field": "complianceFlags.hasCsr1", "operator": "EQUALS", "value": true, "description": "Valid MCA Form CSR-1 Registration"}, {"field": "complianceFlags.hasNgoDarpan", "operator": "EQUALS", "value": true, "description": "Active NITI Aayog NGO Darpan registration"}]}'::jsonb,
    '[{"docType": "12A_REGISTRATION", "name": "Form 10AC Section 12A Order", "isMandatory": true, "description": "Income tax 12A registration"}, {"docType": "80G_REGISTRATION", "name": "Form 10AC Section 80G Order", "isMandatory": true, "description": "80G donor tax exemption"}, {"docType": "CSR1_CERTIFICATE", "name": "MCA Form CSR-1 Letter", "isMandatory": true, "description": "CSR registration letter from MCA"}, {"docType": "NGO_DARPAN_CERTIFICATE", "name": "NITI Aayog Darpan Certificate", "isMandatory": true, "description": "NGO Darpan acknowledgment"}]'::jsonb,
    ARRAY['csrxchange.gov.in', 'CSR Grant', 'Tata Trusts', '12A/80G']
),
(
    'scheme-sisfs-dpiit',
    'scraped',
    'startupindia.gov.in',
    'Startup India Seed Fund Scheme (SISFS) - Prototyping & Scale-up',
    'Department for Promotion of Industry and Internal Trade (DPIIT)',
    'Grant assistance up to ₹20.00 Lakhs for validation of Proof of Concept and prototype development for DPIIT-recognized early-stage startups.',
    'Equity-free Grant',
    2000000,
    'Rolling (Quarterly Cycles)',
    ARRAY['DeepTech, Hardware & Software Startups', 'Innovation'],
    'https://www.startupindia.gov.in',
    '{"operator": "AND", "children": [{"field": "entityType", "operator": "IN", "value": ["Private Limited", "LLP"], "description": "Must be incorporated as a Private Limited Company or LLP"}, {"field": "turnoverInr", "operator": "LTE", "value": 50000000, "description": "Annual turnover must not exceed ₹5.00 Cr"}, {"field": "yearsOfOperation", "operator": "LTE", "value": 2, "description": "Must be incorporated for 2 years or less"}]}'::jsonb,
    '[{"docType": "PAN_CARD", "name": "Company PAN Card", "isMandatory": true, "description": "Corporate PAN"}, {"docType": "GSTIN_CERTIFICATE", "name": "GST Registration (REG-06)", "isMandatory": true, "description": "GSTIN certificate"}, {"docType": "PROJECT_PROPOSAL", "name": "Technical Proposal & Milestone Budget", "isMandatory": true, "description": "Detailed prototype workplan"}]'::jsonb,
    ARRAY['startupindia.gov.in', 'Equity-free Grant', 'DPIIT', 'DeepTech']
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    max_funding_amount = EXCLUDED.max_funding_amount,
    eligibility_ast = EXCLUDED.eligibility_ast;
