import { NextResponse } from "next/server";
import { fetchOrganizationsFromDb, fetchSchemesFromDb } from "@/lib/supabase/service";
import { rankSchemesBySemanticFit } from "@/lib/semantic/matcher";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orgId, missionDescription, sector } = body;

    const [orgs, schemes] = await Promise.all([
      fetchOrganizationsFromDb(),
      fetchSchemesFromDb()
    ]);

    let org = orgs.find(o => o.id === orgId);
    if (!org && missionDescription) {
      org = {
        id: "custom-query-org",
        name: "Applicant Entity",
        entityType: "Private Limited",
        turnoverInr: 0,
        incorporationDate: new Date().toISOString().split("T")[0],
        yearsOfOperation: 1,
        udyamTier: "Micro",
        state: "National",
        sector: sector || "General",
        complianceFlags: {
          hasGstin: false,
          hasPan: false,
          hasUdyam: false,
          has12A: false,
          has80G: false,
          hasNgoDarpan: false,
          hasFcra: false,
          hasCsr1: false
        },
        missionDescription: missionDescription,
        contactEmail: "",
        created_at: new Date().toISOString()
      };
    } else if (!org && orgs.length > 0) {
      org = orgs[0];
    }

    if (!org) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        organization: null,
        rankedSchemesCount: 0,
        topMatches: [],
        allRankings: []
      });
    }

    const ranked = rankSchemesBySemanticFit(org, schemes);

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
