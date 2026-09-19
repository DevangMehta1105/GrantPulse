import { NextResponse } from "next/server";
import { SEED_ORGANIZATIONS } from "@/data/seed-organizations";
import { SEED_SCHEMES } from "@/data/seed-schemes";
import { rankSchemesBySemanticFit } from "@/lib/semantic/matcher";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orgId, missionDescription, sector } = body;

    let org = SEED_ORGANIZATIONS.find(o => o.id === orgId);
    if (!org && missionDescription) {
      org = {
        ...SEED_ORGANIZATIONS[0],
        id: "custom-query-org",
        name: "Custom Applicant",
        sector: sector || "General",
        missionDescription: missionDescription
      };
    } else if (!org) {
      org = SEED_ORGANIZATIONS[1]; // Vidyut Micro Mobility default
    }

    const ranked = rankSchemesBySemanticFit(org, SEED_SCHEMES);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      organization: {
        id: org.id,
        name: org.name,
        sector: org.sector,
        missionDescription: org.missionDescription
      },
      rankedSchemesCount: ranked.length,
      topMatches: ranked.slice(0, 5),
      allRankings: ranked
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Semantic matching failed" },
      { status: 500 }
    );
  }
}
