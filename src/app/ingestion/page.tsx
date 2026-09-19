"use client";

import React, { useState, useEffect } from "react";
import { 
  DownloadCloud, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileSpreadsheet, 
  Layers, 
  Database, 
  RefreshCw, 
  FileCode2, 
  ShieldCheck, 
  Terminal, 
  ExternalLink,
  Upload,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PortalSourceId, IngestionLogEntry } from "@/lib/ingestion/types";
import { Scheme } from "@/lib/types";
import Link from "next/link";

interface PortalCardData {
  id: PortalSourceId;
  name: string;
  portalUrl: string;
  subtitle: string;
  targetOrgs: string;
  totalAvailable: number;
  lastSync: string;
  status: "ACTIVE" | "READY" | "BUSY";
  tags: string[];
}

const PORTALS: PortalCardData[] = [
  {
    id: "myscheme",
    name: "myScheme.gov.in (Central / State MSME)",
    portalUrl: "https://www.myscheme.gov.in",
    subtitle: "Ministry of MSME, MNRE & SIDBI Grant Registry",
    targetOrgs: "Micro, Small & Medium Enterprises",
    totalAvailable: 142,
    lastSync: "35m ago",
    status: "READY",
    tags: ["MoMSME", "Capital Subsidy", "ZED 2.0", "CGTMSE"]
  },
  {
    id: "csrxchange",
    name: "CSR Exchange / Corporate Foundations",
    portalUrl: "https://www.csrxchange.gov.in",
    subtitle: "Section 135 MCA Philanthropic Project Pool",
    targetOrgs: "Trusts, Societies, Section 8 NGOs",
    totalAvailable: 86,
    lastSync: "2h ago",
    status: "READY",
    tags: ["Tata Trusts", "Infosys Foundation", "Reliance", "12A/80G"]
  },
  {
    id: "startupindia",
    name: "Startup India & BIRAC Registries",
    portalUrl: "https://www.startupindia.gov.in",
    subtitle: "DPIIT Seed Fund Scheme & Biotechnology Grants",
    targetOrgs: "DeepTech Pvt Ltd & LLPs (≤5 yrs age)",
    totalAvailable: 45,
    lastSync: "4h ago",
    status: "READY",
    tags: ["DPIIT SISFS", "BIRAC BIG", "BioTech", "Equity-Free"]
  }
];

const SAMPLE_CUSTOM_JSON = JSON.stringify([
  {
    "title": "CleanTech Microgrid Innovation Grant 2026",
    "ministryOrFunder": "Ministry of Power & IREDA",
    "description": "Capital grant up to ₹40.00 Lakhs for distributed micro-grid hardware deployment in non-electrified tribal hamlets.",
    "grantType": "Equity-free Grant",
    "maxFundingAmount": 4000000,
    "deadline": "2026-11-30",
    "sector": "CleanTech & Energy",
    "eligibility": "Turnover under 50 crore, requires GSTIN and Udyam Micro/Small tier.",
    "officialPortalUrl": "https://ireda.in/grants"
  }
], null, 2);

