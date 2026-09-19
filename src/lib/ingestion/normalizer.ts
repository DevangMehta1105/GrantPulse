import { Scheme, AstNode, AstConditionNode, AstGroupNode, RequiredDocumentDef, GrantType } from "../types";
import { RawCrawledItem, NormalizedSchemeSchema } from "./schemas";

export interface NormalizationResult {
  success: boolean;
  scheme?: Scheme;
  errors?: string[];
}

/**
 * Extracts numerical funding amount from raw Indian currency strings 
 * e.g., "₹50 Lakhs", "5 Crores", "2500000", "Rs 1.5 Cr"
 */
export function parseIndianAmount(raw: string | number): number {
  if (typeof raw === "number") return raw;
  if (!raw) return 0;

  const clean = raw.toLowerCase().replace(/,/g, "").trim();
  
  // Match crore
  const croreMatch = clean.match(/([\d.]+)\s*(?:cr|crore|crores)/);
  if (croreMatch) {
    return Math.round(parseFloat(croreMatch[1]) * 10000000);
  }

  // Match lakh
  const lakhMatch = clean.match(/([\d.]+)\s*(?:lakh|lakhs|lac|lacs|l)/);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  // Match direct integer / float with optional currency symbol
  const directMatch = clean.match(/(?:rs\.?|₹|\$)?\s*([\d.]+)/);
  if (directMatch) {
    const val = parseFloat(directMatch[1]);
    return isNaN(val) ? 0 : Math.round(val);
  }

  return 0;
}

/**
 * Maps raw grant type string to standard GrantType enum
 */
export function mapGrantType(raw: string): GrantType {
  const lower = (raw || "").toLowerCase();
  if (lower.includes("subsidy")) return "Subsidy";
  if (lower.includes("reimburse")) return "Reimbursement";
  if (lower.includes("csr") || lower.includes("corporate")) return "CSR Grant";
  if (lower.includes("loan") || lower.includes("credit") || lower.includes("concession")) return "Concessional Loan";
  return "Equity-free Grant";
}

/**
 * Synthesizes an AST Boolean Tree from raw criteria rules or text
 */
