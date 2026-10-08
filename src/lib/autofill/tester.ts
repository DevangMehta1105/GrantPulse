// Automated Test Suite & Benchmarking Harness for CSR Form Auto-Fill Engine
import { ExternalCsrFormFixture, FormAutofillResult } from "./types";
import { executeFormAutofill } from "./field-mapper";
import { generateClientInjectionScript, generateGoogleFormsPrefillUrl } from "./script-generator";
import { synthesizeGrantDossier } from "../copilot/synthesizer";
import { Organization, Scheme } from "../types";

// Test Fixture 1: Standard Indian CSR Google Form (Grassroots Philanthropy EOI)
export const FIXTURE_GOOGLE_FORM_CSR: ExternalCsrFormFixture = {
  id: "fixture-google-form-tata-csr",
  portalPlatform: "google_forms",
  foundationName: "Tata Trusts Allied Philanthropies",
  formTitle: "Community Water & Healthcare Grant 2026 - Expression of Interest",
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLScX_sample_tata_grant/viewform",
  fields: [
    {
      fieldId: "q1_ngo_name",
      googleEntryId: "entry.104928194",
      label: "Legal Name of the NGO / Organization",
      elementType: "text",
      isRequired: true,
      category: "organization_identity"
    },
    {
      fieldId: "q2_entity_type",
      googleEntryId: "entry.83920194",
      label: "Type of Organization (Constitution)",
      elementType: "radio",
      options: ["Registered Public Charitable Trust", "Registered Society", "Section 8 Company"],
      isRequired: true,
      category: "organization_identity"
    },
    {
      fieldId: "q3_csr1_num",
      googleEntryId: "entry.94820184",
      label: "MCA Form CSR-1 Registration Number",
      elementType: "text",
      placeholder: "e.g. CSR00012345",
      isRequired: true,
      category: "statutory_compliance"
    },
    {
      fieldId: "q4_12a_urn",
      googleEntryId: "entry.29481029",
      label: "Income Tax Section 12A / 12AB Registration URN",
      elementType: "text",
      placeholder: "16-digit Unique Registration Number",
      isRequired: true,
      category: "statutory_compliance"
    },
    {
      fieldId: "q5_80g_urn",
      googleEntryId: "entry.58392018",
      label: "Income Tax Section 80G Approval URN",
      elementType: "text",
      isRequired: true,
      category: "statutory_compliance"
    },
    {
      fieldId: "q6_ngo_darpan",
      googleEntryId: "entry.38492018",
      label: "NITI Aayog NGO Darpan Unique ID",
      elementType: "text",
      isRequired: true,
      category: "statutory_compliance"
    },
    {
      fieldId: "q7_pan",
      googleEntryId: "entry.74920184",
      label: "Permanent Account Number (PAN) of Organization",
      elementType: "text",
      isRequired: true,
      category: "statutory_compliance"
    },
    {
      fieldId: "q8_project_title",
      googleEntryId: "entry.49201948",
      label: "Proposed Project Title",
      elementType: "text",
      isRequired: true,
      category: "project_proposal"
    },
    {
      fieldId: "q9_schedule_vii",
      googleEntryId: "entry.19482018",
      label: "Schedule VII Thematic Area",
      elementType: "select",
      options: [
        "Eradicating Hunger, Poverty and Malnutrition",
        "Promoting Healthcare, Sanitation and Safe Drinking Water",
        "Promoting Education, STEM and Digital Literacy",
        "Rural Development and Livelihoods"
      ],
      isRequired: true,
      category: "project_proposal"
    },
    {
      fieldId: "q10_problem_statement",
      googleEntryId: "entry.68392019",
      label: "Brief Problem Statement / Baseline Needs Assessment",
      elementType: "textarea",
      isRequired: true,
      category: "project_proposal"
    },
    {
      fieldId: "q11_solution",
      googleEntryId: "entry.84920184",
      label: "Proposed Intervention & Implementation Methodology",
      elementType: "textarea",
      isRequired: true,
      category: "project_proposal"
    },
    {
      fieldId: "q12_funding_amount",
      googleEntryId: "entry.93820194",
      label: "Total Grant Funding Amount Requested (in INR)",
      elementType: "number",
      isRequired: true,
      category: "budget_milestones"
    },
    {
      fieldId: "q13_beneficiaries",
      googleEntryId: "entry.58392049",
      label: "Estimated Number of Direct Beneficiaries",
      elementType: "text",
      isRequired: true,
      category: "project_proposal"
    },
    {
      fieldId: "q14_declaration",
      googleEntryId: "entry.29481920",
      label: "Self-Declaration: We confirm our organization is not blacklisted and complies with Section 135",
      elementType: "checkbox",
      isRequired: true,
      category: "statutory_compliance"
    }
  ]
};