export default function IngestionPage() {
  const { schemes, batchAddSchemes } = useApp();
  const [runningSource, setRunningSource] = useState<PortalSourceId | "all" | null>(null);
  const [logs, setLogs] = useState<IngestionLogEntry[]>([
    {
      id: "log-init",
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "Ingestion Engine daemon initialized. AST Normalizer & Zod Validation online."
    }
  ]);
  const [harvestedSchemes, setHarvestedSchemes] = useState<Scheme[]>([]);
  const [activeTab, setActiveTab] = useState<"harvesters" | "importer" | "ledger">("harvesters");

  // File Import state
  const [fileContent, setFileContent] = useState<string>("");
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json");
  const [importStatus, setImportStatus] = useState<{
    processed?: number;
    valid?: number;
    errors?: any[];
    successMessage?: string;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const addLog = (level: "INFO" | "SUCCESS" | "WARN" | "ERROR", message: string) => {
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        level,
        message
      }
    ]);
  };

  const handleRunHarvest = async (sourceId: PortalSourceId | "all") => {
    setRunningSource(sourceId);
    addLog("INFO", `[TRIGGER] Initiating portal crawler job for source: "${sourceId.toUpperCase()}"...`);

    try {
      const res = await fetch("/api/ingestion/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: sourceId })
      });

      const data = await res.json();

      if (data.success && data.schemes) {
        // Stream logs
        if (Array.isArray(data.logs)) {
          setLogs(prev => [...prev, ...data.logs]);
        }
        setHarvestedSchemes(data.schemes);
        batchAddSchemes(data.schemes);
        addLog("SUCCESS", `[PIPELINE COMPLETE] Harvested & Zod-validated ${data.schemes.length} schemes. Injected into live GrantPulse catalog.`);
      } else {
        addLog("ERROR", `Scraper error: ${data.error || "Unknown response failure"}`);
      }
    } catch (err: any) {
      addLog("ERROR", `Network failure executing crawler endpoint: ${err.message}`);
    } finally {
      setRunningSource(null);
    }
  };

  const handleProcessImport = async () => {
    if (!fileContent.trim()) {
      addLog("WARN", "Import file buffer is empty. Please paste or load JSON/CSV payload.");
      return;
    }

    setIsImporting(true);
    addLog("INFO", `[BATCH IMPORT] Submitting payload (${importFormat.toUpperCase()}) to AST Schema validator...`);

    try {
      const res = await fetch("/api/ingestion/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: fileContent,
          format: importFormat
        })
      });

      const data = await res.json();
      setImportStatus({
        processed: data.totalRowsProcessed,
        valid: data.validSchemes?.length || 0,
        errors: data.errors,
        successMessage: data.success ? `Successfully imported ${data.validSchemes?.length} schemes!` : undefined
      });

      if (data.validSchemes && data.validSchemes.length > 0) {
        batchAddSchemes(data.validSchemes);
        setHarvestedSchemes(prev => [...data.validSchemes, ...prev]);
        addLog("SUCCESS", `[ZOD VALIDATION PASSED] ${data.validSchemes.length} schemes successfully normalized and committed.`);
      }

      if (data.errors && data.errors.length > 0) {
        addLog("WARN", `Batch import identified ${data.errors.length} schema drift warnings/rejections.`);
      }
    } catch (err: any) {
      addLog("ERROR", `Import processing error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith(".csv");
    setImportFormat(isCsv ? "csv" : "json");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      addLog("INFO", `Loaded file "${file.name}" (${Math.round(file.size / 1024)} KB). Ready for AST compilation.`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#22271F]/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A13D2C] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#A13D2C] animate-pulse"></span>
            Pillar A — Ingestion & Crawling Layer
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#22271F] tracking-tight">
            Portal Harvester & Ingestion Engine
          </h1>
          <p className="text-sm text-[#22271F]/70 mt-1 max-w-2xl">
            Automated resilient web crawlers for Indian grant registries with Zod schema validation against DOM drift, AST boolean logic synthesis, and bulk CSV/JSON batch ingestion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleRunHarvest("all")}
            disabled={runningSource !== null}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#22271F] hover:bg-[#2D4A3E] text-[#EFEAE0] text-xs font-mono font-medium rounded transition-colors disabled:opacity-50 shadow-sm"
          >
            {runningSource === "all" ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#A13D2C]" />
            ) : (
              <Play className="w-4 h-4 text-[#A13D2C]" />
            )}
            <span>RUN ALL HARVESTERS</span>
          </button>

          <Link
            href="/schemes"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E6DFD0] hover:bg-[#DDD5C5] text-[#22271F] border border-[#22271F]/20 text-xs font-mono font-medium rounded transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>VIEW CATALOG ({schemes.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#E6DFD0]/70 border border-[#22271F]/15 p-4 rounded">
          <div className="text-[11px] font-mono text-[#22271F]/60 uppercase">Indexed Schemes</div>
          <div className="text-2xl font-serif font-bold text-[#22271F] mt-1">{schemes.length}</div>
          <div className="text-[11px] text-[#2D4A3E] font-mono mt-1">Live in memory catalog</div>
        </div>

        <div className="bg-[#E6DFD0]/70 border border-[#22271F]/15 p-4 rounded">
          <div className="text-[11px] font-mono text-[#22271F]/60 uppercase">Active Scraper Portals</div>
          <div className="text-2xl font-serif font-bold text-[#22271F] mt-1">3 Portals</div>
          <div className="text-[11px] text-[#22271F]/70 font-mono mt-1">myScheme, CSR, Startup India</div>
        </div>

        <div className="bg-[#E6DFD0]/70 border border-[#22271F]/15 p-4 rounded">
          <div className="text-[11px] font-mono text-[#22271F]/60 uppercase">Zod Validation Pass Rate</div>
          <div className="text-2xl font-serif font-bold text-[#2D4A3E] mt-1">98.8%</div>
          <div className="text-[11px] text-[#22271F]/70 font-mono mt-1">Guarded against DOM drift</div>
        </div>

        <div className="bg-[#E6DFD0]/70 border border-[#22271F]/15 p-4 rounded">
          <div className="text-[11px] font-mono text-[#22271F]/60 uppercase">AST Logic Compiler</div>
          <div className="text-2xl font-serif font-bold text-[#A13D2C] mt-1">Recursive</div>
          <div className="text-[11px] text-[#22271F]/70 font-mono mt-1">AND/OR/GTE/LTE Auto-gen</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#22271F]/15">
        <button
          onClick={() => setActiveTab("harvesters")}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all ${
            activeTab === "harvesters"
              ? "border-[#A13D2C] text-[#A13D2C] bg-[#E6DFD0]/40"
              : "border-transparent text-[#22271F]/60 hover:text-[#22271F]"
          }`}
        >
          1. Portal Harvesters (3 Active)
        </button>

        <button
          onClick={() => setActiveTab("importer")}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all ${
            activeTab === "importer"
              ? "border-[#A13D2C] text-[#A13D2C] bg-[#E6DFD0]/40"
              : "border-transparent text-[#22271F]/60 hover:text-[#22271F]"
          }`}
        >
          2. Batch CSV / JSON Importer
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all ${
            activeTab === "ledger"
              ? "border-[#A13D2C] text-[#A13D2C] bg-[#E6DFD0]/40"
              : "border-transparent text-[#22271F]/60 hover:text-[#22271F]"
          }`}
        >
          3. Live Ingestion Ledger ({logs.length})
        </button>
      </div>

      {/* TAB 1: PORTAL HARVESTERS */}
      {activeTab === "harvesters" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PORTALS.map((portal) => {
              const isRunning = runningSource === portal.id || runningSource === "all";

              return (
                <div 
                  key={portal.id}
                  className="bg-[#E6DFD0] border border-[#22271F]/20 rounded p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#2D4A3E]/10 text-[#2D4A3E] border border-[#2D4A3E]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2D4A3E]"></span>
                        OPERATIONAL
                      </span>
                      <span className="text-[11px] font-mono text-[#22271F]/50">
                        Last sync: {portal.lastSync}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-[#22271F] flex items-center gap-1.5">
                        {portal.name}
                      </h3>
                      <p className="text-xs text-[#22271F]/70 mt-1">
                        {portal.subtitle}
                      </p>
                    </div>

                    <div className="p-2.5 bg-[#EFEAE0] rounded border border-[#22271F]/10 text-[11px] space-y-1">
                      <div className="flex justify-between text-[#22271F]/70 font-mono">
                        <span>Target:</span>
                        <span className="font-semibold text-[#22271F]">{portal.targetOrgs}</span>
                      </div>
                      <div className="flex justify-between text-[#22271F]/70 font-mono">
                        <span>Indexed Pool:</span>
                        <span className="font-semibold text-[#22271F]">{portal.totalAvailable} schemes</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {portal.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 bg-[#22271F]/5 text-[#22271F]/80 rounded border border-[#22271F]/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#22271F]/15 flex items-center justify-between gap-2">
                    <a
                      href={portal.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-[#22271F]/60 hover:text-[#22271F] flex items-center gap-1"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleRunHarvest(portal.id)}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22271F] hover:bg-[#2D4A3E] text-[#EFEAE0] text-xs font-mono font-medium rounded transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A13D2C]" />
                          <span>Crawling...</span>
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-3.5 h-3.5 text-[#A13D2C]" />
                          <span>Harvest Live</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Terminal Preview */}
          <div className="bg-[#181a17] text-[#EFEAE0] p-4 rounded-lg font-mono text-xs border border-[#22271F]/30 shadow-inner">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white/60">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#A13D2C]" />
                <span className="font-semibold text-white">Live Harvester Daemon Console</span>
              </div>
              <span className="text-[10px] text-emerald-400">● CRAWLER ENGINE ACTIVE</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px] pr-2">
              {logs.slice(-6).map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-white/40 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    log.level === "SUCCESS" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                    log.level === "ERROR" ? "bg-red-950 text-red-300 border border-red-800" :
                    log.level === "WARN" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                    "bg-blue-950 text-blue-300 border border-blue-800"
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-white/90">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH CSV / JSON IMPORTER */}
      {activeTab === "importer" && (
        <div className="space-y-6">
          <div className="bg-[#E6DFD0] border border-[#22271F]/20 rounded p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#22271F]/15 pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#22271F]">
                  Batch Grant Dataset Importer (Fail-Safe Seed Path)
                </h2>
                <p className="text-xs text-[#22271F]/70 mt-1">
                  Upload or paste grant scheme spreadsheets/JSON files. GrantPulse validates each entry against Zod AST schemas and auto-compiles condition rules.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImportFormat("json");
                    setFileContent(SAMPLE_CUSTOM_JSON);
                  }}
                  className="px-3 py-1.5 text-xs font-mono bg-[#EFEAE0] hover:bg-[#DDD5C5] text-[#22271F] border border-[#22271F]/20 rounded flex items-center gap-1.5"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-[#A13D2C]" />
                  <span>Load Sample JSON</span>
                </button>

                <label className="cursor-pointer px-3 py-1.5 text-xs font-mono bg-[#22271F] hover:bg-[#2D4A3E] text-[#EFEAE0] rounded flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-[#A13D2C]" />
                  <span>Choose File (.json, .csv)</span>
                  <input
                    type="file"
                    accept=".json,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            {/* Input area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#22271F]/70">
                <span>RAW SCHEME PAYLOAD BUFFER:</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={importFormat === "json"}
                      onChange={() => setImportFormat("json")}
                      className="accent-[#A13D2C]"
                    />
                    <span>JSON Format</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={importFormat === "csv"}
                      onChange={() => setImportFormat("csv")}
                      className="accent-[#A13D2C]"
                    />
                    <span>CSV Format</span>
                  </label>
                </div>
              </div>

              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder={importFormat === "json" ? "[\n  {\n    \"title\": \"Example Grant\",\n    \"maxFundingAmount\": 5000000,\n    ...\n  }\n]" : "title,ministry,maxFundingAmount,deadline,sector,eligibility\nCleanTech Grant,IREDA,4000000,2026-11-30,Energy,turnover under 50 cr"}
                rows={12}
                className="w-full p-4 bg-[#EFEAE0] text-[#22271F] font-mono text-xs border border-[#22271F]/20 rounded focus:outline-none focus:ring-1 focus:ring-[#A13D2C] leading-relaxed shadow-inner"
              />
            </div>

            {/* Import Status Alert */}
            {importStatus && (
              <div className={`p-4 rounded border text-xs font-mono ${
                importStatus.valid && importStatus.valid > 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {importStatus.valid && importStatus.valid > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>
                    Validation Diagnostic: {importStatus.valid} valid schemes generated, {importStatus.errors?.length || 0} rejected.
                  </span>
                </div>

                {importStatus.errors && importStatus.errors.length > 0 && (
                  <div className="mt-2 space-y-1 text-[11px] text-red-700 bg-white/70 p-2 rounded">
                    {importStatus.errors.map((err, idx) => (
                      <div key={idx}>
                        • Row #{err.rowNumber} [{err.field}]: {err.message} ({err.title || "Untitled"})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleProcessImport}
                disabled={isImporting || !fileContent.trim()}
                className="px-5 py-2.5 bg-[#22271F] hover:bg-[#2D4A3E] text-[#EFEAE0] text-xs font-mono font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#A13D2C]" />
                    <span>Compiling AST & Ingesting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#A13D2C]" />
                    <span>VALIDATE & COMMIT TO CATALOG</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE INGESTION LEDGER */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          <div className="bg-[#181a17] text-[#EFEAE0] p-6 rounded-lg font-mono text-xs border border-[#22271F]/30 shadow-md">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#A13D2C]" />
                <h3 className="font-semibold text-sm text-white">Full Chronological Ingestion & Scraper Audit Ledger</h3>
              </div>
              <button
                onClick={() => setLogs([{
                  id: "log-cleared",
                  timestamp: new Date().toISOString(),
                  level: "INFO",
                  message: "Log console buffer cleared."
                }])}
                className="text-[10px] text-white/50 hover:text-white underline"
              >
                Clear Console
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/40 text-[10px] whitespace-nowrap pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap ${
                    log.level === "SUCCESS" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                    log.level === "ERROR" ? "bg-red-950 text-red-300 border border-red-800" :
                    log.level === "WARN" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                    "bg-blue-950 text-blue-300 border border-blue-800"
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-white/90 leading-relaxed break-all">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Harvested Schemes Immediate Preview */}
      {harvestedSchemes.length > 0 && (
        <div className="bg-[#E6DFD0] border border-[#22271F]/20 rounded p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#22271F]/15 pb-3">
            <h3 className="font-serif font-bold text-base text-[#22271F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A13D2C]" />
              Recently Ingested Schemes ({harvestedSchemes.length})
            </h3>
            <Link 
              href="/schemes" 
              className="text-xs font-mono text-[#A13D2C] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Explore in Grant Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {harvestedSchemes.slice(0, 6).map((s) => (
              <div key={s.id} className="p-4 bg-[#EFEAE0] rounded border border-[#22271F]/15 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#22271F]/60">
                  <span className="px-1.5 py-0.5 bg-[#2D4A3E]/10 text-[#2D4A3E] rounded font-semibold">
                    {s.grantType}
                  </span>
                  <span>{s.sourcePortal}</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#22271F] line-clamp-2">
                  {s.title}
                </h4>
                <div className="text-xs font-mono font-semibold text-[#A13D2C]">
                  Max Support: ₹{(s.maxFundingAmount / 100000).toFixed(1)} Lakhs
                </div>
                <p className="text-[11px] text-[#22271F]/70 line-clamp-2">
                  {s.description}
                </p>
                <div className="pt-2 border-t border-[#22271F]/10 flex items-center justify-between text-[10px] font-mono text-[#22271F]/60">
                  <span>Docs: {s.requiredDocuments.length} required</span>
                  <Link href={`/schemes/${s.id}`} className="text-[#22271F] hover:underline font-semibold">
                    View AST &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
