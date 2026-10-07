import { NextResponse } from "next/server";
import { fetchOrganizationsFromDb, fetchSchemesFromDb } from "@/lib/supabase/service";
import { synthesizeGrantDossier } from "@/lib/copilot/synthesizer";
import { ProposalTone } from "@/lib/copilot/types";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orgId, schemeId, tone = "formal_gov", customNotes = "" } = body;

    const [orgs, schemes] = await Promise.all([
      fetchOrganizationsFromDb(),
      fetchSchemesFromDb()
    ]);

    const org = orgs.find(o => o.id === orgId) || orgs[0];
    const scheme = schemes.find(s => s.id === schemeId) || schemes[0];

    if (!org || !scheme) {
      return NextResponse.json(
        { success: false, error: "Both an enrolled organization and a scheme are required to generate a proposal." },
        { status: 400 }
      );
    }

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
