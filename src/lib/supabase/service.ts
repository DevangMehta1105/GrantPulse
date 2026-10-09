import { Organization, Scheme, UserDocument, Application, GrantExpense } from "../types";
import { getBrowserSupabase } from "./client";

// Filter out known static seed IDs so they never appear on the website
const SEED_ORG_IDS = new Set(['org-vidyut-ev', 'org-arogya-trust', 'org-greenroots-ngo']);
const SEED_SCHEME_IDS = new Set(['scheme-msme-zed-subsidy', 'scheme-tata-wash-csr', 'scheme-sisfs-dpiit']);

// ==============================================================================
// 1. ORGANIZATIONS SERVICE
// ==============================================================================

export async function fetchOrganizationsFromDb(): Promise<Organization[]> {
  const supabase = getBrowserSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .filter((row: any) => !SEED_ORG_IDS.has(row.id))
      .map((row: any) => ({
        id: row.id,
        name: row.name,
        entityType: row.entity_type,
        turnoverInr: Number(row.turnover_inr),
        incorporationDate: row.incorporation_date,
        yearsOfOperation: Number(row.years_of_operation),
        udyamTier: row.udyam_tier,
        state: row.state,
        sector: row.sector,
        complianceFlags: row.compliance_flags || {},
        missionDescription: row.mission_description || "",
        contactEmail: row.contact_email || "",
        created_at: row.created_at
      }));
  } catch (e) {
    console.warn("Supabase fetchOrganizations fallback:", e);
    return [];
  }
}

export async function insertOrganizationToDb(org: Organization): Promise<boolean> {
  const supabase = getBrowserSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("organizations").insert({
      id: org.id,
      name: org.name,
      entity_type: org.entityType,
      turnover_inr: org.turnoverInr,
      incorporation_date: org.incorporationDate,
      years_of_operation: org.yearsOfOperation,
      udyam_tier: org.udyamTier,
      state: org.state,
      sector: org.sector,
      compliance_flags: org.complianceFlags,
      mission_description: org.missionDescription,
      contact_email: org.contactEmail,
      created_at: org.created_at || new Date().toISOString()
    });

    if (error) {
      console.warn("Failed to insert organization to Supabase:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Error inserting organization to Supabase:", e);
    return false;
  }
}

// ==============================================================================
// 2. SCHEMES SERVICE
// ==============================================================================

export async function fetchSchemesFromDb(): Promise<Scheme[]> {
  const supabase = getBrowserSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .filter((row: any) => !SEED_SCHEME_IDS.has(row.id))
      .map((row: any) => ({
        id: row.id,
        sourceType: row.source_type,
        sourcePortal: row.source_portal,
        title: row.title,
        ministryOrFunder: row.ministry_or_funder,
        description: row.description,
        grantType: row.grant_type,
        maxFundingAmount: Number(row.max_funding_amount),
        minFundingAmount: row.min_funding_amount ? Number(row.min_funding_amount) : undefined,
        subsidyPercentage: row.subsidy_percentage ? Number(row.subsidy_percentage) : undefined,
        deadline: row.deadline,
        sector: row.sector || [],
        officialPortalUrl: row.official_portal_url,
        eligibilityAst: row.eligibility_ast,
        requiredDocuments: row.required_documents || [],
        tags: row.tags || [],
        created_at: row.created_at
      }));
  } catch (e) {
    console.warn("Supabase fetchSchemes fallback:", e);
    return [];
  }
}

export async function insertSchemesToDb(schemes: Scheme[]): Promise<boolean> {
  const supabase = getBrowserSupabase();
  if (!supabase || schemes.length === 0) return false;

  try {
    const rows = schemes.map(s => ({
      id: s.id,
      source_type: s.sourceType === "manual" ? "manual" : "scraped",
      source_portal: s.sourcePortal || "GrantPulse Catalog",
      title: s.title,
      ministry_or_funder: s.ministryOrFunder,
      description: s.description,
      grant_type: s.grantType,
      max_funding_amount: Number(s.maxFundingAmount) || 0,
      min_funding_amount: s.minFundingAmount ? Number(s.minFundingAmount) : null,
      subsidy_percentage: s.subsidyPercentage ? Number(s.subsidyPercentage) : null,
      deadline: s.deadline || "Rolling (Open All Year)",
      sector: s.sector || [],
      official_portal_url: s.officialPortalUrl || "https://grantpulse.gov.in",
      eligibility_ast: s.eligibilityAst,
      required_documents: s.requiredDocuments || [],
      tags: s.tags || [],
      created_at: s.created_at || new Date().toISOString()
    }));

    const { error } = await supabase
      .from("schemes")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      console.error("Supabase insertSchemes error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Supabase insertSchemes error:", e);
    return false;
  }
}

// ==============================================================================
// 3. USER DOCUMENTS SERVICE
// ==============================================================================

