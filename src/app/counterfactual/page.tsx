"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { COMMON_COMPLIANCE_MODIFIERS, runCounterfactualAnalysis } from "@/lib/ast-engine/counterfactual";
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
    <div className="wrap py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--rule)] pb-6">
        <div className="font-mono text-[12px] tracking-wider uppercase text-[var(--stamp)] mb-2">
          Simulation Engine · Counterfactual Matching
        </div>
        <h1 className="text-3xl md:text-4xl font-medium serif text-[var(--ink)] tracking-tight">
          What-If Registration Simulator
        </h1>
        <p className="text-[15px] text-[var(--ink-soft)] mt-2 measure">
          Simulate regulatory additions (80G, 12A, NGO Darpan, FCRA, CSR-1, Udyam) to calculate newly unlocked funding value.
        </p>
      </div>

      {/* Delta Funding Hero Banner */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--stamp)]">
            Potential Grant Funding Delta
          </span>
          <div className="text-3xl md:text-4xl font-medium serif text-[var(--ink)]">
            +{formatINR(simulation.totalPotentialFundingDelta, true)}
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            Unlocks <b className="text-[var(--ink)] font-semibold">{simulation.unlockedSchemes.length} additional grant programs</b> for {currentOrg.name}.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-[var(--ink-soft)] bg-[var(--paper)] border border-[var(--rule)] p-4">
          <div>Active Entity: <b className="text-[var(--ink)]">{currentOrg.name}</b></div>
          <div>Structure: <b className="text-[var(--ink)]">{currentOrg.entityType}</b></div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Modifier Controls */}
        <div className="lg:col-span-5 bg-[var(--paper-deep)] border border-[var(--rule)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h3 className="font-mono text-xs uppercase font-medium text-[var(--ink)]">
              Simulate Regulatory Additions
            </h3>
            <span className="font-mono text-[11px] text-[var(--ink-soft)]">
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
                    "w-full text-left p-3.5 border transition-colors flex items-start justify-between gap-3 cursor-pointer",
                    isChecked
                      ? "bg-[var(--paper)] border-[var(--ink)]"
                      : "bg-[var(--paper)] border-[var(--rule)] hover:border-[var(--ink-soft)]"
                  )}
                >
                  <div className="space-y-1">
                    <div className="font-medium text-xs text-[var(--ink)]">
                      {mod.label}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--ink-soft)]">
                      <span>~{mod.timeframeWeeks} wks</span>
                      <span>·</span>
                      <span>~{formatINR(mod.costEstimateInr || 0)}</span>
                    </div>
                  </div>

                  <div className={cn(
                    "w-4 h-4 rounded-xs flex items-center justify-center text-[10px] font-mono font-bold mt-0.5 flex-shrink-0 border",
                    isChecked ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]" : "border-[var(--rule)] text-transparent"
                  )}>
                    ✓
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Unlocked Schemes List */}
        <div className="lg:col-span-7 bg-[var(--paper-deep)] border border-[var(--rule)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h3 className="font-mono text-xs uppercase font-medium text-[var(--ink)]">
              Newly Unlocked Programs ({simulation.unlockedSchemes.length})
            </h3>
          </div>

          {simulation.unlockedSchemes.length > 0 ? (
            <div className="space-y-3">
              {simulation.unlockedSchemes.map(({ scheme, fundingAmount, unlockedByFixing }) => (
                <div
                  key={scheme.id}
                  className="p-4 bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-[var(--ink-soft)]">
                      {scheme.ministryOrFunder}
                    </div>
                    <h4 className="text-sm font-medium serif text-[var(--ink)] truncate">
                      {scheme.title}
                    </h4>
                    <div className="text-[12px] text-[var(--ink-soft)]">
                      Unlocked by: <span className="text-[var(--ink)] font-medium">{unlockedByFixing.join(", ")}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1 font-mono">
                    <div className="font-medium text-xs text-[var(--ink)]">
                      {formatINR(fundingAmount, true)}
                    </div>
                    <Link
                      href={`/schemes/${scheme.id}`}
                      className="btn-ink text-[11px] py-1 px-2.5"
                    >
                      Inspect File →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--ink-soft)] font-mono">
              Toggle one or more registrations on the left to simulate unlocked schemes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
