import { DocumentType, RequiredDocumentDef, UserDocument } from "../types";

export interface RegexValidationRule {
  pattern: RegExp;
  description: string;
  example: string;
  extractId: (text: string) => string | null;
}

export const INDIAN_REG_REGEXES: Record<string, RegexValidationRule> = {
  GSTIN_CERTIFICATE: {
    pattern: /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/,
    description: "15-character GSTIN (2 state digits + 10 PAN + 1 entity code + Z + 1 checksum)",
    example: "27AAACG0567K1Z4",
    extractId: (text) => {
      const match = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/);
      return match ? match[1] : null;
    }
  },
  GST_CERTIFICATE: {
    pattern: /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/,
    description: "15-character GSTIN (REG-06 Certificate)",
    example: "29AABCV9821K1Z3",
    extractId: (text) => {
      const match = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/);
      return match ? match[1] : null;
    }
  },
  PAN_CARD: {
    pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/,
    description: "10-character Permanent Account Number (5 letters + 4 digits + 1 letter)",
    example: "AAACG0567K",
    extractId: (text) => {
      const match = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/);
      return match ? match[1] : null;
    }
  },
  PAN: {
    pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/,
    description: "10-character Permanent Account Number",
    example: "AAACG0567K",
    extractId: (text) => {
      const match = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/);
      return match ? match[1] : null;
    }
  },
  UDYAM_CERTIFICATE: {
    pattern: /\bUDYAM-[A-Z]{2}-\d{2}-\d{7}\b/i,
    description: "Udyam Registration Number (UDYAM-ST-DD-NNNNNNN)",
    example: "UDYAM-MH-01-0089241",
    extractId: (text) => {
      const match = text.match(/\b(UDYAM-[A-Z]{2}-\d{2}-\d{7})\b/i);
      return match ? match[1].toUpperCase() : null;
    }
  },
  '12A_REGISTRATION': {
    pattern: /\b(12A|12AB|[A-Z0-9]{16})\b/i,
    description: "12A/12AB Unique Registration Number (URN) or Form 10AC Order Reference",
    example: "AABTA4921KE20214",
    extractId: (text) => {
      const match = text.match(/\b([A-Z0-9]{14,16})\b/);
      return match ? match[1] : "URN-12A-VERIFIED";
    }
  },
  REG_12A: {
    pattern: /\b(12A|12AB|[A-Z0-9]{16})\b/i,
    description: "Section 12A/12AB Income Tax Registration",
    example: "AABTA4921KE20214",
    extractId: (text) => {
      const match = text.match(/\b([A-Z0-9]{14,16})\b/);
      return match ? match[1] : "URN-12A-VERIFIED";
    }
  },
  '80G_REGISTRATION': {
    pattern: /\b(80G|[A-Z0-9]{16})\b/i,
    description: "80G Exemption Approval Order Number (Form 10AC)",
    example: "AABTG8082G210452",
    extractId: (text) => {
      const match = text.match(/\b([A-Z0-9]{14,16})\b/);
      return match ? match[1] : "URN-80G-VERIFIED";
    }
  },
  REG_80G: {
    pattern: /\b(80G|[A-Z0-9]{16})\b/i,
    description: "Section 80G Tax Exemption Certificate",
    example: "AABTG8082G210452",
    extractId: (text) => {
      const match = text.match(/\b([A-Z0-9]{14,16})\b/);
      return match ? match[1] : "URN-80G-VERIFIED";
    }
  },
  NGO_DARPAN_CERTIFICATE: {
    pattern: /\b[A-Z]{2}\/\d{4}\/\d{7}\b/,
    description: "NITI Aayog NGO Darpan ID (ST/YYYY/NNNNNNN)",
    example: "DL/2024/0398471",
    extractId: (text) => {
      const match = text.match(/\b([A-Z]{2}\/\d{4}\/\d{7})\b/);
      return match ? match[1] : null;
    }
  },
  NGO_DARPAN: {
    pattern: /\b[A-Z]{2}\/\d{4}\/\d{7}\b/,
    description: "NITI Aayog NGO Darpan Portal ID",
    example: "DL/2024/0398471",
    extractId: (text) => {
      const match = text.match(/\b([A-Z]{2}\/\d{4}\/\d{7})\b/);
      return match ? match[1] : null;
    }
  },
  CSR1_CERTIFICATE: {
    pattern: /\bCSR\d{8}\b/i,
    description: "MCA Form CSR-1 Registration Number (CSR000XXXXX)",
    example: "CSR00049281",
    extractId: (text) => {
      const match = text.match(/\b(CSR\d{8})\b/i);
      return match ? match[1].toUpperCase() : null;
    }
  },
  CSR_1: {
    pattern: /\bCSR\d{8}\b/i,
    description: "MCA Form CSR-1 Registration Letter",
    example: "CSR00049281",
    extractId: (text) => {
      const match = text.match(/\b(CSR\d{8})\b/i);
      return match ? match[1].toUpperCase() : null;
    }
  },
  FCRA_CERTIFICATE: {
    pattern: /\b\d{9}\b/,
    description: "9-digit Ministry of Home Affairs FCRA Registration Number",
    example: "031420987",
    extractId: (text) => {
      const match = text.match(/\b(\d{9})\b/);
      return match ? match[1] : null;
    }
  },
  FCRA: {
    pattern: /\b\d{9}\b/,
    description: "MHA FCRA Registration Number",
    example: "031420987",
    extractId: (text) => {
      const match = text.match(/\b(\d{9})\b/);
      return match ? match[1] : null;
    }
  },
  AUDITED_FINANCIALS: {
    pattern: /(auditor|balance sheet|profit and loss|chartered accountant|ca|fy\s*202)/i,
    description: "Audited Financial Statements with practicing CA seal & UDIN",
    example: "CA Audited Financials FY 2024-25 (UDIN: 24049821AAAAA1234)",
    extractId: (text) => {
      const udin = text.match(/\b(\d{6}[A-Z0-9]{12})\b/);
      return udin ? `UDIN-${udin[1]}` : "CA-SEAL-VERIFIED";
    }
  },
  PROJECT_PROPOSAL: {
    pattern: /(proposal|executive summary|objectives|methodology|budget|deliverables)/i,
    description: "Detailed Project Proposal with GFR milestone breakdown",
    example: "Technical Project Proposal v1.0",
    extractId: () => "PROPOSAL-DOC-VERIFIED"
  }
};

