import { Application, ApplicationState, StateTransitionLog } from "../types";
import { calculateSha256 } from "../utils";

export const STATE_FLOW: ApplicationState[] = [
  'Discovered',
  'Docs Verified',
  'Drafting',
  'Applied',
  'Under Review',
  'Sanctioned',
  'Rejected'
];

export const VALID_TRANSITIONS: Record<ApplicationState, ApplicationState[]> = {
  'Discovered': ['Docs Verified', 'Rejected'],
  'Docs Verified': ['Drafting', 'Discovered', 'Rejected'],
  'Drafting': ['Applied', 'Docs Verified', 'Rejected'],
  'Applied': ['Under Review', 'Rejected'],
  'Under Review': ['Sanctioned', 'Rejected', 'Drafting'],
  'Sanctioned': [],
  'Rejected': ['Discovered', 'Drafting']
};

export interface TransitionGuardCheck {
  allowed: boolean;
  reason?: string;
}

export function canTransition(
  currentState: ApplicationState,
  targetState: ApplicationState,
  context?: {
    documentReadinessScore?: number;
    hasMandatoryDocs?: boolean;
    externalAppId?: string;
    sanctionedAmount?: number;
  }
): TransitionGuardCheck {
  const allowedTargets = VALID_TRANSITIONS[currentState] || [];
  if (!allowedTargets.includes(targetState)) {
    return {
      allowed: false,
      reason: `Direct transition from "${currentState}" to "${targetState}" is not permitted in the compliance FSM.`
    };
  }

  // Guard: Discovered -> Docs Verified
  if (currentState === 'Discovered' && targetState === 'Docs Verified') {
    if (context?.documentReadinessScore !== undefined && context.documentReadinessScore < 75) {
      return {
        allowed: false,
        reason: `Document readiness score is ${context.documentReadinessScore}%. Minimum 75% verified documents required before advancing.`
      };
    }
  }

  // Guard: Drafting -> Applied
  if (currentState === 'Drafting' && targetState === 'Applied') {
    if (!context?.externalAppId || context.externalAppId.trim() === '') {
      return {
        allowed: false,
        reason: `Application cannot be marked as Applied without an official Government/Portal Acknowledgement or Reference ID.`
      };
    }
  }

  return { allowed: true };
}

/**
 * Creates a new cryptographically chained state transition log entry.
 */
export async function createTransitionLog(
  fromState: ApplicationState | 'Genesis',
  toState: ApplicationState,
  actor: string,
  actionNote: string,
  previousHash: string = "0000000000000000000000000000000000000000000000000000000000000000"
): Promise<StateTransitionLog> {
  const timestamp = new Date().toISOString();
  const rawPayload = `${previousHash}|${timestamp}|${fromState}|${toState}|${actor}|${actionNote}`;
  const hash = await calculateSha256(rawPayload);

  return {
    fromState,
    toState,
    timestamp,
    actor,
    actionNote,
    previousHash,
    hash
  };
}

/**
 * Verifies the mathematical cryptographic integrity of an entire state transition chain.
 */
export async function verifyAuditChainIntegrity(
  history: StateTransitionLog[]
): Promise<{ isValid: boolean; brokenAtStep?: number; error?: string }> {
  if (!history || history.length === 0) {
    return { isValid: true };
  }

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    
    // Check previous hash link
    if (i > 0) {
      const prevEntry = history[i - 1];
      if (entry.previousHash !== prevEntry.hash) {
        return {
          isValid: false,
          brokenAtStep: i,
          error: `Broken chain at step ${i + 1}: Previous hash does not match prior log signature.`
        };
      }
    }

    // Recompute current hash
    const expectedPayload = `${entry.previousHash}|${entry.timestamp}|${entry.fromState}|${entry.toState}|${entry.actor}|${entry.actionNote}`;
    const calculated = await calculateSha256(expectedPayload);
    if (calculated !== entry.hash) {
      return {
        isValid: false,
        brokenAtStep: i,
        error: `Tamper detected at step ${i + 1}: Recorded hash does not match payload digest.`
      };
    }
  }

  return { isValid: true };
}
