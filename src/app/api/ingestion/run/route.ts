import { NextResponse } from "next/server";
import { harvestMySchemePortal } from "@/lib/ingestion/scrapers/myscheme";
import { harvestCsrExchangePortal } from "@/lib/ingestion/scrapers/csrxchange";
import { harvestStartupIndiaPortal } from "@/lib/ingestion/scrapers/startupindia";
import { Scheme } from "@/lib/types";
import { IngestionLogEntry } from "@/lib/ingestion/types";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { source = "all" } = body;

    let schemes: Scheme[] = [];
    let logs: IngestionLogEntry[] = [];
    let errors: any[] = [];

    if (source === "myscheme" || source === "all") {
      const mySchemeRes = await harvestMySchemePortal();
      schemes = [...schemes, ...mySchemeRes.schemes];
      logs = [...logs, ...mySchemeRes.logs];
      errors = [...errors, ...mySchemeRes.errors];
    }

    if (source === "csrxchange" || source === "all") {
      const csrRes = await harvestCsrExchangePortal();
      schemes = [...schemes, ...csrRes.schemes];
      logs = [...logs, ...csrRes.logs];
      errors = [...errors, ...csrRes.errors];
    }

    if (source === "startupindia" || source === "all") {
      const startupRes = await harvestStartupIndiaPortal();
      schemes = [...schemes, ...startupRes.schemes];
      logs = [...logs, ...startupRes.logs];
      errors = [...errors, ...startupRes.errors];
    }

    // Persist schemes directly to Supabase server-side
    let dbPersistedCount = 0;
    const supabase = getServerSupabase();
    if (supabase && schemes.length > 0) {
      const rows = schemes.map(s => ({
        id: s.id,
        source_type: "scraped", // Ensures database check constraint passes
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

      const { data, error: upsertErr } = await supabase
        .from("schemes")
        .upsert(rows, { onConflict: "id" });

      if (upsertErr) {
        console.error("Supabase server-side upsert failed:", upsertErr);
        logs.push({
          id: `log-db-err-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: "ERROR",
          message: `Supabase persistence error: ${upsertErr.message}`
        });
      } else {
        dbPersistedCount = rows.length;
        logs.push({
          id: `log-db-ok-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: "SUCCESS",
          message: `Successfully synced & persisted ${dbPersistedCount} schemes directly to Supabase catalog.`
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source,
      totalHarvested: schemes.length,
      dbPersistedCount,
      schemes,
      logs,
      errorsCount: errors.length,
      errors
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Scraper execution failed" },
      { status: 500 }
    );
  }
}
