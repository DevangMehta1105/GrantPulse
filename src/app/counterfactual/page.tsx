"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { COMMON_COMPLIANCE_MODIFIERS, runCounterfactualAnalysis } from "@/lib/ast-engine/counterfactual";
import { 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Zap, 
  Clock, 
  Coins,
  ShieldCheck,
  Building2
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core Differentiator • Counterfactual &quot;What-If&quot; Engine</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Counterfactual Delta Funding Simulator
        </h1>
        <p className="text-sm text-slate-400">
          Simulate regulatory additions (e.g. 12A/80G, FCRA, Udyam) to discover newly unlocked grants and immediate INR funding ROI.
        </p>
      </div>

      {/* Delta Funding Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Simulated Growth Potential
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white font-mono">
            +{formatINR(simulation.totalPotentialFundingDelta, true)}
          </h2>
          <p className="text-xs text-slate-300">
            Unlocks <strong className="text-cyan-400 font-bold">{simulation.unlockedSchemes.length} additional grant schemes</strong> by executing the selected compliance upgrades.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Entity</div>
            <div className="font-bold text-sm text-white">{currentOrg.name}</div>
            <div className="text-[11px] text-slate-400">{currentOrg.entityType} • {currentOrg.state}</div>
          </div>
        </div>
      </div>

      {/* Simulation Controls & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modifiers Checklist */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Simulate Compliance Changes
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedModifiers.length} active
              </span>
            </div>

            <div className="space-y-2.5">
              {COMMON_COMPLIANCE_MODIFIERS.map(mod => {
                const isChecked = selectedModifiers.includes(mod.key);
                return (
                  <button
                    key={mod.key}
                    onClick={() => toggleModifier(mod.key)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer",
                      isChecked
                        ? "bg-cyan-950/30 border-cyan-500/40 shadow-sm"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    <div className="space-y-1">
                      <div className={cn("font-bold text-xs", isChecked ? "text-cyan-300" : "text-slate-300")}>
                        {mod.label}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> ~{mod.timeframeWeeks} wks
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-slate-400" /> ~{formatINR(mod.costEstimateInr || 0)}
                        </span>
                      </div>
                    </div>

                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0 mt-0.5",
                      isChecked ? "bg-cyan-500 text-slate-950" : "bg-slate-700 text-transparent"
                    )}>
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* High Leverage Opportunities */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Highest Leverage Actions
            </h3>
            <div className="space-y-2">
              {simulation.highLeverageFixes.slice(0, 3).map((fix, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">{fix.action}</div>
                    <div className="text-[10px] text-slate-400">+{fix.schemesUnlockedCount} schemes</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    +{formatINR(fix.fundingDeltaInr, true)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Unlocked Schemes Result Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">
                  Newly Unlocked Schemes ({simulation.unlockedSchemes.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Grants that become 100% AST eligible after applying the selected changes
                </p>
              </div>
            </div>

            {simulation.unlockedSchemes.length > 0 ? (
              <div className="space-y-3">
                {simulation.unlockedSchemes.map(({ scheme, fundingAmount, unlockedByFixing }) => (
                  <div
                    key={scheme.id}
                    className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {scheme.grantType}
                        </span>
                        <span className="text-xs text-slate-400">{scheme.ministryOrFunder}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{scheme.title}</h4>
                      <div className="text-xs text-slate-400">
                        Unlocked by: <span className="text-cyan-300 font-medium">{unlockedByFixing.join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Max Grant</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">
                          {formatINR(fundingAmount, true)}
                        </div>
                      </div>

                      <Link
                        href={`/schemes/${scheme.id}`}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-2">
                <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-300">No additional schemes unlocked</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Select one or more compliance modifiers on the left to simulate regulatory unlocks.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
