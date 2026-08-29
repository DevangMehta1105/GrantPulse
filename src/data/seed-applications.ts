import { Application } from "../lib/types";

export const SEED_APPLICATIONS: Application[] = [
  {
    id: "app-101",
    orgId: "org-2",
    schemeId: "scheme-zed",
    currentState: "Sanctioned",
    externalApplicationId: "ZED/2024/MH/99241",
    filingReceiptUrl: "/receipts/zed-sanction-letter.pdf",
    matchScore: 100,
    requestedAmount: 500000,
    sanctionedAmount: 400000, // 80% of 5L
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-03-15T14:30:00Z",
    stateHistory: [
      {
        fromState: "Genesis",
        toState: "Discovered",
        timestamp: "2024-02-01T09:00:00Z",
        actor: "Auto-Matcher Agent",
        actionNote: "Scheme discovered via 100% AST rule match against Vidyut Micro Mobility profile",
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      {
        fromState: "Discovered",
        toState: "Docs Verified",
        timestamp: "2024-02-05T11:20:00Z",
        actor: "OCR Audit Subsystem",
        actionNote: "All 3 mandatory documents (Udyam, GSTIN, PAN) verified with regex validity score 98%",
        previousHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
      },
      {
        fromState: "Docs Verified",
        toState: "Drafting",
        timestamp: "2024-02-08T15:00:00Z",
        actor: "Compliance Officer",
        actionNote: "Quality improvement audit checklist and budget breakdown compiled using AI Co-Pilot",
        previousHash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        hash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
      },
      {
        fromState: "Drafting",
        toState: "Applied",
        timestamp: "2024-02-12T16:45:00Z",
        actor: "Managing Director",
        actionNote: "Formal filing submitted on MSME Champions Portal with reference ZED/2024/MH/99241",
        previousHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
        hash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d"
      },
      {
        fromState: "Applied",
        toState: "Under Review",
        timestamp: "2024-02-20T10:00:00Z",
        actor: "State Quality Council of India Assessor",
        actionNote: "Desk evaluation cleared; on-site zero-defect zero-effect audit scheduled",
        previousHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
        hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
      },
      {
        fromState: "Under Review",
        toState: "Sanctioned",
        timestamp: "2024-03-15T14:30:00Z",
        actor: "Ministry Grants Cell",
        actionNote: "Sanction Order #SO-ZED-9821 issued for ₹4,00,000 subsidy reimbursement",
        previousHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"
      }
    ]
  },
  {
    id: "app-102",
    orgId: "org-1",
    schemeId: "scheme-csr-solar",
    currentState: "Under Review",
    externalApplicationId: "CSRX/2024/SOL/4412",
    matchScore: 100,
    requestedAmount: 3500000,
    created_at: "2024-02-18T10:00:00Z",
    updated_at: "2024-03-02T11:00:00Z",
    stateHistory: [
      {
        fromState: "Genesis",
        toState: "Discovered",
        timestamp: "2024-02-18T10:00:00Z",
        actor: "NGO Pulse Matcher",
        actionNote: "Matched with 100% 12A, 80G, CSR-1 and NGO Darpan compliance",
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0"
      },
      {
        fromState: "Discovered",
        toState: "Docs Verified",
        timestamp: "2024-02-20T12:00:00Z",
        actor: "Compliance Officer",
        actionNote: "Verified 12A, 80G, CSR-1 certificates and audited financials",
        previousHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
        hash: "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01"
      },
      {
        fromState: "Docs Verified",
        toState: "Drafting",
        timestamp: "2024-02-24T14:15:00Z",
        actor: "Program Director",
        actionNote: "AI Proposal Co-Pilot generated solar cold-chain impact proposal",
        previousHash: "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
        hash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012"
      },
      {
        fromState: "Drafting",
        toState: "Applied",
        timestamp: "2024-02-28T16:00:00Z",
        actor: "Authorized Trustee",
        actionNote: "Submitted to CSR Xchange portal with ref CSRX/2024/SOL/4412",
        previousHash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012",
        hash: "d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123"
      },
      {
        fromState: "Applied",
        toState: "Under Review",
        timestamp: "2024-03-02T11:00:00Z",
        actor: "CSR Board Evaluation Committee",
        actionNote: "First round presentation completed; technical vetting underway",
        previousHash: "d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123",
        hash: "e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01234"
      }
    ]
  },
  {
    id: "app-103",
    orgId: "org-2",
    schemeId: "scheme-birac-big",
    currentState: "Drafting",
    matchScore: 100,
    requestedAmount: 5000000,
    created_at: "2024-02-25T11:00:00Z",
    updated_at: "2024-03-05T09:30:00Z",
    stateHistory: [
      {
        fromState: "Genesis",
        toState: "Discovered",
        timestamp: "2024-02-25T11:00:00Z",
        actor: "System Engine",
        actionNote: "Matched: Early stage private limited company in clean energy tech",
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: "1111111111111111111111111111111111111111111111111111111111111111"
      },
      {
        fromState: "Discovered",
        toState: "Docs Verified",
        timestamp: "2024-02-28T14:00:00Z",
        actor: "Document Engine",
        actionNote: "PAN and incorporation certificates verified",
        previousHash: "1111111111111111111111111111111111111111111111111111111111111111",
        hash: "2222222222222222222222222222222222222222222222222222222222222222"
      },
      {
        fromState: "Docs Verified",
        toState: "Drafting",
        timestamp: "2024-03-05T09:30:00Z",
        actor: "CTO",
        actionNote: "Drafting battery thermal runaway prevention R&D dossier",
        previousHash: "2222222222222222222222222222222222222222222222222222222222222222",
        hash: "3333333333333333333333333333333333333333333333333333333333333333"
      }
    ]
  },
  {
    id: "app-104",
    orgId: "org-2",
    schemeId: "scheme-standup-india",
    currentState: "Docs Verified",
    matchScore: 100,
    requestedAmount: 7500000,
    created_at: "2024-03-01T15:00:00Z",
    updated_at: "2024-03-04T10:00:00Z",
    stateHistory: [
      {
        fromState: "Genesis",
        toState: "Discovered",
        timestamp: "2024-03-01T15:00:00Z",
        actor: "Matcher",
        actionNote: "Matched Woman-led greenfield venture criteria",
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: "4444444444444444444444444444444444444444444444444444444444444444"
      },
      {
        fromState: "Discovered",
        toState: "Docs Verified",
        timestamp: "2024-03-04T10:00:00Z",
        actor: "Docs Vault",
        actionNote: "Identity and Greenfield verification certificates logged",
        previousHash: "4444444444444444444444444444444444444444444444444444444444444444",
        hash: "5555555555555555555555555555555555555555555555555555555555555555"
      }
    ]
  },
  {
    id: "app-105",
    orgId: "org-3",
    schemeId: "scheme-pmegp",
    currentState: "Discovered",
    matchScore: 100,
    requestedAmount: 2500000,
    created_at: "2024-03-06T08:00:00Z",
    updated_at: "2024-03-06T08:00:00Z",
    stateHistory: [
      {
        fromState: "Genesis",
        toState: "Discovered",
        timestamp: "2024-03-06T08:00:00Z",
        actor: "System Engine",
        actionNote: "Discovered via rural employment agro-processing category",
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: "6666666666666666666666666666666666666666666666666666666666666666"
      }
    ]
  }
];

export const SEED_EXPENSES = [
  {
    id: "exp-1",
    applicationId: "app-101",
    category: "Capital Equipment" as const,
    amount: 185000,
    invoiceNumber: "INV-2024-098",
    vendorName: "Precision Testing Instruments Pvt Ltd",
    invoiceUrl: "/invoices/inv-098.pdf",
    isCompliant: true,
    complianceNotes: "Conforms to ZED Testing Equipment Subsidy Category A (Cap ₹2,00,000)",
    timestamp: "2024-03-18T10:00:00Z"
  },
  {
    id: "exp-2",
    applicationId: "app-101",
    category: "Overheads / Admin" as const,
    amount: 95000,
    invoiceNumber: "QCI-AUDIT-441",
    vendorName: "Quality Council of India Accredited Body",
    invoiceUrl: "/invoices/qci-441.pdf",
    isCompliant: true,
    complianceNotes: "Official certification assessment fee under GFR 12-A rule",
    timestamp: "2024-03-22T14:15:00Z"
  },
  {
    id: "exp-3",
    applicationId: "app-101",
    category: "Manpower & Salaries" as const,
    amount: 60000,
    invoiceNumber: "PAY-2024-03",
    vendorName: "Certified Energy Auditor Consultant",
    invoiceUrl: "/invoices/consultant-mar24.pdf",
    isCompliant: true,
    complianceNotes: "Eligible consultant stipend for clean energy audit",
    timestamp: "2024-03-25T16:30:00Z"
  }
];
