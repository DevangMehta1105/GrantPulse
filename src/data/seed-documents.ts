import { UserDocument } from "../lib/types";

export const SEED_DOCUMENTS: UserDocument[] = [
  {
    id: "doc-gstin-1",
    orgId: "org-2",
    docType: "GSTIN_CERTIFICATE",
    fileName: "GSTIN_Certificate_Vidyut_2024.pdf",
    fileSize: 412000,
    fileUrl: "/docs/sample-gstin.pdf",
    uploadedAt: "2024-03-01T10:00:00Z",
    verificationStatus: "VERIFIED",
    ocrExtractedData: {
      extractedId: "29AABCV9821K1Z3",
      extractedName: "VIDYUT MICRO MOBILITY PRIVATE LIMITED",
      issueDate: "2022-09-01",
      confidenceScore: 98,
      rawTextSnippet: "FORM GST REG-06 Government of India Registration Certificate. Registration Number: 29AABCV9821K1Z3 Legal Name: VIDYUT MICRO MOBILITY PRIVATE LIMITED"
    },
    verifiedAt: "2024-03-01T10:05:00Z"
  },
  {
    id: "doc-udyam-1",
    orgId: "org-2",
    docType: "UDYAM_CERTIFICATE",
    fileName: "Udyam_Registration_UDYAM-KR-03.pdf",
    fileSize: 524000,
    fileUrl: "/docs/sample-udyam.pdf",
    uploadedAt: "2024-03-01T10:10:00Z",
    verificationStatus: "VERIFIED",
    ocrExtractedData: {
      extractedId: "UDYAM-KR-03-0048192",
      extractedName: "VIDYUT MICRO MOBILITY PRIVATE LIMITED",
      issueDate: "2022-10-15",
      confidenceScore: 99,
      rawTextSnippet: "UDYAM REGISTRATION CERTIFICATE UDYAM-KR-03-0048192 Enterprise Type: Micro Major Activity: Manufacturing"
    },
    verifiedAt: "2024-03-01T10:12:00Z"
  },
  {
    id: "doc-pan-1",
    orgId: "org-1",
    docType: "PAN_CARD",
    fileName: "PAN_Card_Arogya_Trust.pdf",
    fileSize: 280000,
    fileUrl: "/docs/sample-pan.pdf",
    uploadedAt: "2024-02-15T08:00:00Z",
    verificationStatus: "VERIFIED",
    ocrExtractedData: {
      extractedId: "AABTA4921K",
      extractedName: "AROGYA RURAL HEALTHCARE TRUST",
      confidenceScore: 97,
      rawTextSnippet: "INCOME TAX DEPARTMENT GOVT OF INDIA Permanent Account Number Card AABTA4921K AROGYA RURAL HEALTHCARE TRUST"
    },
    verifiedAt: "2024-02-15T08:02:00Z"
  },
  {
    id: "doc-12a-1",
    orgId: "org-1",
    docType: "12A_REGISTRATION",
    fileName: "12A_Registration_Order_IncomeTax.pdf",
    fileSize: 630000,
    fileUrl: "/docs/sample-12a.pdf",
    uploadedAt: "2024-02-15T08:05:00Z",
    verificationStatus: "VERIFIED",
    ocrExtractedData: {
      extractedId: "AABTA4921KE20214",
      extractedName: "AROGYA RURAL HEALTHCARE TRUST",
      issueDate: "2021-05-10",
      confidenceScore: 95,
      rawTextSnippet: "ORDER FOR REGISTRATION UNDER SECTION 12A/12AB OF THE INCOME TAX ACT, 1961. URN: AABTA4921KE20214"
    },
    verifiedAt: "2024-02-15T08:08:00Z"
  },
  {
    id: "doc-80g-1",
    orgId: "org-1",
    docType: "80G_REGISTRATION",
    fileName: "80G_TaxExemption_Certificate.pdf",
    fileSize: 590000,
    fileUrl: "/docs/sample-80g.pdf",
    uploadedAt: "2024-02-15T08:10:00Z",
    verificationStatus: "VERIFIED",
    ocrExtractedData: {
      extractedId: "AABTA4921KG20218",
      extractedName: "AROGYA RURAL HEALTHCARE TRUST",
      issueDate: "2021-05-15",
      confidenceScore: 94,
      rawTextSnippet: "APPROVAL UNDER SECTION 80G(5)(vi) OF THE INCOME TAX ACT, 1961. URN: AABTA4921KG20218"
    },
    verifiedAt: "2024-02-15T08:12:00Z"
  },
  {
    id: "doc-csr1-1",
    orgId: "org-1",
    docType: "CSR1_CERTIFICATE",
    fileName: "MCA_Form_CSR1_Filing.pdf",
    fileSize: 310000,
    fileUrl: "/docs/sample-csr1.pdf",
    uploadedAt: "2024-02-15T08:15:00Z",
    verificationStatus: "VERIFIED",
    ocrExtractedData: {
      extractedId: "CSR00019283",
      extractedName: "AROGYA RURAL HEALTHCARE TRUST",
      confidenceScore: 96,
      rawTextSnippet: "MINISTRY OF CORPORATE AFFAIRS Form CSR-1 Registration Number: CSR00019283 has been assigned"
    },
    verifiedAt: "2024-02-15T08:18:00Z"
  }
];
