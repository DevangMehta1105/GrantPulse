-- ==============================================================================
-- GrantPulse: Wipe All Mock / Seed Data from Supabase Database
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ninnmrsfvemkbmyzhdxs/sql
-- ==============================================================================

-- 1. Enable deletion policies in case they are not yet applied
CREATE POLICY "Allow public delete organizations" ON organizations FOR DELETE USING (true);
CREATE POLICY "Allow public delete schemes" ON schemes FOR DELETE USING (true);
CREATE POLICY "Allow public delete user_documents" ON user_documents FOR DELETE USING (true);
CREATE POLICY "Allow public delete applications" ON applications FOR DELETE USING (true);
CREATE POLICY "Allow public delete grant_expenses" ON grant_expenses FOR DELETE USING (true);

-- 2. Clear all expenses, applications, and documents
DELETE FROM grant_expenses;
DELETE FROM applications;
DELETE FROM user_documents;

-- 3. Clear mock schemes
DELETE FROM schemes WHERE id IN (
  'scheme-msme-zed-subsidy',
  'scheme-tata-wash-csr',
  'scheme-sisfs-dpiit'
);

-- Or wipe all schemes if you want a completely fresh database:
-- DELETE FROM schemes;

-- 4. Clear mock organizations
DELETE FROM organizations WHERE id IN (
  'org-vidyut-ev',
  'org-arogya-trust',
  'org-greenroots-ngo'
);

-- Or wipe all organizations if you want a completely fresh database:
-- DELETE FROM organizations;