export function synthesizeAstFromCriteria(
  criteriaObj?: Record<string, any>,
  eligibilityText: string = ""
): AstGroupNode {
  const conditions: AstNode[] = [];
  const text = (eligibilityText + " " + JSON.stringify(criteriaObj || {})).toLowerCase();

  // 1. Check for Entity Types
  if (text.includes("private limited") && !text.includes("trust") && !text.includes("society")) {
    conditions.push({
      field: "entityType",
      operator: "IN",
      value: ["Private Limited", "LLP"],
      description: "Applicant must be an incorporated for-profit entity (Pvt Ltd or LLP)"
    });
  } else if (text.includes("section 8") || text.includes("trust") || text.includes("ngo") || text.includes("society")) {
    conditions.push({
      field: "entityType",
      operator: "IN",
      value: ["Trust", "Society", "Section 8"],
      description: "Applicant must be a registered non-profit organization (Trust, Society, or Section 8)"
    });
  }

  // 2. Check for Turnover caps
  if (text.includes("turnover") || text.includes("revenue") || text.includes("crore")) {
    if (text.includes("less than 50 cr") || text.includes("under 50 crore") || text.includes("up to 50 cr")) {
      conditions.push({
        field: "turnoverInr",
        operator: "LTE",
        value: 500000000,
        description: "Annual turnover must not exceed ₹50.00 Cr"
      });
    } else if (text.includes("less than 5 cr") || text.includes("under 5 crore") || text.includes("up to 5 cr")) {
      conditions.push({
        field: "turnoverInr",
        operator: "LTE",
        value: 50000000,
        description: "Annual turnover must not exceed ₹5.00 Cr"
      });
    } else if (text.includes("minimum turnover") || text.includes("at least 1 cr")) {
      conditions.push({
        field: "turnoverInr",
        operator: "GTE",
        value: 10000000,
        description: "Annual turnover must be at least ₹1.00 Cr"
      });
    }
  }

  // 3. Check for Udyam Tier
  if (text.includes("udyam") || text.includes("msme") || text.includes("micro") || text.includes("small")) {
    if (text.includes("micro only") || text.includes("only micro")) {
      conditions.push({
        field: "udyamTier",
        operator: "EQUALS",
        value: "Micro",
        description: "Must hold an active Udyam Registration as Micro Enterprise"
      });
    } else {
      conditions.push({
        field: "udyamTier",
        operator: "IN",
        value: ["Micro", "Small", "Medium"],
        description: "Must possess valid Udyam MSME Registration"
      });
    }
  }

  // 4. Check for NGO Registrations (12A, 80G, CSR-1, NGO Darpan, FCRA)
  if (text.includes("80g") || text.includes("12a")) {
    conditions.push({
      field: "complianceFlags.has80G",
      operator: "EQUALS",
      value: true,
      description: "Must possess active Income Tax 12A & 80G Tax Exemption Certificates"
    });
  }

  if (text.includes("csr-1") || text.includes("csr 1") || text.includes("mca csr")) {
    conditions.push({
      field: "complianceFlags.hasCsr1",
      operator: "EQUALS",
      value: true,
      description: "Must be registered with MCA under Form CSR-1"
    });
  }

  if (text.includes("ngo darpan") || text.includes("darpan id") || text.includes("niti aayog")) {
    conditions.push({
      field: "complianceFlags.hasNgoDarpan",
      operator: "EQUALS",
      value: true,
      description: "Must have valid NITI Aayog NGO Darpan portal registration"
    });
  }

  if (text.includes("fcra") || text.includes("foreign contribution")) {
    conditions.push({
      field: "complianceFlags.hasFcra",
      operator: "EQUALS",
      value: true,
      description: "Must possess valid FCRA certificate from Ministry of Home Affairs"
    });
  }

  // 5. Check for GSTIN & PAN (Standard baseline)
  if (conditions.length === 0 || text.includes("gst")) {
    conditions.push({
      field: "complianceFlags.hasGstin",
      operator: "EQUALS",
      value: true,
      description: "Must possess an active, compliant GSTIN"
    });
  }

  return {
    operator: "AND",
    children: conditions,
    description: "Standard scheme eligibility validation tree"
  };
}

/**
 * Infers required document checklist from text and sector
 */
