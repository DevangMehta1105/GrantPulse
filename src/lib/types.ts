// Core Domain Types for GrantPulse Operating System

export type EntityType = 'Private Limited' | 'LLP' | 'Trust' | 'Society' | 'Section 8' | 'Proprietorship' | 'Partnership';
export type UdyamTier = 'Micro' | 'Small' | 'Medium' | 'None';
export type GrantType = 'Subsidy' | 'Reimbursement' | 'Equity-free Grant' | 'Concessional Loan' | 'CSR Grant';

export interface ComplianceFlags {
  hasGstin: boolean;
  gstin?: string;
  hasPan: boolean;
  pan?: string;
  hasUdyam: boolean;
  udyamNumber?: string;
  has12A: boolean;
  reg12ANumber?: string;
  has80G: boolean;
  reg80GNumber?: string;
  hasNgoDarpan: boolean;
  ngoDarpanId?: string;
  hasFcra: boolean;
  fcraNumber?: string;
  hasCsr1: boolean;
  csr1Number?: string;
  isWomanLed?: boolean;
  isScStLed?: boolean;
  isGreenfield?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  entityType: EntityType;
  turnoverInr: number; // in INR
  incorporationDate: string;
  yearsOfOperation: number;
  udyamTier: UdyamTier;
  state: string;
  sector: string;
  complianceFlags: ComplianceFlags;
  missionDescription: string;
  contactEmail: string;
  created_at: string;
}

// Abstract Syntax Tree (AST) Types for Eligibility
export type AstOperator = 'AND' | 'OR' | 'NOT' | 'GTE' | 'LTE' | 'EQUALS' | 'IN' | 'CONTAINS';

export interface AstConditionNode {
  field: string; // e.g. 'turnoverInr', 'complianceFlags.has80G', 'entityType', 'udyamTier'
  operator: 'GTE' | 'LTE' | 'EQUALS' | 'IN' | 'CONTAINS';
  value: string | number | boolean | string[];
  description: string; // Human readable rule explanation
}

export interface AstGroupNode {
  operator: 'AND' | 'OR' | 'NOT';
  children: AstNode[];
  description?: string;
}

export type AstNode = AstConditionNode | AstGroupNode;

export interface TraceNode {
  id: string;
  type: 'group' | 'condition';
  operator: AstOperator;
  description: string;
  passed: boolean;
  reason: string;
  children?: TraceNode[];
  actualValue?: any;
  targetValue?: any;
}

export interface EvaluationResult {
  isEligible: boolean;
  matchScore: number; // 0 to 100
  passedRulesCount: number;
  totalRulesCount: number;
  trace: TraceNode;
  missingRequirements: string[];
  criticalPasses: string[];
}

export interface RequiredDocumentDef {
  docType: string;
  name: string;
  isMandatory: boolean;
  validationRegex?: string;
  description: string;
}

export interface Scheme {
  id: string;
  sourceType: 'scraped' | 'manual' | 'csv';
  sourcePortal: string; // e.g. 'myScheme.gov.in', 'csrxchange.gov.in', 'birac.nic.in'
  title: string;
  ministryOrFunder: string;
  description: string;
  grantType: GrantType;
  maxFundingAmount: number; // in INR
  minFundingAmount?: number;
  subsidyPercentage?: number;
  deadline: string;
  sector: string[];
  eligibilityAst: AstGroupNode;
  requiredDocuments: RequiredDocumentDef[];
  tags: string[];
  officialPortalUrl?: string;
  created_at: string;
}

export type ApplicationState = 
  | 'Discovered'
  | 'Docs Verified'
  | 'Drafting'
  | 'Applied'
  | 'Under Review'
  | 'Sanctioned'
  | 'Rejected';

export interface StateTransitionLog {
  fromState: ApplicationState | 'Genesis';
  toState: ApplicationState;
  timestamp: string;
  actor: string;
  actionNote: string;
  previousHash: string;
  hash: string; // SHA-256(previousHash + timestamp + toState + actor + actionNote)
}

export interface Application {
  id: string;
  orgId: string;
  schemeId: string;
  currentState: ApplicationState;
  externalApplicationId?: string;
  filingReceiptUrl?: string;
  matchScore: number;
  matchTrace?: TraceNode;
  requestedAmount: number;
  sanctionedAmount?: number;
  stateHistory: StateTransitionLog[];
  created_at: string;
  updated_at: string;
}

export type DocumentType = 
  | 'GSTIN_CERTIFICATE'
  | 'PAN_CARD'
  | 'UDYAM_CERTIFICATE'
  | '12A_REGISTRATION'
  | '80G_REGISTRATION'
  | 'NGO_DARPAN_CERTIFICATE'
  | 'CSR1_CERTIFICATE'
  | 'FCRA_CERTIFICATE'
  | 'AUDITED_FINANCIALS'
  | 'PROJECT_PROPOSAL';

export interface UserDocument {
  id: string;
  orgId: string;
  docType: DocumentType;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  verificationStatus: 'VERIFIED' | 'FAILED' | 'PENDING_REVIEW';
  ocrExtractedData?: {
    extractedId?: string;
    extractedName?: string;
    issueDate?: string;
    expiryDate?: string;
    rawTextSnippet?: string;
    confidenceScore: number;
  };
  validationErrors?: string[];
  verifiedAt?: string;
}

export interface GrantExpense {
  id: string;
  applicationId: string;
  category: 'Capital Equipment' | 'Manpower & Salaries' | 'Travel & Field Operations' | 'Consumables & Supplies' | 'Overheads / Admin';
  amount: number;
  invoiceNumber: string;
  vendorName: string;
  invoiceUrl: string;
  isCompliant: boolean;
  complianceNotes?: string;
  timestamp: string;
}

export interface CounterfactualSimulationResult {
  unlockedSchemes: {
    scheme: Scheme;
    matchScore: number;
    fundingAmount: number;
    unlockedByFixing: string[];
  }[];
  totalPotentialFundingDelta: number;
  highLeverageFixes: {
    action: string;
    schemesUnlockedCount: number;
    fundingDeltaInr: number;
  }[];
}