// Test Fixture 2: Corporate Foundation Custom Web Portal (Infosys Foundation STEM Grant)
export const FIXTURE_CORPORATE_PORTAL_CSR: ExternalCsrFormFixture = {
  id: "fixture-corporate-portal-infosys",
  portalPlatform: "custom_web_portal",
  foundationName: "Infosys Foundation CSR Portal",
  formTitle: "Rural STEM Laboratories & Digital Literacy Grant Application",
  formUrl: "https://csr.infosys.org/grants/apply/stem-2026",
  fields: [
    {
      fieldId: "inp_applicant_name",
      name: "applicant_name",
      domSelector: "#orgLegalName",
      label: "Legal Applicant Organization Name",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "inp_org_type",
      name: "org_type",
      domSelector: "#entityTypeSelect",
      label: "Entity Legal Structure",
      elementType: "select",
      options: ["Trust", "Society", "Section 8 Company"],
      isRequired: true
    },
    {
      fieldId: "inp_csr1",
      name: "mca_csr1",
      domSelector: "input[name='csr1_registration']",
      label: "MCA Form CSR-1 Registration No",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "inp_12a_cert",
      name: "it_12a",
      domSelector: "input[name='section_12a_urn']",
      label: "Income Tax Section 12A URN Order",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "inp_80g_cert",
      name: "it_80g",
      domSelector: "input[name='section_80g_urn']",
      label: "Income Tax Section 80G Approval URN",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "inp_pan",
      name: "pan_card",
      domSelector: "#orgPanNumber",
      label: "Permanent Account Number (PAN)",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "inp_gstin",
      name: "gstin_num",
      domSelector: "#gstinInput",
      label: "Goods and Services Tax (GSTIN)",
      elementType: "text",
      isRequired: false
    },
    {
      fieldId: "inp_hq_state",
      name: "hq_state",
      domSelector: "#stateDropdown",
      label: "Headquarter State of Operations",
      elementType: "select",
      options: ["Maharashtra", "Karnataka", "Rajasthan", "Delhi", "Tamil Nadu"],
      isRequired: true
    },
    {
      fieldId: "inp_officer_name",
      name: "contact_officer",
      domSelector: "#signatoryName",
      label: "Authorized Signatory / Contact Person",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "inp_officer_email",
      name: "contact_email",
      domSelector: "#signatoryEmail",
      label: "Official Correspondence Email",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "inp_proj_title",
      name: "project_title",
      domSelector: "#projectTitle",
      label: "Name of the Proposed Initiative",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "inp_problem_desc",
      name: "problem_desc",
      domSelector: "#problemStatementArea",
      label: "Need Assessment & Baseline Problem Statement",
      elementType: "textarea",
      isRequired: true
    },
    {
      fieldId: "inp_milestones",
      name: "milestones_plan",
      domSelector: "#milestonesArea",
      label: "Key Milestones & Timeline (Quarterly Phases)",
      elementType: "textarea",
      isRequired: true
    },
    {
      fieldId: "inp_budget",
      name: "grant_requested_inr",
      domSelector: "#fundingRequested",
      label: "Total Budget Requested in INR",
      elementType: "number",
      isRequired: true
    },
    {
      fieldId: "inp_declaration_cb",
      name: "legal_terms_affirm",
      domSelector: "#termsCheck",
      label: "I agree to all statutory compliance requirements and confirm no conflict of interest",
      elementType: "checkbox",
      isRequired: true
    },
    {
      fieldId: "inp_captcha_challenge",
      name: "recaptcha_v2",
      domSelector: "#captchaToken",
      label: "Enter Security CAPTCHA verification code",
      elementType: "text",
      isRequired: true
    }
  ]
};

// Test Fixture 3: Government MSME Subsidy Portal (myScheme MSME ZED Scheme)
export const FIXTURE_GOV_MSME_SCHEME: ExternalCsrFormFixture = {
  id: "fixture-gov-myscheme-zed",
  portalPlatform: "custom_web_portal",
  foundationName: "Ministry of MSME / myScheme.gov.in",
  formTitle: "MSME Sustainable (ZED) Certification 2.0 Subsidy Application",
  formUrl: "https://zed.msme.gov.in/registration/apply",
  fields: [
    {
      fieldId: "zed_org_name",
      name: "enterprise_name",
      label: "Name of Applicant Enterprise",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "zed_entity_type",
      name: "enterprise_constitution",
      label: "Enterprise Legal Constitution",
      elementType: "select",
      options: ["Private Limited", "LLP", "Proprietorship", "Partnership"],
      isRequired: true
    },
    {
      fieldId: "zed_udyam",
      name: "udyam_reg_no",
      label: "MoMSME Udyam Registration Number",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "zed_pan",
      name: "company_pan",
      label: "Permanent Account Number (PAN)",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "zed_gstin",
      name: "enterprise_gstin",
      label: "GST Registration Number (REG-06)",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "zed_state",
      name: "manufacturing_state",
      label: "Principal Place of Manufacturing (State)",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "zed_grant_amt",
      name: "subsidy_grant_amount",
      label: "Grant Subsidy Amount Requested",
      elementType: "number",
      isRequired: true
    },
    {
      fieldId: "zed_project_summary",
      name: "technical_abstract",
      label: "Executive Summary of Quality Upgradation Plan",
      elementType: "textarea",
      isRequired: true
    },
    {
      fieldId: "zed_email",
      name: "nodal_officer_email",
      label: "Official Registered Email Address",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "zed_officer",
      name: "nodal_officer_name",
      label: "Nodal Contact Person Full Name",
      elementType: "text",
      isRequired: true
    },
    {
      fieldId: "zed_audit_cert",
      name: "ca_financials_file",
      label: "Upload CA Audited Balance Sheet PDF",
      elementType: "file",
      isRequired: true
    },
    {
      fieldId: "zed_compliance_agree",
      name: "affirm_zed_rules",
      label: "Affirm General Financial Rules (GFR) compliance terms",
      elementType: "checkbox",
      isRequired: true
    }
  ]
};

