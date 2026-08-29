"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EligibilityPage() {
  const { schemes, currentOrg, getOrgEvaluation } = useApp();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0].id);

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];
  const evalResult = getOrgEvaluation(selectedScheme.id);

  return (
    <div className="wrap py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--rule)] pb-6">
        <div className="font-mono text-[12px] tracking-wider uppercase text-[var(--stamp)] mb-2">
          Eligibility Engine · Explainable AST Trace
        </div>
        <h1 className="text-3xl md:text-4xl font-medium serif text-[var(--ink)] tracking-tight">
          How Matching Works: Rule Evaluation
        </h1>
        <p className="text-[15px] text-[var(--ink-soft)] mt-2 measure">
          Evaluating {currentOrg.name}&apos;s actual registration facts against each scheme&apos;s real condition tree.
        </p>
      </div>

      {/* Scheme Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--rule)]">
        {schemes.map(scheme => {
          const res = getOrgEvaluation(scheme.id);
          const isSelected = scheme.id === selectedSchemeId;
          return (
            <button
              key={scheme.id}
              onClick={() => setSelectedSchemeId(scheme.id)}
              className={cn(
                "px-3 py-2 text-xs font-mono text-left transition-colors flex items-center gap-2 flex-shrink-0 cursor-pointer border",
                isSelected
                  ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-medium"
                  : "bg-[var(--paper-deep)] text-[var(--ink-soft)] border-[var(--rule)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
              )}
            >
              <span>{res?.isEligible ? "✓" : "✕"}</span>
              <span className="truncate max-w-[200px]">{scheme.title}</span>
            </button>
          );
        })}
      </div>

      {/* Signature Case File Container */}
      <div className="casefile" id="casefile-view">
        <div className="casefile-inner">
          <div className="casefile-top">
            <div>
              <div className="casefile-label">ACTIVE CASE FILE — EVALUATION AUDIT</div>
              <div className="casefile-title">{currentOrg.name}</div>
            </div>
            <div className="casefile-label">
              Scheme: <b>{selectedScheme.title}</b> ({selectedScheme.ministryOrFunder})
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
            <div className="space-y-4 mb-6">
              <div className="font-mono text-xs text-[var(--ink-soft)] uppercase tracking-wider">
                AST Condition Hierarchy &amp; Reasoning:
              </div>
              <AstNodeVisualizer trace={evalResult.trace} />
            </div>
          )}

          {/* Bottom Stamp Row */}
          <div className="stamp-row">
            <div className="stamp">
              {evalResult?.isEligible ? "100% Eligible · Ready to Apply" : `${evalResult?.matchScore}% Match · Remediation Required`}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/schemes/${selectedScheme.id}`}
                className="btn-ink text-xs py-2 px-4"
              >
                Proceed to Application →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
