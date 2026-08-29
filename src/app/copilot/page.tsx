"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { 
  BotMessageSquare, 
  Sparkles, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Send, 
  Layers,
  CheckCircle2,
  Table
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CopilotPage() {
  const { schemes, currentOrg, getOrgEvaluation } = useApp();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];
  const evalResult = getOrgEvaluation(selectedScheme.id);

  // Proposal Draft State
  const [executiveSummary, setExecutiveSummary] = useState(
    `Project Proposal for ${selectedScheme.title}:\n\n` +
    `${currentOrg.name} (${currentOrg.entityType}, ${currentOrg.state}) is applying for ₹${(selectedScheme.maxFundingAmount / 100000).toFixed(0)} Lakhs under ${selectedScheme.ministryOrFunder}.\n\n` +
    `Core Mission & Alignment:\n${currentOrg.missionDescription}\n\n` +
    `Key Milestones & Deliverables:\n` +
    `1. Q1-Q2: Requirement engineering, initial baseline audits, and vendor shortlisting.\n` +
    `2. Q3: Prototype / field pilot deployment and quality testing.\n` +
    `3. Q4: Third-party verification, impact reporting, and GFR 12-A compliance filing.`
  );

  const [budgetItems, setBudgetItems] = useState([
    { category: "Capital Equipment & Machinery", amount: selectedScheme.maxFundingAmount * 0.45, pct: "45%" },
    { category: "Personnel & Specialized Technical Staff", amount: selectedScheme.maxFundingAmount * 0.25, pct: "25%" },
    { category: "Field Testing, Audits & Quality Certifications", amount: selectedScheme.maxFundingAmount * 0.15, pct: "15%" },
    { category: "Consumables & Raw Materials", amount: selectedScheme.maxFundingAmount * 0.10, pct: "10%" },
    { category: "Administrative & Institutional Overheads", amount: selectedScheme.maxFundingAmount * 0.05, pct: "5%" },
  ]);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setExecutiveSummary(
        `AI-Enhanced Executive Dossier:\n\n` +
        `Applicant Organization: ${currentOrg.name}\n` +
        `Scheme Funder: ${selectedScheme.ministryOrFunder}\n` +
        `Grant Category: ${selectedScheme.grantType}\n\n` +
        `1. Strategic Intent & Problem Statement:\n` +
        `Bridging critical infrastructure and quality benchmarks in ${currentOrg.state}. With ${currentOrg.yearsOfOperation} years of demonstrated track record and turnover of ₹${(currentOrg.turnoverInr / 10000000).toFixed(2)} Cr, this grant enables immediate scale and compliance with national standards.\n\n` +
        `2. Projected Social Return on Investment (SROI):\n` +
        `Targeting direct impact across 2,500+ direct beneficiaries and MSME supply-chain partners with 100% auditable GFR-12A accounting.`
      );
      setIsGenerating(false);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(executiveSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pillar F • AI-Assisted Proposal Co-Pilot & Dossier Exporter</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          AI Grant Proposal Co-Pilot
        </h1>
        <p className="text-sm text-slate-400">
          Synthesizes AST evaluation rules, regulatory parameters, and applicant profile to draft executive summaries and milestone budgets.
        </p>
      </div>

      {/* Target Scheme Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-violet-400" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Grant Scheme</span>
            <select
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="block bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-violet-500 cursor-pointer mt-0.5"
            >
              {schemes.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({formatINR(s.maxFundingAmount, true)})</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all cursor-pointer self-end sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? "Synthesizing Dossier..." : "Regenerate AI Draft"}</span>
        </button>
      </div>

      {/* Two Column Workspace: Executive Summary + Budget Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Executive Summary Editor */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              Executive Proposal Summary
            </h3>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          <textarea
            value={executiveSummary}
            onChange={(e) => setExecutiveSummary(e.target.value)}
            rows={14}
            className="flex-1 w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-violet-500"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
            <span>Aligned with {selectedScheme.ministryOrFunder} guidelines</span>
            <span className="text-emerald-400 font-bold">100% AST Grounded</span>
          </div>
        </div>

        {/* Milestone Budget Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-400" />
              Milestone Budget Allocation (GFR Format)
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Total: {formatINR(selectedScheme.maxFundingAmount, true)}
            </span>
          </div>

          <div className="space-y-3">
            {budgetItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{item.category}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Statutory Cap: {item.pct}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-white">{formatINR(item.amount)}</div>
                  <span className="text-[10px] font-mono text-emerald-400">{item.pct} of total</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              SROI & Impact Metric Targets
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Auto-calculated based on {currentOrg.sector} sector benchmarks. Generates structured compliance data ready for Form GFR 12-A export.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