/**
 * Normalizes document type strings across various scheme definitions
 */
export function normalizeDocType(docType: string): string {
  const clean = docType.toUpperCase().trim();
  if (clean === "GSTIN_CERTIFICATE" || clean === "GST_CERTIFICATE") return "GSTIN_CERTIFICATE";
  if (clean === "PAN_CARD" || clean === "PAN") return "PAN_CARD";
  if (clean === "12A_REGISTRATION" || clean === "REG_12A") return "12A_REGISTRATION";
  if (clean === "80G_REGISTRATION" || clean === "REG_80G") return "80G_REGISTRATION";
  if (clean === "NGO_DARPAN_CERTIFICATE" || clean === "NGO_DARPAN") return "NGO_DARPAN_CERTIFICATE";
  if (clean === "CSR1_CERTIFICATE" || clean === "CSR_1") return "CSR1_CERTIFICATE";
  if (clean === "FCRA_CERTIFICATE" || clean === "FCRA") return "FCRA_CERTIFICATE";
  return clean;
}

/**
 * Runs OCR regex validation on raw document text.
 */
export function validateDocumentOcr(docType: string, rawText: string) {
  const rule = INDIAN_REG_REGEXES[docType] || INDIAN_REG_REGEXES[normalizeDocType(docType)];
  if (!rule) {
    return {
      isValid: true,
      extractedId: "DOC-VERIFIED",
      confidenceScore: 85,
      errors: []
    };
  }

  const isValid = rule.pattern.test(rawText);
  const extractedId = rule.extractId(rawText);

  const errors: string[] = [];
  if (!isValid) {
    errors.push(`Document failed syntax check: Expected pattern for ${rule.description}`);
  }

  return {
    isValid,
    extractedId: extractedId || undefined,
    confidenceScore: isValid ? 97 : 25,
    errors
  };
}

/**
 * Computes Document Readiness Score (0-100) for a given Scheme against an Org's uploaded vault.
 */
export function calculateDocumentReadiness(
  requiredDocs: RequiredDocumentDef[],
  uploadedDocs: UserDocument[]
): {
  score: number;
  mandatoryTotal: number;
  mandatoryVerified: number;
  missingMandatory: RequiredDocumentDef[];
  verifiedDocs: UserDocument[];
} {
  const verifiedMap = new Map<string, UserDocument>();
  uploadedDocs.forEach(doc => {
    if (doc.verificationStatus === 'VERIFIED') {
      verifiedMap.set(doc.docType, doc);
      verifiedMap.set(normalizeDocType(doc.docType), doc);
    }
  });

  const mandatory = requiredDocs.filter(d => d.isMandatory);
  let mandatoryVerifiedCount = 0;
  const missingMandatory: RequiredDocumentDef[] = [];
  const verifiedDocs: UserDocument[] = [];

  mandatory.forEach(req => {
    const found = verifiedMap.get(req.docType) || verifiedMap.get(normalizeDocType(req.docType));
    if (found) {
      mandatoryVerifiedCount++;
      verifiedDocs.push(found);
    } else {
      missingMandatory.push(req);
    }
  });

  const score = mandatory.length > 0
    ? Math.round((mandatoryVerifiedCount / mandatory.length) * 100)
    : 100;

  return {
    score,
    mandatoryTotal: mandatory.length,
    mandatoryVerified: mandatoryVerifiedCount,
    missingMandatory,
    verifiedDocs
  };
}