export function inferRequiredDocuments(
  rawDocs?: string[] | string,
  eligibilityText: string = ""
): RequiredDocumentDef[] {
  const text = (Array.isArray(rawDocs) ? rawDocs.join(" ") : (rawDocs || "")) + " " + eligibilityText;
  const lower = text.toLowerCase();
  const docs: RequiredDocumentDef[] = [];

  // PAN is universal
  docs.push({
    docType: "PAN",
    name: "Permanent Account Number Card",
    isMandatory: true,
    validationRegex: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
    description: "Original entity PAN card issued by Income Tax Department"
  });

  if (lower.includes("gst") || lower.includes("tax invoice") || lower.includes("enterprise") || lower.includes("pvt ltd")) {
    docs.push({
      docType: "GST_CERTIFICATE",
      name: "GST Registration Certificate (REG-06)",
      isMandatory: true,
      validationRegex: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
      description: "Form REG-06 showing principal place of business"
    });
  }

  if (lower.includes("udyam") || lower.includes("msme")) {
    docs.push({
      docType: "UDYAM_CERTIFICATE",
      name: "Udyam Registration Certificate",
      isMandatory: true,
      validationRegex: "^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$",
      description: "Ministry of MSME official registration certificate"
    });
  }

  if (lower.includes("80g") || lower.includes("12a") || lower.includes("trust") || lower.includes("ngo")) {
    docs.push({
      docType: "REG_80G",
      name: "Form 10AC - Section 80G Certificate",
      isMandatory: true,
      description: "Income Tax Department Order for grant of provisional/final registration under Section 80G"
    });
    docs.push({
      docType: "REG_12A",
      name: "Form 10AC - Section 12A/12AB Certificate",
      isMandatory: true,
      description: "Income Tax Registration under Section 12A/12AB"
    });
  }

  if (lower.includes("csr") || lower.includes("csr-1")) {
    docs.push({
      docType: "CSR_1",
      name: "MCA Form CSR-1 Registration Letter",
      isMandatory: true,
      description: "Registration of Entities for undertaking CSR Activities letter from MCA"
    });
  }

  if (lower.includes("darpan")) {
    docs.push({
      docType: "NGO_DARPAN",
      name: "NITI Aayog NGO Darpan Unique ID Certificate",
      isMandatory: true,
      description: "NGO Darpan acknowledgment showing active Darpan ID"
    });
  }

  if (lower.includes("fcra")) {
    docs.push({
      docType: "FCRA",
      name: "MHA FCRA Registration Certificate",
      isMandatory: true,
      description: "Ministry of Home Affairs FCRA certificate under Section 11"
    });
  }

  // Financial Statements
  docs.push({
    docType: "AUDITED_FINANCIALS",
    name: "Audited Balance Sheet & P&L (Last 2 FYs)",
    isMandatory: false,
    description: "Audited financial statements signed by a practicing Chartered Accountant"
  });

  return docs;
}

/**
 * Normalizes a raw crawled item into a fully typed and Zod-validated Scheme object
 */
export function normalizeScrapedItem(
  raw: RawCrawledItem,
  sourcePortal: string,
  index: number = 1
): NormalizationResult {
  try {
    const fundingAmount = parseIndianAmount(raw.maxFundingRaw);
    const grantType = mapGrantType(raw.grantTypeStr);
    const ast = raw.criteriaObj?.operator 
      ? (raw.criteriaObj as any) 
      : synthesizeAstFromCriteria(raw.criteriaObj, raw.eligibilityText || raw.description);
    
    const requiredDocs = inferRequiredDocuments(raw.documentsRequiredRaw, raw.eligibilityText || raw.description);
    
    // Generate a unique, deterministic ID
    const cleanTitleSlug = raw.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
    const id = `scheme-${sourcePortal.split(".")[0]}-${cleanTitleSlug}-${Date.now().toString().slice(-4)}`;

    const portalHostname = raw.officialLink?.includes("http") ? new URL(raw.officialLink).hostname : sourcePortal;
    const sectorArray = [raw.sectorTag || "General MSME & Technology"];
    const tagsArray = [sourcePortal, grantType, ...(raw.sectorTag ? [raw.sectorTag] : [])];

    const candidateScheme: Scheme = {
      id,
      sourceType: "scraped",
      sourcePortal: portalHostname,
      title: raw.title.trim(),
      ministryOrFunder: raw.ministryOrFunder.trim() || "Government of India",
      description: raw.description.trim() || `${raw.title} providing up to ₹${(fundingAmount / 100000).toFixed(1)}L support.`,
      grantType,
      maxFundingAmount: fundingAmount > 0 ? fundingAmount : 2500000, // fallback ₹25L
      deadline: raw.deadlineRaw || "Rolling (Open All Year)",
      sector: sectorArray,
      officialPortalUrl: raw.officialLink || `https://${sourcePortal}`,
      eligibilityAst: ast,
      requiredDocuments: requiredDocs,
      tags: tagsArray,
      created_at: new Date().toISOString()
    };

    // Validate with Zod
    const validated = NormalizedSchemeSchema.parse(candidateScheme);

    return {
      success: true,
      scheme: validated as unknown as Scheme
    };
  } catch (err: any) {
    return {
      success: false,
      errors: err.errors ? err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`) : [err.message]
    };
  }
}
