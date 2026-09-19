export type ProposalTone = "formal_gov" | "deeptech_rd" | "csr_philanthropic";

export interface BudgetItem {
  category: string;
  subItem: string;
  amountInr: number;
  percentage: number;
  gfrCode: string;
  justification: string;
}

export interface MilestoneItem {
  phase: string;
  quarter: string;
  title: string;
  deliverables: string[];
  budgetAllocationInr: number;
  acceptanceCriteria: string;
}

export interface SroiMetric {
  metric: string;
  baseline: string;
  target24Months: string;
  monetizedImpactInr: number;
  esgPillar: "Environmental" | "Social" | "Governance";
}

export interface GrantDossier {
  dossierId: string;
  generatedAt: string;
  tone: ProposalTone;
  schemeId: string;
  schemeTitle: string;
  funderName: string;
  requestedAmountInr: number;
  applicant: {
    name: string;
    entityType: string;
    state: string;
    incorporationDate: string;
    udyamTier: string;
    pan: string;
    gstin?: string;
    reg12A?: string;
    reg80G?: string;
    ngoDarpanId?: string;
    csr1Number?: string;
  };
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  milestones: MilestoneItem[];
  budgetTable: BudgetItem[];
  totalBudgetInr: number;
  sroiMetrics: SroiMetric[];
  sroiRatio: number; // e.g. 3.45 (₹3.45 social return per ₹1 grant)
  statutoryDeclaration: string;
}
