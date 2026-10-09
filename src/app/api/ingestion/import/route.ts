import { NextResponse } from "next/server";
import { processBulkSchemeImport } from "@/lib/ingestion/csv-importer";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, format = "csv" } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "File content string is required in payload." },
        { status: 400 }
      );
    }

    const result = processBulkSchemeImport(content, format as "csv" | "json");

    // Persist valid imported schemes to Supabase server-side
    if (result.validSchemes && result.validSchemes.length > 0) {
      const supabase = getServerSupabase();
      if (supabase) {
        const rows = result.validSchemes.map(s => ({
          id: s.id,
          source_type: "scraped",
          source_portal: s.sourcePortal,
          title: s.title,
          ministry_or_funder: s.ministryOrFunder,
          description: s.description,
          grant_type: s.grantType,
          max_funding_amount: s.maxFundingAmount,
          min_funding_amount: s.minFundingAmount || null,
          subsidy_percentage: s.subsidyPercentage || null,
          deadline: s.deadline,
          sector: s.sector,
          official_portal_url: s.officialPortalUrl,
          eligibility_ast: s.eligibilityAst,
          required_documents: s.requiredDocuments,
          tags: s.tags,
          created_at: s.created_at || new Date().toISOString()
        }));

        const { error: upsertErr } = await supabase
          .from("schemes")
          .upsert(rows, { onConflict: "id" });

        if (upsertErr) {
          console.error("Supabase bulk import upsert failed:", upsertErr);
        }
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import payload" },
      { status: 500 }
    );
  }
}
