import { AstConditionNode, AstGroupNode, AstNode, EvaluationResult, Organization, TraceNode } from "../types";

/**
 * Extracts a nested property value from an object using a dot-delimited path (e.g. "complianceFlags.has80G")
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Evaluates a single leaf condition node against the organization profile.
 */
function evaluateConditionNode(node: AstConditionNode, org: Organization, idPrefix: string): TraceNode {
  const actualValue = getNestedValue(org, node.field);
  let passed = false;
  let reason = "";

  switch (node.operator) {
    case 'EQUALS':
      passed = actualValue === node.value;
      reason = passed 
        ? `Matched requirement: ${node.description}`
        : `Expected "${node.value}", but entity has "${actualValue ?? 'Not Set'}"`;
      break;

    case 'GTE':
      passed = typeof actualValue === 'number' && actualValue >= (node.value as number);
      reason = passed
        ? `Passed: ${node.description} (${actualValue} >= ${node.value})`
        : `Requirement unmet: current value ${actualValue ?? 0} is below required threshold ${node.value}`;
      break;

    case 'LTE':
      passed = typeof actualValue === 'number' && actualValue <= (node.value as number);
      reason = passed
        ? `Passed: ${node.description} (${actualValue} <= ${node.value})`
        : `Turnover / parameter exceeds cap: current value ${actualValue ?? 0} > cap ${node.value}`;
      break;

    case 'IN':
      if (Array.isArray(node.value)) {
        passed = (node.value as any[]).includes(actualValue);
        reason = passed
          ? `Qualified: "${actualValue}" is in allowed types [${(node.value as any[]).join(', ')}]`
          : `Entity type "${actualValue ?? 'Unknown'}" is not eligible. Allowed: [${(node.value as any[]).join(', ')}]`;
      } else {
        passed = false;
        reason = `Invalid condition array`;
      }
      break;

    case 'CONTAINS':
      if (Array.isArray(actualValue)) {
        passed = actualValue.includes(node.value);
        reason = passed
          ? `Qualified with ${node.value}`
          : `Missing required attribute: ${node.value}`;
      } else if (typeof actualValue === 'string') {
        passed = actualValue.toLowerCase().includes(String(node.value).toLowerCase());
        reason = passed
          ? `Contains required term: ${node.value}`
          : `Does not contain: ${node.value}`;
      } else {
        passed = false;
        reason = `Field ${node.field} is not a valid list or text`;
      }
      break;

    default:
      passed = false;
      reason = `Unknown condition operator`;
  }

  return {
    id: idPrefix,
    type: 'condition',
    operator: node.operator,
    description: node.description,
    passed,
    reason,
    actualValue,
    targetValue: node.value,
  };
}

/**
 * Recursively evaluates an AST node (Group or Condition) and generates full explainability trace.
 */
export function evaluateAstNode(node: AstNode, org: Organization, idPrefix: string = "node-0"): TraceNode {
  if ('field' in node) {
    return evaluateConditionNode(node as AstConditionNode, org, idPrefix);
  }

  const groupNode = node as AstGroupNode;
  const childrenTraces: TraceNode[] = [];
  let passed = true;

  if (groupNode.operator === 'AND') {
    passed = true;
    for (let i = 0; i < groupNode.children.length; i++) {
      const childTrace = evaluateAstNode(groupNode.children[i], org, `${idPrefix}-${i}`);
      childrenTraces.push(childTrace);
      if (!childTrace.passed) {
        passed = false;
      }
    }
  } else if (groupNode.operator === 'OR') {
    passed = false;
    for (let i = 0; i < groupNode.children.length; i++) {
      const childTrace = evaluateAstNode(groupNode.children[i], org, `${idPrefix}-${i}`);
      childrenTraces.push(childTrace);
      if (childTrace.passed) {
        passed = true;
      }
    }
  } else if (groupNode.operator === 'NOT') {
    const child = groupNode.children[0];
    const childTrace = evaluateAstNode(child, org, `${idPrefix}-0`);
    childrenTraces.push(childTrace);
    passed = !childTrace.passed;
  }

  const passedChildrenCount = childrenTraces.filter(c => c.passed).length;
  const totalChildrenCount = childrenTraces.length;

  return {
    id: idPrefix,
    type: 'group',
    operator: groupNode.operator,
    description: groupNode.description || `Rule Group (${groupNode.operator})`,
    passed,
    reason: passed 
      ? `All required ${groupNode.operator} constraints satisfied (${passedChildrenCount}/${totalChildrenCount})`
      : `Failed ${groupNode.operator} constraints (${passedChildrenCount}/${totalChildrenCount} satisfied)`,
    children: childrenTraces,
  };
}

/**
 * Evaluates an entire scheme's AST against an organization profile.
 */
export function evaluateSchemeEligibility(ast: AstGroupNode, org: Organization): EvaluationResult {
  const rootTrace = evaluateAstNode(ast, org, "root");

  // Collect flat lists of passes and failures
  const missingRequirements: string[] = [];
  const criticalPasses: string[] = [];
  let totalRules = 0;
  let passedRules = 0;

  function traverseTrace(t: TraceNode) {
    if (t.type === 'condition') {
      totalRules++;
      if (t.passed) {
        passedRules++;
        criticalPasses.push(t.description);
      } else {
        missingRequirements.push(t.reason || t.description);
      }
    }
    if (t.children) {
      t.children.forEach(traverseTrace);
    }
  }

  traverseTrace(rootTrace);

  const matchScore = totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : (rootTrace.passed ? 100 : 0);

  return {
    isEligible: rootTrace.passed,
    matchScore: rootTrace.passed ? 100 : matchScore,
    passedRulesCount: passedRules,
    totalRulesCount: totalRules,
    trace: rootTrace,
    missingRequirements,
    criticalPasses,
  };
}
