import { Scheme, AstNode, RequiredDocumentDef, GrantType } from "../types";

export type PortalSourceId = "myscheme" | "csrxchange" | "startupindia" | "custom_csv";

export interface PortalSourceConfig {
  id: PortalSourceId;
  name: string;
  portalUrl: string;
  description: string;
  targetEntityTypes: string[];
  crawlerType: "cheerio_http" | "rest_api" | "csv_importer";
  status: "ACTIVE" | "MAINTENANCE" | "DEGRADED";
  lastScrapedAt?: string;
  totalSchemesIndexed: number;
  averageHarvestDurationMs: number;
}

export type IngestionJobStatus = "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";

export interface IngestionLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR";
  message: string;
  sourceId?: PortalSourceId;
  details?: Record<string, any>;
}

export interface IngestionJob {
  jobId: string;
  sourceId: PortalSourceId;
  status: IngestionJobStatus;
  startedAt: string;
  completedAt?: string;
  itemsFound: number;
  itemsParsed: number;
  itemsValidated: number;
  itemsRejected: number;
  logs: IngestionLogEntry[];
  resultSchemes: Scheme[];
  validationErrors?: Array<{
    itemIndex: number;
    title?: string;
    field: string;
    error: string;
  }>;
}

export interface RawScrapedScheme {
  rawId?: string;
  portalSource: string;
  title: string;
  ministryOrFunder: string;
  description: string;
  grantTypeStr: string;
  maxFundingRaw: string | number;
  deadlineRaw?: string;
  eligibilityText?: string;
  criteriaObj?: Record<string, any>;
  documentsRequiredRaw?: string[] | string;
  officialLink?: string;
  sectorTag?: string;
}

export interface IngestionReport {
  timestamp: string;
  sourcesProcessed: PortalSourceId[];
  totalHarvested: number;
  totalValid: number;
  totalErrors: number;
  schemes: Scheme[];
  logs: IngestionLogEntry[];
}
