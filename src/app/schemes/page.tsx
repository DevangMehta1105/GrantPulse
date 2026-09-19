"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { Search, Sparkles, Filter, ArrowUpDown, Building2, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluateSemanticFit } from "@/lib/semantic/matcher";

export default function SchemesPage() {
  const { schemes, currentOrg, getOrgEvaluation } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrantType, setSelectedGrantType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"AST" | "SEMANTIC" | "AMOUNT">("SEMANTIC");

  // Pre-calculate semantic and AST scores for all schemes
  const enrichedSchemes = schemes.map(scheme => {
    const astResult = getOrgEvaluation(scheme.id);
    const semanticResult = evaluateSemanticFit(currentOrg, scheme);
    return {
      scheme,
      astResult,
      semanticResult
    };
  });

  const filteredSchemes = enrichedSchemes.filter(({ scheme }) => {
    const matchesSearch = 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.ministryOrFunder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.sector.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedGrantType === "ALL" || scheme.grantType === selectedGrantType;
    return matchesSearch && matchesType;
  });

  // Sort
  filteredSchemes.sort((a, b) => {
    if (sortBy === "SEMANTIC") {
      return b.semanticResult.semanticScore - a.semanticResult.semanticScore;
    }
    if (sortBy === "AST") {
      return (b.astResult?.matchScore || 0) - (a.astResult?.matchScore || 0);
    }
    return b.scheme.maxFundingAmount - a.scheme.maxFundingAmount;
  });

  const grantTypes = Array.from(new Set(schemes.map(s => s.grantType)));
  const topThematicMatches = [...enrichedSchemes]
    .sort((a, b) => b.semanticResult.semanticScore - a.semanticResult.semanticScore)
    .slice(0, 2);

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[var(--stamp)] mb-1 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse"></span>
            Pillars A, B &amp; C · Hybrid Grant Discovery Engine
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
            Government &amp; Philanthropic Grant Catalog
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-3xl">
            Live hybrid matching combining <strong>Deterministic AST Boolean Rules</strong> (hard eligibility) with <strong>Semantic Vector Embeddings</strong> (thematic intent &amp; mission alignment).
          </p>
        </div>

        <div className="p-3 bg-[var(--paper-deep)] border border-[var(--rule)] rounded font-mono text-xs flex items-center gap-3">
          <Building2 className="w-4 h-4 text-[var(--stamp)]" />
          <div>
            <div className="text-[10px] text-[var(--ink-soft)] uppercase">Evaluating For:</div>
            <div className="font-bold text-[var(--ink)] truncate max-w-[220px]">{currentOrg.name}</div>
          </div>
        </div>
      </div>

      {/* Thematic Discovery Callout Drawer */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--rule)]/60 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--ink)]">
            <Sparkles className="w-4 h-4 text-[var(--stamp)]" />
            <span>THEMATIC INTENT DISCOVERY · Top Soft-Fit Grants for &quot;{currentOrg.sector}&quot;</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--verified)] bg-[var(--verified-bg)] px-2 py-0.5 rounded border border-[var(--verified)]/30 font-bold">
            Vector Cosine Similarity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topThematicMatches.map(({ scheme, semanticResult, astResult }) => (
            <div key={scheme.id} className="p-3.5 bg-[var(--paper)] rounded border border-[var(--rule)] flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="font-bold text-[var(--stamp)]">{scheme.sourcePortal}</span>
                  <span className="font-bold px-1.5 py-0.2 rounded bg-[#3F6B52]/10 text-[var(--verified)]">
                    🎯 {semanticResult.semanticScore}% Intent Fit
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[var(--ink)] line-clamp-1">
                  {scheme.title}
                </h4>
                <p className="text-[11px] text-[var(--ink-soft)] line-clamp-2 mt-1">
                  {semanticResult.intentExplanation}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--rule)]/60 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[var(--ink)]">{formatINR(scheme.maxFundingAmount, true)}</span>
                <Link
                  href={`/schemes/${scheme.id}`}
                  className="text-[var(--stamp)] font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Inspect AST &amp; Intent</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--paper-deep)] p-4 rounded border border-[var(--rule)] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes by title, sector, keyword or ministry..."
            className="w-full bg-[var(--paper)] border border-[var(--rule)] pl-9 pr-3 py-2 text-xs font-mono text-[var(--ink)] placeholder-[var(--ink-soft)]/60 rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Grant Type Filter */}
          <select
            value={selectedGrantType}
            onChange={(e) => setSelectedGrantType(e.target.value)}
            className="bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] cursor-pointer"
          >
            <option value="ALL">All Grant Types</option>
            {grantTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Sort By Toggle */}
          <div className="flex items-center gap-1 bg-[var(--paper)] border border-[var(--rule)] p-1 rounded font-mono text-[11px]">
            <button
              onClick={() => setSortBy("SEMANTIC")}
              className={cn(
                "px-2.5 py-1 rounded transition-colors font-medium",
                sortBy === "SEMANTIC" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              )}
            >
              🎯 Intent Fit
            </button>
            <button
              onClick={() => setSortBy("AST")}
              className={cn(
                "px-2.5 py-1 rounded transition-colors font-medium",
                sortBy === "AST" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              )}
            >
              ⚡ AST Match
            </button>
            <button
              onClick={() => setSortBy("AMOUNT")}
              className={cn(
                "px-2.5 py-1 rounded transition-colors font-medium",
                sortBy === "AMOUNT" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              )}
            >
              ₹ Funding Cap
            </button>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map(({ scheme, astResult, semanticResult }) => {
          return (
            <div
              key={scheme.id}
              className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-5 flex flex-col justify-between space-y-4 hover:border-[var(--ink)] hover:shadow-md transition-all relative"
            >
              <div className="space-y-3">
                {/* Source & Tags */}
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--ink-soft)]">
                  <span className="font-semibold">{scheme.sourcePortal}</span>
                  <span className="uppercase text-[var(--stamp)] font-bold bg-[var(--paper)] px-1.5 py-0.2 rounded border border-[var(--rule)]">
                    {scheme.grantType}
                  </span>
                </div>

                {/* Title & Ministry */}
                <div>
                  <h3 className="text-base font-serif font-bold text-[var(--ink)] leading-snug line-clamp-2">
                    {scheme.title}
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)] font-mono mt-0.5">
                    {scheme.ministryOrFunder}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--ink-soft)] line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>

                {/* Thematic Overlap Keywords */}
                {semanticResult.thematicOverlap.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {semanticResult.thematicOverlap.map(kw => (
                      <span key={kw} className="text-[10px] font-mono bg-[#E4DCCB] text-[var(--ink)] px-1.5 py-0.2 rounded border border-[var(--rule)]/60 font-semibold">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Financials & Action Footer */}
              <div className="pt-3 border-t border-[var(--rule)] space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--ink-soft)] uppercase block">Max Cap:</span>
                    <span className="font-bold text-[var(--ink)] text-sm">
                      {formatINR(scheme.maxFundingAmount, true)}
                    </span>
                  </div>

                  {/* Dual Badges: AST Rule Match & Semantic Intent Fit */}
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      astResult?.isEligible ? "bg-[var(--verified-bg)] text-[var(--verified)]" : "bg-[var(--pending-bg)] text-[var(--pending)]"
                    )}>
                      {astResult?.isEligible ? "✓ AST Eligible" : `${astResult?.matchScore || 0}% AST Fit`}
                    </span>
                    <span className="text-[10px] font-bold text-[#3F6B52]">
                      🎯 {semanticResult.semanticScore}% Intent Fit
                    </span>
                  </div>
                </div>

                <Link
                  href={`/schemes/${scheme.id}`}
                  className="w-full py-2 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] text-xs font-mono font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Inspect AST &amp; Co-Pilot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
