import { Organization, Scheme, EvaluationResult } from "../types";
import { generateThematicEmbedding, calculateCosineSimilarity, extractThematicOverlap } from "./embeddings";
import { evaluateSchemeEligibility } from "../ast-engine/evaluator";

export interface SemanticMatchResult {
  schemeId: string;
  schemeTitle: string;
  ministryOrFunder: string;
  semanticScore: number; // 0 - 100
  astScore: number; // 0 - 100
  compositeScore: number; // 60% AST + 40% Semantic
  isAstEligible: boolean;
  thematicOverlap: string[];
  intentExplanation: string;
  synergyLevel: "HIGH" | "MODERATE" | "LOW";
}

/**
 * Evaluates semantic soft-fit between an organization's mission profile and a grant scheme
 */
export function evaluateSemanticFit(
  org: Organization,
  scheme: Scheme
): SemanticMatchResult {
  const orgFullText = `${org.name} ${org.sector} ${org.missionDescription || ""}`;
  const schemeFullText = `${scheme.title} ${scheme.description} ${scheme.sector.join(" ")} ${scheme.tags.join(" ")}`;

  const orgVector = generateThematicEmbedding(orgFullText);
  const schemeVector = generateThematicEmbedding(schemeFullText);

  // Baseline similarity
  let semanticScore = calculateCosineSimilarity(orgVector, schemeVector);

  // Cross-check sector alignment
  const orgSectorLower = org.sector.toLowerCase();
  const schemeSectorMatches = scheme.sector.some(s => 
    s.toLowerCase().includes(orgSectorLower) || orgSectorLower.includes(s.toLowerCase())
  );
  if (schemeSectorMatches && semanticScore < 70) {
    semanticScore = Math.min(100, semanticScore + 25);
  }

  // Ensure high quality baseline range
  if (semanticScore < 15 && schemeSectorMatches) {
    semanticScore = 45;
  }

  const astEval = evaluateSchemeEligibility(scheme.eligibilityAst, org);
  const astScore = astEval.matchScore;
  const compositeScore = Math.round(astScore * 0.6 + semanticScore * 0.4);

  const thematicOverlap = extractThematicOverlap(orgFullText, schemeFullText);

  let synergyLevel: "HIGH" | "MODERATE" | "LOW" = "LOW";
  if (semanticScore >= 75) synergyLevel = "HIGH";
  else if (semanticScore >= 45) synergyLevel = "MODERATE";

  let intentExplanation = "";
  if (thematicOverlap.length > 0) {
    intentExplanation = `Strong thematic alignment identified across ${thematicOverlap.join(", ")} objectives. The applicant's core activities directly match the funder's stated impact KPIs.`;
  } else if (schemeSectorMatches) {
    intentExplanation = `Sectoral match in ${org.sector}. Scheme objectives support expansion and capacity building in this domain.`;
  } else {
    intentExplanation = `Moderate general alignment. Requires tailored project proposal narrative to emphasize applicant's secondary operational activities.`;
  }

  return {
    schemeId: scheme.id,
    schemeTitle: scheme.title,
    ministryOrFunder: scheme.ministryOrFunder,
    semanticScore,
    astScore,
    compositeScore,
    isAstEligible: astEval.isEligible,
    thematicOverlap,
    intentExplanation,
    synergyLevel
  };
}

/**
 * Ranks all available schemes for an organization by semantic soft-fit
 */
export function rankSchemesBySemanticFit(
  org: Organization,
  schemes: Scheme[]
): SemanticMatchResult[] {
  const results = schemes.map(scheme => evaluateSemanticFit(org, scheme));
  return results.sort((a, b) => b.semanticScore - a.semanticScore);
}
