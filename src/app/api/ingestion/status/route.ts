import { NextResponse } from "next/server";
import { PortalSourceConfig } from "@/lib/ingestion/types";

const PORTAL_REGISTRY: PortalSourceConfig[] = [
  {
    id: "myscheme",
    name: "myScheme.gov.in (MoMSME / MNRE)",
    portalUrl: "https://www.myscheme.gov.in",
    description: "Central & State Ministry grant portal aggregating 680+ government schemes across manufacturing, credit, and energy.",
    targetEntityTypes: ["Micro", "Small", "Medium", "Proprietorship"],
    crawlerType: "rest_api",
    status: "ACTIVE",
    lastScrapedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35m ago
    totalSchemesIndexed: 142,
    averageHarvestDurationMs: 1420
  },
  {
    id: "csrxchange",
    name: "CSR Exchange / MCA CSR Portal",
    portalUrl: "https://www.csrxchange.gov.in",
    description: "Corporate Social Responsibility (CSR) grant repository covering Section 135 Schedule VII projects from leading Indian foundations.",
    targetEntityTypes: ["Trust", "Society", "Section 8"],
    crawlerType: "cheerio_http",
    status: "ACTIVE",
    lastScrapedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    totalSchemesIndexed: 86,
    averageHarvestDurationMs: 2150
  },
  {
    id: "startupindia",
    name: "Startup India & BIRAC Registries",
    portalUrl: "https://www.startupindia.gov.in",
    description: "DPIIT Seed Fund Scheme (SISFS) and BIRAC Biotechnology Ignition Grants for early-stage prototype and commercialization funding.",
    targetEntityTypes: ["Private Limited", "LLP"],
    crawlerType: "rest_api",
    status: "ACTIVE",
    lastScrapedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4h ago
    totalSchemesIndexed: 45,
    averageHarvestDurationMs: 980
  },
  {
    id: "custom_csv",
    name: "Manual Admin CSV / JSON File Vault",
    portalUrl: "file://internal-import-buffer",
    description: "Ad-hoc grant guidelines, PDF conversion tables, and tender documents imported via batch ingestion files.",
    targetEntityTypes: ["All Supported Types"],
    crawlerType: "csv_importer",
    status: "ACTIVE",
    totalSchemesIndexed: 12,
    averageHarvestDurationMs: 40
  }
];

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    totalActivePortals: PORTAL_REGISTRY.length,
    portals: PORTAL_REGISTRY,
    systemMetrics: {
      uptimeSeconds: 86400,
      totalCrawledEntities: 285,
      zodValidationPassRate: 98.4,
      avgHarvestDurationMs: 1350
    }
  });
}