export async function fetchUserDocumentsFromDb(): Promise<UserDocument[]> {
  const supabase = getBrowserSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("user_documents")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .filter((row: any) => !SEED_ORG_IDS.has(row.org_id))
      .map((row: any) => ({
        id: row.id,
        orgId: row.org_id,
        docType: row.doc_type,
        fileName: row.file_name,
        fileSize: row.file_size,
        fileUrl: row.file_url,
        uploadedAt: row.uploaded_at,
        verificationStatus: row.verification_status,
        ocrExtractedData: row.ocr_extracted_data,
        validationErrors: row.validation_errors,
        verifiedAt: row.verified_at
      }));
  } catch (e) {
    console.warn("Supabase fetchUserDocuments fallback:", e);
    return [];
  }
}

export async function insertUserDocumentToDb(doc: UserDocument): Promise<boolean> {
  const supabase = getBrowserSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("user_documents").upsert({
      id: doc.id,
      org_id: doc.orgId,
      doc_type: doc.docType,
      file_name: doc.fileName,
      file_size: doc.fileSize,
      file_url: doc.fileUrl,
      uploaded_at: doc.uploadedAt,
      verification_status: doc.verificationStatus,
      ocr_extracted_data: doc.ocrExtractedData,
      validation_errors: doc.validationErrors,
      verified_at: doc.verifiedAt
    });

    return !error;
  } catch (e) {
    console.error("Supabase insertUserDocument error:", e);
    return false;
  }
}

export async function deleteUserDocumentFromDb(docId: string): Promise<boolean> {
  const supabase = getBrowserSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("user_documents")
      .delete()
      .eq("id", docId);

    if (error) {
      console.error("Supabase deleteUserDocument error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Supabase deleteUserDocument exception:", e);
    return false;
  }
}

// ==============================================================================
// 4. APPLICATIONS SERVICE (FSM PIPELINE & SHA-256 LEDGER)
// ==============================================================================

export async function fetchApplicationsFromDb(): Promise<Application[]> {
  const supabase = getBrowserSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .filter((row: any) => !SEED_ORG_IDS.has(row.org_id))
      .map((row: any) => ({
        id: row.id,
        orgId: row.org_id,
        schemeId: row.scheme_id,
        currentState: row.current_state,
        externalApplicationId: row.external_application_id,
        filingReceiptUrl: row.filing_receipt_url,
        matchScore: row.match_score,
        matchTrace: row.match_trace,
        requestedAmount: Number(row.requested_amount),
        sanctionedAmount: row.sanctioned_amount ? Number(row.sanctioned_amount) : undefined,
        stateHistory: row.state_history || [],
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
  } catch (e) {
    console.warn("Supabase fetchApplications fallback:", e);
    return [];
  }
}

export async function saveApplicationToDb(app: Application): Promise<boolean> {
  const supabase = getBrowserSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("applications").upsert({
      id: app.id,
      org_id: app.orgId,
      scheme_id: app.schemeId,
      current_state: app.currentState,
      external_application_id: app.externalApplicationId,
      filing_receipt_url: app.filingReceiptUrl,
      match_score: app.matchScore,
      match_trace: app.matchTrace,
      requested_amount: app.requestedAmount,
      sanctioned_amount: app.sanctionedAmount,
      state_history: app.stateHistory,
      created_at: app.created_at,
      updated_at: app.updated_at
    });

    return !error;
  } catch (e) {
    console.error("Supabase saveApplication error:", e);
    return false;
  }
}

// ==============================================================================
// 5. GRANT EXPENSES SERVICE (GFR 12-A COMPLIANCE)
// ==============================================================================

export async function fetchGrantExpensesFromDb(): Promise<GrantExpense[]> {
  const supabase = getBrowserSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("grant_expenses")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .filter((row: any) => !row.id?.startsWith("exp-seed"))
      .map((row: any) => ({
        id: row.id,
        applicationId: row.application_id,
        category: row.category,
        amount: Number(row.amount),
        invoiceNumber: row.invoice_number,
        vendorName: row.vendor_name,
        invoiceUrl: row.invoice_url,
        isCompliant: row.is_compliant,
        complianceNotes: row.compliance_notes,
        timestamp: row.timestamp
      }));
  } catch (e) {
    console.warn("Supabase fetchGrantExpenses fallback:", e);
    return [];
  }
}

export async function insertGrantExpenseToDb(exp: GrantExpense): Promise<boolean> {
  const supabase = getBrowserSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("grant_expenses").insert({
      id: exp.id,
      application_id: exp.applicationId,
      category: exp.category,
      amount: exp.amount,
      invoice_number: exp.invoiceNumber,
      vendor_name: exp.vendorName,
      invoice_url: exp.invoiceUrl,
      is_compliant: exp.isCompliant,
      compliance_notes: exp.complianceNotes,
      timestamp: exp.timestamp
    });

    return !error;
  } catch (e) {
    console.error("Supabase insertGrantExpense error:", e);
    return false;
  }
}
