"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { Copy, Check, Sparkles } from "lucide-react";

export default function CopilotPage() {
  const { schemes, currentOrg } = useApp();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];

  const [executiveSummary, setExecutiveSummary] = useState(
    `Project Proposal for ${selectedScheme.title}:\n\n` +
    `${currentOrg.name} (${currentOrg.entityType}, ${currentOrg.state}) is applying for ₹${(selectedScheme.maxFundingAmount / 100000).toFixed(0)} Lakhs under ${selectedScheme.ministryOrFunder}.\n\n` +
    `Core Mission & Alignment:\n${currentOrg.missionDescription}\n\n` +
    `Key Milestones & Deliverables:\n` +
    `1. Q1-Q2: Baseline audits, technical specifications, and vendor shortlisting.\n` +
    `2. Q3: Prototype / pilot deployment and quality testing.\n` +
    `3. Q4: Third-party verification, impact reporting, and GFR 12-A compliance filing.`
  );

  const budgetItems = [
    { category: "Capital Equipment & Machinery", amount: selectedScheme.maxFundingAmount * 0.45, pct: "45%" },
    { category: "Personnel & Technical Staff", amount: selectedScheme.maxFundingAmount * 0.25, pct: "25%" },
    { category: "Audits & Quality Certifications", amount: selectedScheme.maxFundingAmount * 0.15, pct: "15%" },
    { category: "Consumables & Supplies", amount: selectedScheme.maxFundingAmount * 0.10, pct: "10%" },
    { category: "Administrative Overheads", amount: selectedScheme.maxFundingAmount * 0.05, pct: "5%" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(executiveSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-lg font-bold text-[#ededef]">AI Proposal Co-Pilot</h1>
        <p className="text-xs text-[#8b8d98]">
          Generate AST-grounded proposal drafts and GFR milestone budget allocations.
        </p>
      </div>

      <div className="bg-[#14151a] border border-[#232530] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[#5e6170] font-mono uppercase text-[10px]">Target Scheme:</span>
          <select
            value={selectedSchemeId}
            onChange={(e) => setSelectedSchemeId(e.target.value)}
            className="bg-[#111216] border border-[#232530] rounded-md px-2.5 py-1 text-xs text-[#ededef] focus:outline-none focus:border-[#373a4a] cursor-pointer"
          >
            {schemes.map(s => (
              <option key={s.id} value={s.id}>{s.title} ({formatINR(s.maxFundingAmount, true)})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1 rounded-md bg-[#1a1c24] hover:bg-[#20222c] text-[#ededef] border border-[#232530] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          {copied ? <Check className="w-3 h-3 text-[#2eb88a]" /> : <Copy className="w-3 h-3 text-[#8b8d98]" />}
          <span>{copied ? "Copied" : "Copy Draft"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Executive Summary */}
        <div className="lg:col-span-7 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-3">
          <div className="text-[10px] font-mono text-[#5e6170] uppercase">
            Executive Proposal Draft
          </div>
          <textarea
            value={executiveSummary}
            onChange={(e) => setExecutiveSummary(e.target.value)}
            rows={12}
            className="w-full bg-[#111216] border border-[#232530] rounded-md p-3 text-xs text-[#ededef] font-mono leading-relaxed focus:outline-none focus:border-[#373a4a]"
          />
        </div>

        {/* Budget Table */}
        <div className="lg:col-span-5 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#5e6170] uppercase border-b border-[#1e2029] pb-2">
            <span>GFR Milestone Budget</span>
            <span className="text-[#ededef] font-bold">{formatINR(selectedScheme.maxFundingAmount, true)}</span>
          </div>

          <div className="space-y-2">
            {budgetItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#111216] border border-[#1e2029] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-medium text-[#ededef]">{item.category}</div>
                  <div className="text-[10px] text-[#5e6170] font-mono">Cap: {item.pct}</div>
                </div>
                <div className="font-mono font-semibold text-[#ededef]">
                  {formatINR(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
