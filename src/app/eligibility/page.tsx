"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { ArrowRight, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EligibilityPage() {
  const { schemes, currentOrg, getOrgEvaluation } = useApp();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");

  const activeSchemeId = selectedSchemeId || (schemes.length > 0 ? schemes[0].id : "");
  const selectedScheme = schemes.find(s => s.id === activeSchemeId);
  const evalResult = selectedScheme ? getOrgEvaluation(selectedScheme.id) : null;

  return (
    <div className="wrap py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--rule)] pb-6">
        <div className="font-mono text-[12px] tracking-wider uppercase text-[var(--stamp)] mb-2">
          Eligibility Engine · Explainable AST Trace
        </div>
        <h1 className="text-3xl md:text-4xl font-medium serif text-[var(--ink)] tracking-tight">
          How Matching Works: Rule Evaluation
        </h1>
        <p className="text-[15px] text-[var(--ink-soft)] mt-2 measure leading-relaxed">
          Evaluating <b>{currentOrg.name}</b>&apos;s actual registration facts against each scheme&apos;s real condition tree.
        </p>
      </div>

      {schemes.length === 0 ? (
        <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded-lg p-12 text-center space-y-4 font-mono">
          <div className="w-12 h-12 rounded-full border border-[var(--rule)] bg-[var(--paper)] mx-auto flex items-center justify-center text-[var(--stamp)]">
            <Compass className="w-6 h-6" />
          </div>
          <div className="font-serif text-xl font-bold text-[var(--ink)]">
            No Schemes Ingested in Catalog
          </div>
          <p className="text-xs text-[var(--ink-soft)] max-w-md mx-auto">
            The catalog is currently empty. Ingest schemes from public registries (myScheme, CSR Exchange, Startup India) using the Harvester engine to evaluate AST rules.
          </p>
          <div>
            <Link
              href="/ingestion"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-[var(--paper)] text-xs font-mono font-bold rounded hover:bg-[#2D4A3E] transition-colors no-underline"
            >
              <span>Launch Scheme Harvester</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : selectedScheme ? (
        <>
          {/* Scheme Selector Tabs */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase text-[var(--ink-soft)] tracking-wider">
              Select Scheme to Inspect:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {schemes.map(scheme => {
                const res = getOrgEvaluation(scheme.id);
                const isSelected = scheme.id === selectedScheme.id;
                return (
                  <button
                    key={scheme.id}
                    onClick={() => setSelectedSchemeId(scheme.id)}
                    className={cn(
                      "px-3.5 py-2 text-xs font-mono text-left transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer border rounded-xs",
                      isSelected
                        ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-medium shadow-xs"
                        : "bg-[var(--paper-deep)] text-[var(--ink-soft)] border-[var(--rule)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                    )}
                  >
                    <span className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      res?.isEligible ? "bg-[var(--verified-bg)] text-[var(--verified)]" : "bg-[var(--pending-bg)] text-[var(--pending)]"
                    )}>
                      {res?.isEligible ? "✓" : "✕"}
                    </span>
                    <span className="truncate max-w-[220px]">{scheme.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Signature Case File Container */}
          <div className="casefile" id="casefile-view">
            <div className="casefile-inner">
              <div className="casefile-top">
                <div>
                  <div className="casefile-label">ACTIVE CASE FILE — EVALUATION AUDIT</div>
                  <div className="casefile-title">{currentOrg.name}</div>
                </div>
                <div className="casefile-label text-right">
                  Scheme: <b>{selectedScheme.title}</b>
                  <span className="block text-[11px] text-[var(--ink-soft)]">Funder: {selectedScheme.ministryOrFunder}</span>
                </div>
              </div>

              <div className="org-facts">
                <div>Entity type: <b>{currentOrg.entityType}</b></div>
                <div>Annual turnover: <b>{formatINR(currentOrg.turnoverInr)}</b></div>
                <div>Udyam tier: <b>{currentOrg.udyamTier !== 'None' ? currentOrg.udyamTier : 'Unregistered'}</b></div>
                <div>State: <b>{currentOrg.state}</b></div>
              </div>

              {/* AST Tree Visualizer */}
              {evalResult && (
                <div className="space-y-3 mb-6">
                  <div className="font-mono text-xs text-[var(--ink-soft)] uppercase tracking-wider">
                    AST Condition Hierarchy &amp; Reasoning Trace:
                  </div>
                  <AstNodeVisualizer trace={evalResult.trace} />
                </div>
              )}

              {/* Bottom Stamp Row */}
              <div className="stamp-row">
                <div className="stamp">
                  {evalResult?.isEligible ? "✓ 100% Eligible · Fully Qualified" : `${evalResult?.matchScore || 0}% Match · Criteria Pending`}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/schemes/${selectedScheme.id}`}
                    className="btn-ink text-xs py-2 px-4"
                  >
                    Open Full Scheme Dossier →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