// Benchmark Test Runner
export function runAutofillBenchmarkTest(
  sampleOrg?: Organization,
  sampleScheme?: Scheme
): {
  testDate: string;
  totalFixturesTested: number;
  overallFillRatePercent: number;
  averageLatencyMs: number;
  results: FormAutofillResult[];
} {
  // Setup sample test organization (Grassroots NGO with full compliance)
  const org: Organization = sampleOrg || {
    id: "org-test-arogya",
    name: "Arogya Rural Healthcare & Water Trust",
    entityType: "Trust",
    turnoverInr: 18500000,
    incorporationDate: "2019-04-12",
    yearsOfOperation: 5,
    udyamTier: "None",
    state: "Maharashtra",
    sector: "Healthcare, WASH & Rural Livelihoods",
    complianceFlags: {
      hasGstin: true,
      gstin: "27AAATA4921K1Z9",
      hasPan: true,
      pan: "AAACG0567K",
      hasUdyam: false,
      has12A: true,
      reg12ANumber: "AABTA4921KE20214",
      has80G: true,
      reg80GNumber: "AABTA4921KG20218",
      hasNgoDarpan: true,
      ngoDarpanId: "MH/2021/0289141",
      hasFcra: false,
      hasCsr1: true,
      csr1Number: "CSR00049281",
      isWomanLed: true,
      isScStLed: false,
      isGreenfield: false
    },
    missionDescription: "Providing point-of-use solar UV water filtration and maternal diagnostic care.",
    contactEmail: "director@arogyatrust.org",
    created_at: new Date().toISOString()
  };

  const scheme: Scheme = sampleScheme || {
    id: "scheme-test-csr",
    sourceType: "scraped",
    sourcePortal: "csrxchange.gov.in",
    title: "Tata Trusts Community Safe Drinking Water & Health Grant 2026",
    ministryOrFunder: "Tata Trusts & Allied Philanthropies",
    description: "Multi-year CSR grant support for grassroots community water filtration and healthcare.",
    grantType: "CSR Grant",
    maxFundingAmount: 12500000,
    deadline: "2026-10-15",
    sector: ["WASH, Healthcare & Rural Livelihoods"],
    officialPortalUrl: "https://www.csrxchange.gov.in",
    eligibilityAst: { operator: "AND", children: [] },
    requiredDocuments: [],
    tags: ["CSR", "Tata Trusts"],
    created_at: new Date().toISOString()
  };

  const dossier = synthesizeGrantDossier(org, scheme, "csr_philanthropic");

  const fixtures = [
    FIXTURE_GOOGLE_FORM_CSR,
    FIXTURE_CORPORATE_PORTAL_CSR,
    FIXTURE_GOV_MSME_SCHEME
  ];

  const results: FormAutofillResult[] = fixtures.map(fixture => {
    const res = executeFormAutofill(fixture, { org, scheme, dossier });
    
    // Attach client script & pre-filled URL
    res.clientScriptSnippet = generateClientInjectionScript(res, fixture);
    if (fixture.portalPlatform === "google_forms") {
      res.prefilledUrl = generateGoogleFormsPrefillUrl(fixture.formUrl, res);
    }
    return res;
  });

  const totalFields = results.reduce((sum, r) => sum + r.totalFields, 0);
  const totalMapped = results.reduce((sum, r) => sum + r.mappedCount, 0);
  const totalLatency = results.reduce((sum, r) => sum + r.executionLatencyMs, 0);

  const overallFillRatePercent = Math.round((totalMapped / totalFields) * 1000) / 10;
  const averageLatencyMs = Math.round((totalLatency / results.length) * 10) / 10;

  return {
    testDate: new Date().toISOString(),
    totalFixturesTested: fixtures.length,
    overallFillRatePercent,
    averageLatencyMs,
    results
  };
}
