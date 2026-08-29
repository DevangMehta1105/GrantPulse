import { Scheme } from "../lib/types";

export const SEED_SCHEMES: Scheme[] = [
  {
    id: "scheme-zed",
    sourceType: "scraped",
    sourcePortal: "myScheme.gov.in",
    title: "MSME Sustainable (ZED) Certification Scheme",
    ministryOrFunder: "Ministry of Micro, Small and Medium Enterprises (MoMSME)",
    description: "Financial subsidy up to 80% on certification cost for MSMEs implementing Zero Defect Zero Effect (ZED) manufacturing quality standards, energy efficiency, and environmental management.",
    grantType: "Subsidy",
    maxFundingAmount: 500000, // ₹5 Lakhs per unit
    subsidyPercentage: 80,
    deadline: "2026-12-31",
    sector: ["Manufacturing", "Quality", "CleanTech"],
    tags: ["ZED", "MoMSME", "Subsidy", "Quality"],
    requiredDocuments: [
      { docType: "UDYAM_CERTIFICATE", name: "Udyam Registration Certificate", isMandatory: true, description: "Active Udyam certificate with manufacturing NIC code" },
      { docType: "GSTIN_CERTIFICATE", name: "GSTIN Registration", isMandatory: true, description: "Valid GSTIN registration certificate" },
      { docType: "PAN_CARD", name: "Entity PAN Card", isMandatory: true, description: "Company / LLP / Firm PAN card" }
    ],
    eligibilityAst: {
      operator: "AND",
      description: "MSME ZED Eligibility Criteria",
      children: [
        {
          field: "complianceFlags.hasUdyam",
          operator: "EQUALS",
          value: true,
          description: "Entity must have an active Udyam Registration"
        },
        {
          field: "udyamTier",
          operator: "IN",
          value: ["Micro", "Small", "Medium"],
          description: "Entity must fall under Micro, Small, or Medium MSME tier"
        },
        {
          field: "complianceFlags.hasGstin",
          operator: "EQUALS",
          value: true,
          description: "Active GSTIN registration is mandatory"
        },
        {
          field: "turnoverInr",
          operator: "LTE",
          value: 2500000000, // 250 Cr
          description: "Annual turnover must not exceed MSME threshold (₹250 Cr)"
        }
      ]
    },
    created_at: "2024-01-10T08:00:00Z"
  },
  {
    id: "scheme-birac-big",
    sourceType: "manual",
    sourcePortal: "birac.nic.in",
    title: "BIRAC Biotechnology Ignition Grant (BIG - 24th Call)",
    ministryOrFunder: "Biotechnology Industry Research Assistance Council (BIRAC) / DBT",
    description: "Ignition grant up to ₹50 Lakhs to biotech startups and individual entrepreneurs to establish proof-of-concept for innovative healthcare, agritech, industrial biotech, or medical device ideas.",
    grantType: "Equity-free Grant",
    maxFundingAmount: 5000000, // ₹50 Lakhs
    deadline: "2026-09-30",
    sector: ["Biotechnology", "Healthcare", "DeepTech", "Agritech"],
    tags: ["BIRAC", "Biotech", "Ignition Grant", "R&D"],
    requiredDocuments: [
      { docType: "PAN_CARD", name: "Company PAN Card", isMandatory: true, description: "Entity PAN card" },
      { docType: "PROJECT_PROPOSAL", name: "Detailed Technical Proposal", isMandatory: true, description: "Milestone-linked R&D proposal with lab requirements" },
      { docType: "AUDITED_FINANCIALS", name: "Incorporation & Financial Records", isMandatory: false, description: "Latest audited statements or bank certificate" }
    ],
    eligibilityAst: {
      operator: "AND",
      description: "BIRAC BIG Eligibility Constraints",
      children: [
        {
          field: "entityType",
          operator: "IN",
          value: ["Private Limited", "LLP"],
          description: "Must be incorporated as a Private Limited Company or LLP"
        },
        {
          field: "yearsOfOperation",
          operator: "LTE",
          value: 5,
          description: "Entity must be an early-stage startup (incorporated ≤ 5 years ago)"
        },
        {
          field: "complianceFlags.hasPan",
          operator: "EQUALS",
          value: true,
          description: "Valid PAN card required"
        }
      ]
    },
    created_at: "2024-02-01T10:00:00Z"
  },
  {
    id: "scheme-csr-solar",
    sourceType: "scraped",
    sourcePortal: "csrxchange.gov.in",
    title: "CSR Xchange Rural Clean Energy & Solar Micro-Grid Grant",
    ministryOrFunder: "Tata Power Community Development Trust / CSR Xchange",
    description: "Corporate Social Responsibility (CSR) impact grant for non-profit organizations executing community solar electrification, solar water pumps, or clean energy access in aspirational districts.",
    grantType: "CSR Grant",
    maxFundingAmount: 3500000, // ₹35 Lakhs
    deadline: "2026-11-15",
    sector: ["CleanTech", "Rural Development", "Water Conservation"],
    tags: ["CSR", "Solar", "Non-Profit", "Rural"],
    requiredDocuments: [
      { docType: "12A_REGISTRATION", name: "12A Registration Certificate", isMandatory: true, description: "Income Tax Department Section 12A/12AB registration" },
      { docType: "80G_REGISTRATION", name: "80G Exemption Certificate", isMandatory: true, description: "Section 80G tax deduction registration" },
      { docType: "CSR1_CERTIFICATE", name: "MCA Form CSR-1 Registration", isMandatory: true, description: "Ministry of Corporate Affairs CSR-1 filing number" },
      { docType: "NGO_DARPAN_CERTIFICATE", name: "NITI Aayog NGO Darpan ID", isMandatory: true, description: "Unique NGO Darpan portal registration ID" },
      { docType: "AUDITED_FINANCIALS", name: "3-Year Audited Balance Sheets", isMandatory: true, description: "Audited financial statements by CA" }
    ],
    eligibilityAst: {
      operator: "AND",
      description: "CSR Grant Non-Profit Eligibility AST",
      children: [
        {
          field: "entityType",
          operator: "IN",
          value: ["Trust", "Society", "Section 8"],
          description: "Entity must be an eligible Non-Profit (Trust, Society, or Section 8 Company)"
        },
        {
          field: "complianceFlags.has12A",
          operator: "EQUALS",
          value: true,
          description: "Must hold valid 12A/12AB Income Tax Registration"
        },
        {
          field: "complianceFlags.has80G",
          operator: "EQUALS",
          value: true,
          description: "Must hold valid Section 80G Tax Exemption Certificate"
        },
        {
          field: "complianceFlags.hasNgoDarpan",
          operator: "EQUALS",
          value: true,
          description: "Must be registered on NITI Aayog NGO Darpan portal"
        },
        {
          field: "complianceFlags.hasCsr1",
          operator: "EQUALS",
          value: true,
          description: "Must be registered on MCA Portal with Form CSR-1"
        },
        {
          field: "yearsOfOperation",
          operator: "GTE",
          value: 3,
          description: "Must have at least 3 completed years of audited non-profit operations"
        }
      ]
    },
    created_at: "2024-02-15T12:00:00Z"
  },
  {
    id: "scheme-standup-india",
    sourceType: "manual",
    sourcePortal: "standupmitra.in",
    title: "Stand-Up India Scheme (Greenfield Enterprise Subsidy & Loan)",
    ministryOrFunder: "Department of Financial Services (DFS), Ministry of Finance",
    description: "Composite grant/loan assistance from ₹10 Lakhs up to ₹1 Crore for setting up greenfield manufacturing, services, or trading enterprises by SC/ST and/or Woman entrepreneurs.",
    grantType: "Concessional Loan",
    maxFundingAmount: 10000000, // ₹1 Crore
    subsidyPercentage: 15,
    deadline: "2027-03-31",
    sector: ["Manufacturing", "Services", "Greenfield"],
    tags: ["Women Entrepreneur", "SC/ST", "Greenfield", "Finance"],
    requiredDocuments: [
      { docType: "PAN_CARD", name: "Promoter PAN Card", isMandatory: true, description: "PAN card of the applicant/promoter" },
      { docType: "UDYAM_CERTIFICATE", name: "Udyam Registration", isMandatory: false, description: "Udyam registration certificate if already generated" },
      { docType: "PROJECT_PROPOSAL", name: "Greenfield Detailed Project Report (DPR)", isMandatory: true, description: "Detailed techno-economic project feasibility report" }
    ],
    eligibilityAst: {
      operator: "AND",
      description: "Stand-Up India Eligibility Rules",
      children: [
        {
          field: "complianceFlags.isGreenfield",
          operator: "EQUALS",
          value: true,
          description: "Project must be a first-time greenfield enterprise venture"
        },
        {
          operator: "OR",
          description: "Promoter Background Constraint",
          children: [
            {
              field: "complianceFlags.isWomanLed",
              operator: "EQUALS",
              value: true,
              description: "Enterprise is Woman-led (≥51% shareholding/control)"
            },
            {
              field: "complianceFlags.isScStLed",
              operator: "EQUALS",
              value: true,
              description: "Enterprise is SC/ST entrepreneur led (≥51% shareholding)"
            }
          ]
        }
      ]
    },
    created_at: "2024-01-25T09:00:00Z"
  },
  {
    id: "scheme-pmegp",
    sourceType: "scraped",
    sourcePortal: "myScheme.gov.in",
    title: "Prime Minister Employment Generation Programme (PMEGP)",
    ministryOrFunder: "Khadi and Village Industries Commission (KVIC) / MoMSME",
    description: "Credit-linked subsidy programme generating self-employment micro-enterprises in non-farm sector. Provides margin money subsidy up to 35% on project cost up to ₹50 Lakhs.",
    grantType: "Subsidy",
    maxFundingAmount: 5000000, // ₹50 Lakhs
    subsidyPercentage: 35,
    deadline: "2026-12-31",
    sector: ["Rural Development", "Micro Enterprises", "Agri-Processing"],
    tags: ["PMEGP", "KVIC", "Subsidy", "Employment"],
    requiredDocuments: [
      { docType: "PAN_CARD", name: "PAN Card", isMandatory: true, description: "PAN card of applicant or enterprise" },
      { docType: "PROJECT_PROPOSAL", name: "Detailed Project Report (DPR)", isMandatory: true, description: "Cost breakdown and projected employment generation" }
    ],
    eligibilityAst: {
      operator: "AND",
      description: "PMEGP General Eligibility",
      children: [
        {
          field: "turnoverInr",
          operator: "LTE",
          value: 50000000, // ₹5 Cr
          description: "Annual turnover must not exceed micro enterprise threshold (₹5 Cr)"
        },
        {
          field: "complianceFlags.hasPan",
          operator: "EQUALS",
          value: true,
          description: "Valid PAN card is required"
        }
      ]
    },
    created_at: "2024-02-20T14:00:00Z"
  },
  {
    id: "scheme-sisfs",
    sourceType: "manual",
    sourcePortal: "startupindia.gov.in",
    title: "Startup India Seed Fund Scheme (SISFS)",
    ministryOrFunder: "Department for Promotion of Industry and Internal Trade (DPIIT)",
    description: "Financial assistance up to ₹50 Lakhs to early-stage startups for proof of concept, prototype development, product trials, market entry, and commercialization through approved incubators.",
    grantType: "Equity-free Grant",
    maxFundingAmount: 5000000,
    deadline: "2026-10-31",
    sector: ["Innovation", "Technology", "Hardware", "Software"],
    tags: ["Startup India", "DPIIT", "Seed Fund", "Early Stage"],
    requiredDocuments: [
      { docType: "PAN_CARD", name: "Company PAN Card", isMandatory: true, description: "Entity PAN card" },
      { docType: "PROJECT_PROPOSAL", name: "Incubation & Commercialization Deck", isMandatory: true, description: "Milestone roadmap for prototype or commercial launch" }
    ],
    eligibilityAst: {
      operator: "AND",
      description: "Startup India SISFS Rules",
      children: [
        {
          field: "entityType",
          operator: "IN",
          value: ["Private Limited", "LLP"],
          description: "Must be a DPIIT-recognized Private Limited Company or LLP"
        },
        {
          field: "yearsOfOperation",
          operator: "LTE",
          value: 2,
          description: "Startup must not have completed more than 2 years from incorporation"
        },
        {
          field: "turnoverInr",
          operator: "LTE",
          value: 100000000, // ₹10 Cr
          description: "Turnover must not exceed ₹10 Crores"
        }
      ]
    },
    created_at: "2024-03-05T11:00:00Z"
  }
];
