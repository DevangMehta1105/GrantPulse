"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { COMMON_COMPLIANCE_MODIFIERS, runCounterfactualAnalysis } from "@/lib/ast-engine/counterfactual";
import { 
  Sparkles, 
  TrendingUp, 
  ChevronRight,
  Clock, 
  Coins,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CounterfactualPage() {
  const { currentOrg, schemes } = useApp();
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>(["add_80g", "add_12a"]);

  const toggleModifier = (key: string) => {
    setSelectedModifiers(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const simulation = runCounterfactualAnalysis(currentOrg, schemes, selectedModifiers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#ededef]">Counterfactual &quot;What-If&quot; Simulator</h1>
        <p className="text-xs text-[#8b8d98]">
          Simulate regulatory additions (e.g. 12A/80G, FCRA, Udyam) to discover newly unlocked grants and immediate INR funding delta.
        </p>
      </div>

      {/* Delta Funding Hero Banner */}
      <div className="bg-[#14151a] border border-[#232530] rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#5e6170]">
            Simulated Grant Funding Delta
          </span>
          <div className="text-2xl md:text-3xl font-bold text-[#2eb88a] font-mono">
            +{formatINR(simulation.totalPotentialFundingDelta, true)}
          </div>
          <p className="text-xs text-[#8b8d98]">
            Unlocks <strong className="text-[#ededef] font-semibold">{simulation.unlockedSchemes.length} additional grant programs</strong> for {currentOrg.name}.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-[#8b8d98] bg-[#111216] border border-[#1e2029] p-3 rounded-lg">
          <div>Entity: <span className="text-[#ededef] font-semibold">{currentOrg.name}</span></div>
          <div>Structure: <span className="text-[#ededef]">{currentOrg.entityType}</span></div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Modifier Controls */}
        <div className="lg:col-span-5 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[#1e2029] pb-3">
            <h3 className="font-semibold text-xs text-[#ededef] uppercase font-mono">
              Compliance Upgrades
            </h3>
            <span className="text-[10px] font-mono text-[#5e6170]">
              {selectedModifiers.length} applied
            </span>
          </div>

          <div className="space-y-2">
            {COMMON_COMPLIANCE_MODIFIERS.map(mod => {
              const isChecked = selectedModifiers.includes(mod.key);
              return (
                <button
                  key={mod.key}
                  onClick={() => toggleModifier(mod.key)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors flex items-start justify-between gap-3 cursor-pointer",
                    isChecked
                      ? "bg-[#181c26] border-[#2b3447]"
                      : "bg-[#111216] border-[#1e2029] hover:border-[#2a2c38]"
                  )}
                >
                  <div className="space-y-1">
                    <div className={cn("font-medium text-xs", isChecked ? "text-[#ededef]" : "text-[#8b8d98]")}>
                      {mod.label}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#5e6170]">
                      <span>~{mod.timeframeWeeks} wks</span>
                      <span>•</span>
                      <span>~{formatINR(mod.costEstimateInr || 0)}</span>
                    </div>
                  </div>

                  <div className={cn(
                    "w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0",
                    isChecked ? "bg-[#2eb88a] text-[#0d0e11]" : "bg-[#1e2029] text-transparent"
                  )}>
                    ✓
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Unlocked Schemes List */}
        <div className="lg:col-span-7 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#1e2029] pb-3">
            <h3 className="font-semibold text-xs text-[#ededef] uppercase font-mono">
              Newly Unlocked Programs ({simulation.unlockedSchemes.length})
            </h3>
          </div>

          {simulation.unlockedSchemes.length > 0 ? (
            <div className="space-y-2.5">
              {simulation.unlockedSchemes.map(({ scheme, fundingAmount, unlockedByFixing }) => (
                <div
                  key={scheme.id}
                  className="p-3.5 rounded-lg bg-[#111216] border border-[#1e2029] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-[10px] font-mono text-[#5e6170]">
                      {scheme.ministryOrFunder}
                    </div>
                    <h4 className="font-semibold text-xs text-[#ededef] truncate">
                      {scheme.title}
                    </h4>
                    <div className="text-[10px] text-[#8b8d98]">
                      Unlocked by: <span className="text-[#ededef] font-medium">{unlockedByFixing.join(", ")}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="font-mono font-bold text-xs text-[#2eb88a]">
                      {formatINR(fundingAmount, true)}
                    </div>
                    <Link
                      href={`/schemes/${scheme.id}`}
                      className="text-[10px] text-[#8b8d98] hover:text-[#ededef] flex items-center gap-0.5 justify-end"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#5e6170]">
              Toggle one or more compliance upgrades on the left to simulate unlocked grants.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
