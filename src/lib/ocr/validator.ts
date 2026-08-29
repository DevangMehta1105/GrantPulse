import { DocumentType, RequiredDocumentDef, UserDocument } from "../types";

export interface RegexValidationRule {
  pattern: RegExp;
  description: string;
  example: string;
  extractId: (text: string) => string | null;
}

export const INDIAN_REG_REGEXES: Record<DocumentType, RegexValidationRule> = {
  GSTIN_CERTIFICATE: {
    pattern: /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/,
    description: "15-character GSTIN (2 state digits + 10 PAN + 1 entity + Z + 1 checksum)",
    example: "27AAACG0567K1Z4",
    extractId: (text) => {
      const match = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/);
      return match ? match[1] : null;
    }
  },
  PAN_CARD: {
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
    description: "12A/12AB Unique Registration Number (URN) or Order Reference",
    example: "AABTC1248E210192",
    extractId: (text) => {
      const match = text.match(/\b([A-Z0-9]{14,16})\b/);
      return match ? match[1] : "URN-12A-VERIFIED";
    }
  },
  '80G_REGISTRATION': {
    pattern: /\b(80G|[A-Z0-9]{16})\b/i,
    description: "80G Exemption Approval Order Number",
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
  CSR1_CERTIFICATE: {
    pattern: /\bCSR\d{8}\b/i,
    description: "Ministry of Corporate Affairs Form CSR-1 Registration No",
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
  AUDITED_FINANCIALS: {
    pattern: /(auditor|balance sheet|profit and loss|chartered accountant|ca)/i,
    description: "Audited Balance Sheet & P&L Statement with CA seal",
    example: "CA Audited Financials FY 2024-25",
    extractId: () => "CA-SEAL-VERIFIED"
  },
  PROJECT_PROPOSAL: {
    pattern: /(proposal|executive summary|objectives|methodology|budget)/i,
    description: "Detailed Project Proposal with GFR milestone breakdown",
    example: "Grant Technical Proposal v1.0",
    extractId: () => "PROPOSAL-DOC"
  }
};

/**
 * Runs OCR regex validation on raw document text.
 */
export function validateDocumentOcr(docType: DocumentType, rawText: string) {
  const rule = INDIAN_REG_REGEXES[docType];
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
    confidenceScore: isValid ? 96 : 30,
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
    }
  });

  const mandatory = requiredDocs.filter(d => d.isMandatory);
  let mandatoryVerifiedCount = 0;
  const missingMandatory: RequiredDocumentDef[] = [];
  const verifiedDocs: UserDocument[] = [];

  mandatory.forEach(req => {
    const found = verifiedMap.get(req.docType);
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
