import { NextResponse } from "next/server";
import { SEED_ORGANIZATIONS } from "@/data/seed-organizations";
import { SEED_SCHEMES } from "@/data/seed-schemes";
import { synthesizeGrantDossier } from "@/lib/copilot/synthesizer";
import { ProposalTone } from "@/lib/copilot/types";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orgId, schemeId, tone = "formal_gov", customNotes = "" } = body;

    const org = SEED_ORGANIZATIONS.find(o => o.id === orgId) || SEED_ORGANIZATIONS[1];
    const scheme = SEED_SCHEMES.find(s => s.id === schemeId) || SEED_SCHEMES[0];

    const dossier = synthesizeGrantDossier(org, scheme, tone as ProposalTone, customNotes);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      dossier
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to synthesize proposal dossier" },
      { status: 500 }
    );
  }
}
