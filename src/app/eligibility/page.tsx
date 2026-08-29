"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { formatINR } from "@/lib/utils";
import { 
  GitFork, 
  Check, 
  X, 
  Layers, 
  Building2, 
  Info,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EligibilityPage() {
  const { schemes, currentOrg, getOrgEvaluation } = useApp();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0].id);

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];
  const evalResult = getOrgEvaluation(selectedScheme.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#ededef]">AST Eligibility Reasoner</h1>
        <p className="text-xs text-[#8b8d98]">
          Deterministic boolean and threshold tree verification evaluated live against {currentOrg.name}.
        </p>
      </div>

      {/* Scheme Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#1e2029]">
        {schemes.map(scheme => {
          const res = getOrgEvaluation(scheme.id);
          const isSelected = scheme.id === selectedSchemeId;
          return (
            <button
              key={scheme.id}
              onClick={() => setSelectedSchemeId(scheme.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 flex-shrink-0 transition-colors cursor-pointer",
                isSelected
                  ? "bg-[#1a1c24] text-[#ededef] border border-[#232530]"
                  : "text-[#8b8d98] hover:text-[#ededef] hover:bg-[#14151a]"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", res?.isEligible ? "bg-[#2eb88a]" : "bg-[#f59e0b]")} />
              <span className="truncate max-w-[180px]">{scheme.title}</span>
              <span className="text-[10px] font-mono text-[#5e6170]">{res?.matchScore}%</span>
            </button>
          );
        })}
      </div>

      {/* Main Analysis Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* AST Trace Tree */}
        <div className="lg:col-span-8 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2029]">
            <div>
              <span className="text-[10px] font-mono text-[#5e6170] uppercase">
                {selectedScheme.sourcePortal}
              </span>
              <h2 className="text-sm font-semibold text-[#ededef] mt-0.5">
                {selectedScheme.title}
              </h2>
            </div>

            <div className="text-right font-mono">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded font-bold",
                evalResult?.isEligible ? "bg-[#13231e] text-[#2eb88a] border border-[#1e3b2e]" : "bg-[#211a14] text-[#f59e0b] border border-[#382a1b]"
              )}>
                {evalResult?.isEligible ? "100% Eligible" : `${evalResult?.matchScore}% Match`}
              </span>
            </div>
          </div>

          {/* AST Visualizer */}
          {evalResult && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-[#5e6170] uppercase">
                Evaluation Syntax Tree:
              </div>
              <AstNodeVisualizer trace={evalResult.trace} />
            </div>
          )}
        </div>

        {/* Right Rail: Actionable Remediation Summary */}
        <div className="lg:col-span-4 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-[#1e2029] pb-3">
            <Info className="w-4 h-4 text-[#8b8d98]" />
            <h3 className="font-semibold text-xs text-[#ededef] uppercase font-mono">
              Evaluation Breakdown
            </h3>
          </div>

          {evalResult?.isEligible ? (
            <div className="p-3 rounded-lg bg-[#111614] border border-[#1e2e26] text-[#2eb88a] space-y-1">
              <div className="font-semibold">All Constraints Met</div>
              <p className="text-[11px] text-[#8b8d98]">
                {currentOrg.name} meets all regulatory, turnover, and structure parameters for this scheme.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-[#ef4444]">
                Unmet Conditions ({evalResult?.missingRequirements.length}):
              </div>
              <div className="space-y-1.5">
                {evalResult?.missingRequirements.map((req, i) => (
                  <div key={i} className="p-2.5 rounded-md bg-[#161214] border border-[#331e24] text-[11px] text-[#f87171]">
                    {req}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passed Rules */}
          <div className="pt-2 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#5e6170]">
              Passed Rules ({evalResult?.passedRulesCount}/{evalResult?.totalRulesCount})
            </span>
            <div className="space-y-1">
              {evalResult?.criticalPasses.map((pass, idx) => (
                <div key={idx} className="text-[11px] text-[#8b8d98] flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-[#2eb88a] flex-shrink-0" />
                  <span className="truncate">{pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
