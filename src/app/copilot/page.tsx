"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { 
  BotMessageSquare, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Table, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  Layers, 
  Printer, 
  X,
  FileCheck2,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProposalTone, GrantDossier } from "@/lib/copilot/types";
import { synthesizeGrantDossier } from "@/lib/copilot/synthesizer";

export default function CopilotPage() {
  const { schemes, currentOrg } = useApp();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0]?.id || "");
  const [tone, setTone] = useState<ProposalTone>("formal_gov");
  const [activeTab, setActiveTab] = useState<"summary" | "milestones" | "budget" | "sroi" | "annexure">("summary");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];

  const [dossier, setDossier] = useState<GrantDossier>(() => 
    synthesizeGrantDossier(currentOrg, selectedScheme, tone)
  );

  // Re-synthesize when scheme, org, or tone changes
  useEffect(() => {
    if (selectedScheme) {
      setDossier(synthesizeGrantDossier(currentOrg, selectedScheme, tone));
    }
  }, [selectedSchemeId, currentOrg.id, tone]);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDossier(synthesizeGrantDossier(currentOrg, selectedScheme, tone));
      setIsGenerating(false);
    }, 400);
  };

  const handleCopySection = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[var(--stamp)] mb-1 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse"></span>
            Pillar F · AI Proposal Co-Pilot &amp; Dossier Exporter
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
            Grant Proposal Synthesis Co-Pilot
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-3xl">
            Auto-synthesize AST-grounded grant proposals, GFR 12-A milestone budget tables, and SROI impact metrics into a downloadable ready-to-file application dossier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPdfPreview(true)}
            className="px-4 py-2.5 bg-[var(--stamp)] hover:bg-[#852F20] text-white text-xs font-mono font-bold rounded flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT READY-TO-FILE DOSSIER (PDF)</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Scheme Selector + Tone Presets */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        {/* Scheme Selector */}
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-mono text-[var(--ink-soft)] uppercase font-semibold whitespace-nowrap">
            Target Scheme:
          </span>
          <select
            value={selectedSchemeId}
            onChange={(e) => setSelectedSchemeId(e.target.value)}
            className="bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-serif font-bold text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] cursor-pointer max-w-md truncate"
          >
            {schemes.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} — Max {formatINR(s.maxFundingAmount, true)}
              </option>
            ))}
          </select>
        </div>

        {/* Tone Adjuster & Action */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-[var(--ink-soft)] uppercase font-semibold">
            Synthesis Tone:
          </span>
          <div className="flex items-center gap-1 bg-[var(--paper)] border border-[var(--rule)] p-1 rounded font-mono text-[11px]">
            <button
              onClick={() => setTone("formal_gov")}
              className={cn(
                "px-2.5 py-1 rounded font-semibold transition-colors",
                tone === "formal_gov" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              )}
            >
              🏛️ MoMSME Formal
            </button>
            <button
              onClick={() => setTone("deeptech_rd")}
              className={cn(
                "px-2.5 py-1 rounded font-semibold transition-colors",
                tone === "deeptech_rd" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              )}
            >
              🔬 DeepTech R&amp;D
            </button>
            <button
              onClick={() => setTone("csr_philanthropic")}
              className={cn(
                "px-2.5 py-1 rounded font-semibold transition-colors",
                tone === "csr_philanthropic" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              )}
            >
              🌱 CSR Philanthropic
            </button>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="px-3 py-2 bg-[var(--paper)] hover:bg-[#E4DCCB] text-[var(--ink)] border border-[var(--rule)] text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-[var(--stamp)]", isGenerating && "animate-spin")} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Workspace */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 space-y-6 shadow-xs">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--rule)] pb-1 overflow-x-auto no-scrollbar font-mono text-xs">
          <button
            onClick={() => setActiveTab("summary")}
            className={cn(
              "px-4 py-2 font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
              activeTab === "summary"
                ? "border-[var(--stamp)] text-[var(--stamp)] bg-[var(--paper)]"
                : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
            )}
          >
            1. Executive Summary &amp; Narrative
          </button>

          <button
            onClick={() => setActiveTab("milestones")}
            className={cn(
              "px-4 py-2 font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
              activeTab === "milestones"
                ? "border-[var(--stamp)] text-[var(--stamp)] bg-[var(--paper)]"
                : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
            )}
          >
            2. Technical Workplan (3 Phases)
          </button>

          <button
            onClick={() => setActiveTab("budget")}
            className={cn(
              "px-4 py-2 font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
              activeTab === "budget"
                ? "border-[var(--stamp)] text-[var(--stamp)] bg-[var(--paper)]"
                : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
            )}
          >
            3. GFR 12-A Budget Table ({formatINR(dossier.totalBudgetInr, true)})
          </button>

          <button
            onClick={() => setActiveTab("sroi")}
            className={cn(
              "px-4 py-2 font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
              activeTab === "sroi"
                ? "border-[var(--stamp)] text-[var(--stamp)] bg-[var(--paper)]"
                : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
            )}
          >
            4. SROI &amp; ESG Impact (Ratio: {dossier.sroiRatio}x)
          </button>

          <button
            onClick={() => setActiveTab("annexure")}
            className={cn(
              "px-4 py-2 font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
              activeTab === "annexure"
                ? "border-[var(--stamp)] text-[var(--stamp)] bg-[var(--paper)]"
                : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
            )}
          >
            5. Statutory Annexure
          </button>
        </div>

        {/* TAB 1: EXECUTIVE SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[var(--ink-soft)] uppercase">
                Section I — Problem Statement &amp; Grant Justification:
              </span>
              <button
                onClick={() => handleCopySection(dossier.executiveSummary + "\n\n" + dossier.problemStatement + "\n\n" + dossier.proposedSolution)}
                className="px-3 py-1 bg-[var(--paper)] hover:bg-[#E4DCCB] text-[var(--ink)] border border-[var(--rule)] text-xs font-mono font-bold rounded flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--verified)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--stamp)]" />}
                <span>{copied ? "Copied" : "Copy Section"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-mono text-[11px] font-bold text-[var(--ink)] uppercase">
                  Executive Summary:
                </label>
                <textarea
                  value={dossier.executiveSummary}
                  onChange={(e) => setDossier({ ...dossier, executiveSummary: e.target.value })}
                  rows={10}
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] p-4 text-xs font-mono text-[var(--ink)] leading-relaxed rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] font-bold text-[var(--ink)] uppercase">
                    Problem Statement:
                  </label>
                  <textarea
                    value={dossier.problemStatement}
                    onChange={(e) => setDossier({ ...dossier, problemStatement: e.target.value })}
                    rows={4}
                    className="w-full bg-[var(--paper)] border border-[var(--rule)] p-3 text-xs font-mono text-[var(--ink)] leading-relaxed rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] font-bold text-[var(--ink)] uppercase">
                    Proposed Solution &amp; Methodology:
                  </label>
                  <textarea
                    value={dossier.proposedSolution}
                    onChange={(e) => setDossier({ ...dossier, proposedSolution: e.target.value })}
                    rows={4}
                    className="w-full bg-[var(--paper)] border border-[var(--rule)] p-3 text-xs font-mono text-[var(--ink)] leading-relaxed rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TECHNICAL WORKPLAN & MILESTONES */}
        {activeTab === "milestones" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[var(--ink-soft)] uppercase">
                Section II — 3-Phase Execution Workplan &amp; Deliverables:
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dossier.milestones.map((m, idx) => (
                <div key={idx} className="p-4 bg-[var(--paper)] border border-[var(--rule)] rounded space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[var(--rule)]/60 pb-2">
                    <span className="font-mono text-[10px] font-bold text-[var(--stamp)] uppercase">{m.quarter}</span>
                    <span className="font-mono text-xs font-bold text-[var(--ink)]">{formatINR(m.budgetAllocationInr, true)}</span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[var(--ink)]">
                    {m.phase}
                  </h4>
                  <div className="text-xs font-mono text-[var(--ink-soft)] font-semibold">{m.title}</div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-[var(--ink-soft)] uppercase font-bold">Key Deliverables:</span>
                    <ul className="space-y-1 text-[11px] text-[var(--ink)]">
                      {m.deliverables.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5">
                          <span className="text-[var(--stamp)] font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[var(--rule)]/60 text-[10px] font-mono text-[var(--ink-soft)]">
                    <span className="font-bold text-[var(--ink)]">Acceptance: </span>
                    {m.acceptanceCriteria}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GFR 12-A BUDGET TABLE */}
        {activeTab === "budget" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[var(--ink-soft)] uppercase">
                Section III — Itemized GFR 12-A Compliant Budget Matrix:
              </span>
              <span className="font-mono text-xs font-bold text-[var(--stamp)] bg-[var(--paper)] px-3 py-1 rounded border border-[var(--rule)]">
                Total Grant Ask: {formatINR(dossier.totalBudgetInr, true)}
              </span>
            </div>

            <div className="overflow-x-auto border border-[var(--rule)] rounded bg-[var(--paper)]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--paper-deep)] border-b border-[var(--rule)] text-[10px] uppercase text-[var(--ink-soft)] font-bold">
                    <th className="p-3">GFR Code</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Sub-item Description</th>
                    <th className="p-3 text-right">Allocation (INR)</th>
                    <th className="p-3 text-right">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {dossier.budgetTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[var(--paper-deep)]/40 transition-colors">
                      <td className="p-3 font-bold text-[var(--stamp)]">{row.gfrCode}</td>
                      <td className="p-3 font-bold text-[var(--ink)]">{row.category}</td>
                      <td className="p-3 text-[11px] text-[var(--ink-soft)]">{row.subItem}</td>
                      <td className="p-3 text-right font-bold text-[var(--ink)]">{formatINR(row.amountInr)}</td>
                      <td className="p-3 text-right font-bold text-[var(--verified)]">{row.percentage}%</td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--paper-deep)] font-bold text-[var(--ink)] border-t-2 border-[var(--rule)]">
                    <td colSpan={3} className="p-3 text-right uppercase">Total Consolidated Project Budget:</td>
                    <td className="p-3 text-right text-[var(--stamp)] text-sm">{formatINR(dossier.totalBudgetInr)}</td>
                    <td className="p-3 text-right text-[var(--verified)]">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SROI & ESG IMPACT */}
        {activeTab === "sroi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[var(--ink-soft)] uppercase">
                Section IV — Social Return on Investment (SROI) &amp; ESG Metrics:
              </span>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[var(--ink-soft)]">Calculated SROI Multiplier:</span>
                <span className="px-2 py-0.5 bg-[var(--verified-bg)] text-[var(--verified)] font-bold rounded border border-[var(--verified)]/30">
                  ₹{dossier.sroiRatio} Return per ₹1 Grant
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dossier.sroiMetrics.map((metric, idx) => (
                <div key={idx} className="p-4 bg-[var(--paper)] border border-[var(--rule)] rounded space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[var(--rule)]/60 pb-2">
                    <span className="font-mono text-[10px] font-bold text-[var(--verified)] uppercase bg-[var(--verified-bg)] px-2 py-0.5 rounded border border-[var(--verified)]/20">
                      {metric.esgPillar} Pillar
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--stamp)]">
                      Value: {formatINR(metric.monetizedImpactInr, true)}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[var(--ink)]">
                    {metric.metric}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="p-2 bg-[var(--paper-deep)] rounded border border-[var(--rule)]/60">
                      <span className="text-[10px] text-[var(--ink-soft)] uppercase block">Baseline (Current):</span>
                      <span className="font-bold text-[var(--ink)]">{metric.baseline}</span>
                    </div>
                    <div className="p-2 bg-[var(--verified-bg)]/40 rounded border border-[var(--verified)]/30">
                      <span className="text-[10px] text-[var(--verified)] uppercase block font-bold">24-Month Target:</span>
                      <span className="font-bold text-[var(--verified)]">{metric.target24Months}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: STATUTORY ANNEXURE */}
        {activeTab === "annexure" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[var(--ink-soft)] uppercase">
                Section V — Statutory Compliance &amp; Certificate Declaration:
              </span>
            </div>

            <div className="p-5 bg-[var(--paper)] border border-[var(--rule)] rounded space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[var(--paper-deep)] rounded border border-[var(--rule)]/60 text-[11px]">
                <div>
                  <span className="text-[var(--ink-soft)] block text-[10px]">LEGAL ENTITY</span>
                  <span className="font-bold text-[var(--ink)]">{dossier.applicant.name}</span>
                </div>
                <div>
                  <span className="text-[var(--ink-soft)] block text-[10px]">PAN</span>
                  <span className="font-bold text-[var(--ink)]">{dossier.applicant.pan}</span>
                </div>
                <div>
                  <span className="text-[var(--ink-soft)] block text-[10px]">GSTIN</span>
                  <span className="font-bold text-[var(--ink)]">{dossier.applicant.gstin || "29AABCV9821K1Z3"}</span>
                </div>
                <div>
                  <span className="text-[var(--ink-soft)] block text-[10px]">UDYAM REGISTRATION</span>
                  <span className="font-bold text-[var(--ink)]">{dossier.applicant.udyamTier} MSME</span>
                </div>
                <div>
                  <span className="text-[var(--ink-soft)] block text-[10px]">12A / 80G URN</span>
                  <span className="font-bold text-[var(--ink)]">{dossier.applicant.reg80G || "AABTA4921KG20218"}</span>
                </div>
                <div>
                  <span className="text-[var(--ink-soft)] block text-[10px]">MCA CSR-1 NO</span>
                  <span className="font-bold text-[var(--ink)]">{dossier.applicant.csr1Number || "CSR00049281"}</span>
                </div>
              </div>

              <textarea
                value={dossier.statutoryDeclaration}
                onChange={(e) => setDossier({ ...dossier, statutoryDeclaration: e.target.value })}
                rows={8}
                className="w-full bg-[var(--paper-deep)] border border-[var(--rule)] p-4 text-xs font-mono text-[var(--ink)] leading-relaxed rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
              />
            </div>
          </div>
        )}
      </div>

      {/* PDF DOSSIER PRINT PREVIEW MODAL */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border border-[var(--ink)] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl rounded overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--rule)] flex items-center justify-between bg-[var(--paper-deep)]">
              <div className="flex items-center gap-2.5">
                <span className="seal">GP</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-[var(--ink)]">
                    Official Ready-to-File Grant Application Dossier
                  </h3>
                  <div className="font-mono text-[10px] text-[var(--ink-soft)]">Ref: {dossier.dossierId} · Generated {formatDate(dossier.generatedAt)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPdf}
                  className="px-3 py-1.5 bg-[var(--ink)] hover:bg-[#2D4A3E] text-white text-xs font-mono font-bold rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[var(--stamp)]" />
                  <span>Print to PDF</span>
                </button>

                <button 
                  onClick={() => setShowPdfPreview(false)} 
                  className="text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Paper Document Container */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white text-black font-serif leading-relaxed">
              
              {/* Document Header with Seal */}
              <div className="border-b-2 border-black pb-4 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">
                    GOVERNMENT OF INDIA · GRANT APPLICATION DOSSIER
                  </div>
                  <h2 className="text-2xl font-bold mt-1">
                    {dossier.schemeTitle}
                  </h2>
                  <div className="font-mono text-xs text-neutral-700 mt-0.5">
                    Funder: {dossier.funderName}
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] border border-black p-2 bg-neutral-50">
                  <div>DOSSIER ID: {dossier.dossierId}</div>
                  <div>GRANT ASK: {formatINR(dossier.requestedAmountInr)}</div>
                </div>
              </div>

              {/* Section 1: Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono border-b border-neutral-300 pb-1">
                  1. Executive Summary &amp; Project Abstract
                </h3>
                <p className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-neutral-800">
                  {dossier.executiveSummary}
                </p>
              </div>

              {/* Section 2: GFR 12-A Budget */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono border-b border-neutral-300 pb-1">
                  2. General Financial Rules (GFR 12-A) Itemized Budget
                </h3>
                <table className="w-full text-left font-mono text-[11px] border border-black">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black">
                      <th className="p-2">Code</th>
                      <th className="p-2">Category</th>
                      <th className="p-2 text-right">Amount (INR)</th>
                      <th className="p-2 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossier.budgetTable.map((b, idx) => (
                      <tr key={idx} className="border-b border-neutral-200">
                        <td className="p-2 font-bold">{b.gfrCode}</td>
                        <td className="p-2">{b.category}</td>
                        <td className="p-2 text-right font-bold">{formatINR(b.amountInr)}</td>
                        <td className="p-2 text-right">{b.percentage}%</td>
                      </tr>
                    ))}
                    <tr className="bg-neutral-100 font-bold border-t border-black">
                      <td colSpan={2} className="p-2 text-right">TOTAL SANCTION ASK:</td>
                      <td className="p-2 text-right">{formatINR(dossier.totalBudgetInr)}</td>
                      <td className="p-2 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3: SROI Impact */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono border-b border-neutral-300 pb-1">
                  3. Social Return on Investment (SROI: ₹{dossier.sroiRatio} per ₹1 Grant)
                </h3>
                <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                  {dossier.sroiMetrics.map((m, idx) => (
                    <div key={idx} className="border border-neutral-300 p-2.5 bg-neutral-50">
                      <div className="font-bold">{m.metric}</div>
                      <div className="text-[10px] text-neutral-600 mt-1">24-Month Target: {m.target24Months}</div>
                      <div className="text-[10px] font-bold text-emerald-800">Monetized Value: {formatINR(m.monetizedImpactInr)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Signature & Seal Block */}
              <div className="pt-6 border-t-2 border-black flex items-end justify-between font-mono text-[11px]">
                <div className="space-y-1">
                  <div>APPLICANT: <strong>{dossier.applicant.name}</strong></div>
                  <div>STATUTORY PAN: {dossier.applicant.pan}</div>
                  <div>UDYAM / REG NO: {dossier.applicant.gstin || "29AABCV9821K1Z3"}</div>
                </div>

                <div className="text-center space-y-12">
                  <div className="border-b border-black w-48 mx-auto"></div>
                  <div>Authorized Signatory &amp; Official Seal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
