import { Organization, Scheme, CounterfactualSimulationResult } from "../types";
import { evaluateSchemeEligibility } from "./evaluator";

export interface SimulationModifier {
  key: string;
  label: string;
  apply: (org: Organization) => Organization;
  costEstimateInr?: number;
  timeframeWeeks?: number;
}

export const COMMON_COMPLIANCE_MODIFIERS: SimulationModifier[] = [
  {
    key: "add_80g",
    label: "Obtain 80G Tax Exemption Approval",
    timeframeWeeks: 6,
    costEstimateInr: 15000,
    apply: (org) => ({
      ...org,
      complianceFlags: { ...org.complianceFlags, has80G: true, reg80GNumber: "AABTR80G2024" }
    })
  },
  {
    key: "add_12a",
    label: "Register 12A Trust Exemption",
    timeframeWeeks: 6,
    costEstimateInr: 15000,
    apply: (org) => ({
      ...org,
      complianceFlags: { ...org.complianceFlags, has12A: true, reg12ANumber: "AABTR12A2024" }
    })
  },
  {
    key: "add_ngo_darpan",
    label: "Register on NITI Aayog NGO Darpan Portal",
    timeframeWeeks: 1,
    costEstimateInr: 2000,
    apply: (org) => ({
      ...org,
      complianceFlags: { ...org.complianceFlags, hasNgoDarpan: true, ngoDarpanId: "DL/2024/0398471" }
    })
  },
  {
    key: "add_csr1",
    label: "File Form CSR-1 with MCA for Corporate Grants",
    timeframeWeeks: 2,
    costEstimateInr: 5000,
    apply: (org) => ({
      ...org,
      complianceFlags: { ...org.complianceFlags, hasCsr1: true, csr1Number: "CSR00049281" }
    })
  },
  {
    key: "add_fcra",
    label: "Obtain FCRA (Foreign Contribution) Registration",
    timeframeWeeks: 16,
    costEstimateInr: 45000,
    apply: (org) => ({
      ...org,
      complianceFlags: { ...org.complianceFlags, hasFcra: true, fcraNumber: "031420987" }
    })
  },
  {
    key: "add_udyam_micro",
    label: "Register Udyam MSME (Micro Enterprise)",
    timeframeWeeks: 1,
    costEstimateInr: 0,
    apply: (org) => ({
      ...org,
      udyamTier: "Micro",
      complianceFlags: { ...org.complianceFlags, hasUdyam: true, udyamNumber: "UDYAM-MH-01-0089241" }
    })
  },
  {
    key: "add_greenfield",
    label: "Designate as Greenfield Expansion Unit",
    timeframeWeeks: 2,
    costEstimateInr: 10000,
    apply: (org) => ({
      ...org,
      complianceFlags: { ...org.complianceFlags, isGreenfield: true }
    })
  }
];

/**
 * Runs a counterfactual delta analysis across a catalogue of schemes given an org and selected modifications.
 */
export function runCounterfactualAnalysis(
  currentOrg: Organization,
  schemes: Scheme[],
  activeModifierKeys: string[]
): CounterfactualSimulationResult {
  // Baseline evaluation
  const baselinePassMap = new Map<string, boolean>();
  schemes.forEach(scheme => {
    const result = evaluateSchemeEligibility(scheme.eligibilityAst, currentOrg);
    baselinePassMap.set(scheme.id, result.isEligible);
  });

  // Apply modifiers to construct simulated org
  let simulatedOrg = { ...currentOrg, complianceFlags: { ...currentOrg.complianceFlags } };
  const appliedModifiers: SimulationModifier[] = [];

  for (const modKey of activeModifierKeys) {
    const mod = COMMON_COMPLIANCE_MODIFIERS.find(m => m.key === modKey);
    if (mod) {
      simulatedOrg = mod.apply(simulatedOrg);
      appliedModifiers.push(mod);
    }
  }

  // Evaluate simulated org
  const unlockedSchemes: CounterfactualSimulationResult['unlockedSchemes'] = [];
  let totalDeltaFunding = 0;

  schemes.forEach(scheme => {
    const wasEligible = baselinePassMap.get(scheme.id) ?? false;
    if (!wasEligible) {
      const simulatedResult = evaluateSchemeEligibility(scheme.eligibilityAst, simulatedOrg);
      if (simulatedResult.isEligible) {
        unlockedSchemes.push({
          scheme,
          matchScore: simulatedResult.matchScore,
          fundingAmount: scheme.maxFundingAmount,
          unlockedByFixing: appliedModifiers.map(m => m.label)
        });
        totalDeltaFunding += scheme.maxFundingAmount;
      }
    }
  });

  // Compute individual high leverage fixes
  const highLeverageFixes: CounterfactualSimulationResult['highLeverageFixes'] = [];

  COMMON_COMPLIANCE_MODIFIERS.forEach(mod => {
    const testOrg = mod.apply({ ...currentOrg, complianceFlags: { ...currentOrg.complianceFlags } });
    let count = 0;
    let delta = 0;

    schemes.forEach(scheme => {
      const wasEligible = baselinePassMap.get(scheme.id) ?? false;
      if (!wasEligible) {
        const testResult = evaluateSchemeEligibility(scheme.eligibilityAst, testOrg);
        if (testResult.isEligible) {
          count++;
          delta += scheme.maxFundingAmount;
        }
      }
    });

    if (count > 0) {
      highLeverageFixes.push({
        action: mod.label,
        schemesUnlockedCount: count,
        fundingDeltaInr: delta
      });
    }
  });

  highLeverageFixes.sort((a, b) => b.fundingDeltaInr - a.fundingDeltaInr);

  return {
    unlockedSchemes,
    totalPotentialFundingDelta: totalDeltaFunding,
    highLeverageFixes
  };
}
