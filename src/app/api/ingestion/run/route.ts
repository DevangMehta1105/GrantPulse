import { NextResponse } from "next/server";
import { harvestMySchemePortal } from "@/lib/ingestion/scrapers/myscheme";
import { harvestCsrExchangePortal } from "@/lib/ingestion/scrapers/csrxchange";
import { harvestStartupIndiaPortal } from "@/lib/ingestion/scrapers/startupindia";
import { Scheme } from "@/lib/types";
import { IngestionLogEntry } from "@/lib/ingestion/types";

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

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source,
      totalHarvested: schemes.length,
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
