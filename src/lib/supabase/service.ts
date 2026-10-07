import { Organization, Scheme, UserDocument, Application, GrantExpense } from "../types";
import { getBrowserSupabase, isSupabaseConfigured } from "./client";
import { SEED_ORGANIZATIONS } from "@/data/seed-organizations";
import { SEED_SCHEMES } from "@/data/seed-schemes";
import { SEED_DOCUMENTS } from "@/data/seed-documents";
import { SEED_APPLICATIONS, SEED_EXPENSES } from "@/data/seed-applications";

// ==============================================================================
// 1. ORGANIZATIONS SERVICE
// ==============================================================================

export async function fetchOrganizationsFromDb(): Promise<Organization[]> {
  const supabase = getBrowserSupabase();
  if (!supabase) return SEED_ORGANIZATIONS;

  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return SEED_ORGANIZATIONS;
    }

    return data.map((row: any) => ({
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
    return SEED_ORGANIZATIONS;
  }
}

// ==============================================================================
// 2. SCHEMES SERVICE
// ==============================================================================

export async function fetchSchemesFromDb(): Promise<Scheme[]> {
  const supabase = getBrowserSupabase();
  if (!supabase) return SEED_SCHEMES;

  try {
    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return SEED_SCHEMES;
    }

    return data.map((row: any) => ({
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
    return SEED_SCHEMES;
  }
}

export async function insertSchemesToDb(schemes: Scheme[]): Promise<boolean> {
  const supabase = getBrowserSupabase();
  if (!supabase) return false;

  try {
    const rows = schemes.map(s => ({
      id: s.id,
      source_type: s.sourceType,
      source_portal: s.sourcePortal,
      title: s.title,
      ministry_or_funder: s.ministryOrFunder,
      description: s.description,
      grant_type: s.grantType,
      max_funding_amount: s.maxFundingAmount,
      min_funding_amount: s.minFundingAmount,
      subsidy_percentage: s.subsidyPercentage,
      deadline: s.deadline,
      sector: s.sector,
      official_portal_url: s.officialPortalUrl,
      eligibility_ast: s.eligibilityAst,
      required_documents: s.requiredDocuments,
      tags: s.tags,
      created_at: s.created_at
    }));

    const { error } = await supabase
      .from("schemes")
      .upsert(rows, { onConflict: "id" });

    return !error;
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
  if (!supabase) return SEED_DOCUMENTS;

  try {
    const { data, error } = await supabase
      .from("user_documents")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return SEED_DOCUMENTS;
    }

    return data.map((row: any) => ({
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
    return SEED_DOCUMENTS;
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

// ==============================================================================
// 4. APPLICATIONS SERVICE (FSM PIPELINE & SHA-256 LEDGER)
// ==============================================================================

export async function fetchApplicationsFromDb(): Promise<Application[]> {
  const supabase = getBrowserSupabase();
  if (!supabase) return SEED_APPLICATIONS;

  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return SEED_APPLICATIONS;
    }

    return data.map((row: any) => ({
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
    return SEED_APPLICATIONS;
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
  if (!supabase) return SEED_EXPENSES;

  try {
    const { data, error } = await supabase
      .from("grant_expenses")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error || !data || data.length === 0) {
      return SEED_EXPENSES;
    }

    return data.map((row: any) => ({
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
    return SEED_EXPENSES;
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
