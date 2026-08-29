import { NextResponse } from "next/server";
import { createTransitionLog, verifyAuditChainIntegrity } from "@/lib/fsm/state-machine";
import { ApplicationState } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromState, toState, actor, actionNote, previousHash }: {
      fromState: ApplicationState | 'Genesis';
      toState: ApplicationState;
      actor: string;
      actionNote: string;
      previousHash: string;
    } = body;

    const logEntry = await createTransitionLog(
      fromState,
      toState,
      actor || "Compliance Officer",
      actionNote || `Advanced to ${toState}`,
      previousHash
    );

    return NextResponse.json({ success: true, log: logEntry });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
