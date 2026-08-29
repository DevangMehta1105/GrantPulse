"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { formatINR } from "@/lib/utils";
import { 
  GitFork, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EligibilityPage() {
  const { schemes, currentOrg, getOrgEvaluation } = useApp();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0].id);

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];
  const evalResult = getOrgEvaluation(selectedScheme.id);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core Differentiator #1 • Explainable AST Engine</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          AST Eligibility Reasoning Trace
        </h1>
        <p className="text-sm text-slate-400">
          Deterministic boolean and threshold tree evaluation showing why an entity qualifies or fails.
        </p>
      </div>

      {/* Scheme Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {schemes.map(scheme => {
          const res = getOrgEvaluation(scheme.id);
          const isSelected = scheme.id === selectedSchemeId;
          return (
            <button
              key={scheme.id}
              onClick={() => setSelectedSchemeId(scheme.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer",
                isSelected
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              )}
            >
              {res?.isEligible ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>{scheme.title.slice(0, 32)}...</span>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
                {res?.matchScore}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Analysis Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AST Trace Tree */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  {selectedScheme.sourcePortal}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedScheme.title}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Match Score</div>
                <div className={cn("text-2xl font-black font-mono", evalResult?.isEligible ? "text-emerald-400" : "text-amber-400")}>
                  {evalResult?.matchScore}%
                </div>
              </div>
            </div>

            {/* AST Visualizer */}
            {evalResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <GitFork className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Node Hierarchy (Click arrows to collapse/expand):</span>
                </div>
                <AstNodeVisualizer trace={evalResult.trace} />
              </div>
            )}
          </div>
        </div>

        {/* Right Rail: Actionable Remediation Summary */}
        <div className="space-y-6">
          {/* Missing Requirements Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Reasoning Engine Verdict
            </h3>

            {evalResult?.isEligible ? (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  100% Fully Qualified
                </div>
                <p>
                  All AST branches passed. {currentOrg.name} meets all regulatory, turnover, and structural parameters for this scheme.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
                  <div className="font-bold flex items-center gap-1.5 text-rose-400 mb-1">
                    <XCircle className="w-4 h-4" />
                    Unmet Criteria Detected
                  </div>
                  <p className="text-[11px] text-rose-300/80">
                    The following AST condition nodes evaluated to false:
                  </p>
                </div>

                <div className="space-y-2">
                  {evalResult?.missingRequirements.map((req, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passed Rules */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Passed Constraints ({evalResult?.passedRulesCount}/{evalResult?.totalRulesCount})
              </span>
              <div className="space-y-1.5">
                {evalResult?.criticalPasses.map((pass, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{pass}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
