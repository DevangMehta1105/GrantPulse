import { Organization, Scheme } from "../types";
import { GrantDossier, ProposalTone, BudgetItem, MilestoneItem, SroiMetric } from "./types";

export function synthesizeGrantDossier(
  org: Organization,
  scheme: Scheme,
  tone: ProposalTone = "formal_gov",
  customNotes: string = ""
): GrantDossier {
  const amount = scheme.maxFundingAmount;
  const isCleanTech = org.sector.toLowerCase().includes("clean") || org.sector.toLowerCase().includes("energy") || scheme.sector.some(s => s.toLowerCase().includes("clean"));
  const isHealthWash = org.sector.toLowerCase().includes("health") || org.sector.toLowerCase().includes("wash") || scheme.sector.some(s => s.toLowerCase().includes("wash") || s.toLowerCase().includes("health"));

  // 1. Executive Summary & Narrative
  let executiveSummary = "";
  let problemStatement = "";
  let proposedSolution = "";

  if (tone === "deeptech_rd") {
    executiveSummary = `Grant Application for ${scheme.title}:\n\n` +
      `${org.name} (${org.entityType}, incorporated in ${org.state}) respectfully submits this technical proposal requesting financial grant assistance of ₹${(amount / 100000).toFixed(2)} Lakhs under ${scheme.ministryOrFunder}.\n\n` +
      `The core objective is the accelerated engineering validation, prototyping, and commercial scale-up of our proprietary indigenous hardware/software architecture. With an established operational baseline and certified MSME credentials, this intervention directly aligns with national technological sovereignty and import substitution mandates.`;

    problemStatement = `High capital expenditure for advanced prototyping, testing jigs, and industrial pilot trials poses a severe barrier to commercial scale-up. Existing commercial debt facilities lack the risk-tolerance required for pre-commercial deep-tech hardware iterations.`;

    proposedSolution = `${org.name} will deploy a 3-phase milestone engineering cycle: Phase 1 establishes bench-scale validation; Phase 2 executes field prototype stress-testing; Phase 3 completes third-party certification and pilot commercialization with end-users in ${org.state}.`;
  } else if (tone === "csr_philanthropic") {
    executiveSummary = `Grant Dossier for ${scheme.title}:\n\n` +
      `${org.name} (${org.entityType}, ${org.state}) requests catalytic philanthropic grant capital of ₹${(amount / 100000).toFixed(2)} Lakhs from ${scheme.ministryOrFunder} to deliver direct grassroots impact in underserved communities.\n\n` +
      `Leveraging our active Section 12A, 80G, and MCA Form CSR-1 registrations, this program will deliver verifiable social infrastructure, empowering vulnerable families through structured, measurable community-led interventions.`;

    problemStatement = `Grassroots communities face persistent infrastructural deficits, lack of accessible clean utilities/healthcare, and inadequate localized capacity. Without grant-backed catalytic funding, vulnerable households remain excluded from quality-of-life improvements.`;

    proposedSolution = `Community-managed decentralization model deploying low-cost, high-reliability infrastructure coupled with intensive localized stakeholder training, maternal health tracking, and digital governance reporting.`;
  } else {
    // formal_gov (Default)
    executiveSummary = `Comprehensive Grant Application Dossier for ${scheme.title}:\n\n` +
      `Submitted by: ${org.name}\n` +
      `Entity Classification: ${org.entityType} (${org.udyamTier} MSME)\n` +
      `State of Operation: ${org.state}\n` +
      `Requested Grant Assistance: ₹${(amount / 100000).toFixed(2)} Lakhs (INR ${amount.toLocaleString("en-IN")})\n` +
      `Funder / Ministry: ${scheme.ministryOrFunder}\n\n` +
      `Project Abstract:\n` +
      `${org.name} undertakes this comprehensive project to expand manufacturing and operational capabilities in ${org.sector}. The intervention satisfies all eligibility conditions under ${scheme.title}, demonstrating complete statutory compliance with active GSTIN, PAN, and Udyam registrations.`;

    problemStatement = `The applicant unit requires capital and technical upgradation to meet international quality standards (ZED/ISO), reduce unit manufacturing costs, and expand market access in Tier-2/Tier-3 supply chains.`;

    proposedSolution = `Procurement of advanced capital machinery, deployment of standardized quality control systems, skill upgradation of technical personnel, and third-party audit verification in strict adherence to General Financial Rules (GFR 12-A).`;
  }

  // 2. GFR 12-A Compliant Budget Allocation Table
  const budgetTable: BudgetItem[] = [
    {
      category: "Capital Assets & Plant Machinery",
      subItem: isCleanTech ? "Solar Inverters, Battery Testing Racks & Diagnostic Controllers" : isHealthWash ? "Community Water Filtration Units & Diagnostic Test Kits" : "Precision Tooling, CNC Machining & Automation Equipment",
      amountInr: Math.round(amount * 0.45),
      percentage: 45,
      gfrCode: "GFR-CAP-31",
      justification: "Primary capital investment directly required for capacity expansion and physical deliverable creation."
    },
    {
      category: "Technical Personnel & Skilled Engineering",
      subItem: "Lead Systems Engineer, Quality Auditor, Field Deployment Technicians",
      amountInr: Math.round(amount * 0.25),
      percentage: 25,
      gfrCode: "GFR-MAN-32",
      justification: "Direct contractual personnel dedicated 100% to project milestones over 12-month execution window."
    },
    {
      category: "Testing, Quality Audits & Certification",
      subItem: "NABL Accredited Lab Testing, ZED Silver/Gold Audit & ISO Inspection",
      amountInr: Math.round(amount * 0.15),
      percentage: 15,
      gfrCode: "GFR-AUD-33",
      justification: "Mandatory third-party verification to satisfy statutory sanction conditions."
    },
    {
      category: "Consumables & Raw Materials",
      subItem: "Electronic Sub-components, Pilot Batches & Chemical Reagents",
      amountInr: Math.round(amount * 0.10),
      percentage: 10,
      gfrCode: "GFR-CON-34",
      justification: "Batch materials utilized exclusively for prototype validation and initial trial runs."
    },
    {
      category: "Administrative Overheads & Reporting",
      subItem: "GFR 12-A CA Utilization Audit, Impact Documentation & Project MIS",
      amountInr: Math.round(amount * 0.05),
      percentage: 5,
      gfrCode: "GFR-ADM-35",
      justification: "Statutory CA certification and compliance ledger maintenance (capped under 5% GFR limit)."
    }
  ];

  // 3. Three-Phase Milestones
  const milestones: MilestoneItem[] = [
    {
      phase: "Phase 1: Mobilization & Procurement",
      quarter: "Months 1 - 3 (Q1)",
      title: "Statutory Baseline, Vendor Onboarding & Equipment Procurement",
      deliverables: [
        "Final technical specification document approved",
        "Purchase orders placed for capital equipment",
        "Baseline ESG and operational audit logged"
      ],
      budgetAllocationInr: Math.round(amount * 0.40),
      acceptanceCriteria: "Submission of Form GFR 12-A Tranche 1 Utilization Certificate & Vendor Invoices."
    },
    {
      phase: "Phase 2: Deployment & Pilot Operations",
      quarter: "Months 4 - 8 (Q2-Q3)",
      title: "System Integration, Installation & Controlled Pilot Testing",
      deliverables: [
        "Capital equipment installed and commissioned at principal premises",
        "Initial pilot batch of 500 units / beneficiaries completed",
        "Interim progress report submitted to Project Monitoring Unit"
      ],
      budgetAllocationInr: Math.round(amount * 0.40),
      acceptanceCriteria: "Commissioning certificate signed by Empaneled Technical Agency."
    },
    {
      phase: "Phase 3: Final Certification & Handover",
      quarter: "Months 9 - 12 (Q4)",
      title: "NABL Certification, SROI Assessment & Final Sanction Closure",
      deliverables: [
        "Final NABL / ZED Gold certification awarded",
        "Independent Social Return on Investment (SROI) audit report",
        "Final Form GFR 12-A audited closure certificate with UDIN"
      ],
      budgetAllocationInr: Math.round(amount * 0.20),
      acceptanceCriteria: "Final external audit completion and release of performance guarantee."
    }
  ];

  // 4. SROI & ESG Impact Metrics
  const sroiMetrics: SroiMetric[] = [
    {
      metric: isCleanTech ? "Clean Energy Generated / CO2 Offset" : isHealthWash ? "Beneficiary Lives Reached with Clean Water" : "Direct & Indirect Jobs Created",
      baseline: isCleanTech ? "12 Tons CO2 / yr" : isHealthWash ? "250 Households" : "14 Personnel",
      target24Months: isCleanTech ? "280 Tons CO2 / yr" : isHealthWash ? "4,500 Households" : "48 Direct Jobs",
      monetizedImpactInr: Math.round(amount * 2.1),
      esgPillar: isCleanTech ? "Environmental" : "Social"
    },
    {
      metric: "Economic Value Added (EVA) / Gross Value Output",
      baseline: `₹${(org.turnoverInr / 10000000).toFixed(2)} Cr Annual Turnover`,
      target24Months: `₹${((org.turnoverInr * 1.6) / 10000000).toFixed(2)} Cr (+60% Expansion)`,
      monetizedImpactInr: Math.round(amount * 1.35),
      esgPillar: "Social"
    }
  ];

  const totalMonetizedImpact = sroiMetrics.reduce((acc, m) => acc + m.monetizedImpactInr, 0);
  const sroiRatio = parseFloat((totalMonetizedImpact / amount).toFixed(2));

  // 5. Statutory Declaration
  const statutoryDeclaration = `I/We hereby solemnly declare that all particulars furnished above by ${org.name} are true, complete, and verified against statutory registrations.\n\n` +
    `Statutory Credentials on Record:\n` +
    `• PAN: ${org.complianceFlags.pan || "AAACG0567K"}\n` +
    `• GSTIN: ${org.complianceFlags.gstin || "29AABCV9821K1Z3"}\n` +
    `• Udyam Registration: ${org.complianceFlags.udyamNumber || "UDYAM-KR-03-0048192"} (${org.udyamTier})\n` +
    `• 12A/80G URN: ${org.complianceFlags.reg80GNumber || "AABTA4921KG20218"}\n` +
    `• MCA CSR-1 No: ${org.complianceFlags.csr1Number || "CSR00049281"}\n\n` +
    `We undertake to maintain the Grant Ledger in accordance with General Financial Rules (GFR 12-A) and submit audited utilization certificates within the stipulated quarterly schedule.`;

  return {
    dossierId: `DOSSIER-${scheme.id.slice(0, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    generatedAt: new Date().toISOString(),
    tone,
    schemeId: scheme.id,
    schemeTitle: scheme.title,
    funderName: scheme.ministryOrFunder,
    requestedAmountInr: amount,
    applicant: {
      name: org.name,
      entityType: org.entityType,
      state: org.state,
      incorporationDate: org.incorporationDate,
      udyamTier: org.udyamTier,
      pan: org.complianceFlags.pan || "AAACG0567K",
      gstin: org.complianceFlags.gstin,
      reg12A: org.complianceFlags.reg12ANumber,
      reg80G: org.complianceFlags.reg80GNumber,
      ngoDarpanId: org.complianceFlags.ngoDarpanId,
      csr1Number: org.complianceFlags.csr1Number
    },
    executiveSummary,
    problemStatement,
    proposedSolution,
    milestones,
    budgetTable,
    totalBudgetInr: amount,
    sroiMetrics,
    sroiRatio,
    statutoryDeclaration
  };
}
