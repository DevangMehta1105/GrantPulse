"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { 
  Building2, 
  Layers, 
  FileCheck2, 
  KanbanSquare, 
  ScrollText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Search,
  ExternalLink,
  ChevronRight,
  Hash,
  TrendingUp,
  GitFork
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverview() {
  const { currentOrg, schemes, documents, applications, getOrgEvaluation, getOrgDocumentReadiness } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const schemeEvaluations = schemes.map(s => ({
    scheme: s,
    evaluation: getOrgEvaluation(s.id),
    readiness: getOrgDocumentReadiness(s.id)
  }));

  const eligibleSchemes = schemeEvaluations.filter(se => se.evaluation?.isEligible);
  const potentialFunding = eligibleSchemes.reduce((sum, se) => sum + se.scheme.maxFundingAmount, 0);

  const orgApps = applications.filter(a => a.orgId === currentOrg.id);
  const totalSanctioned = orgApps
    .filter(a => a.currentState === "Sanctioned")
    .reduce((sum, a) => sum + (a.sanctionedAmount || 0), 0);

  const filteredSchemes = schemeEvaluations.filter(se => 
    se.scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    se.scheme.ministryOrFunder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Entity Overview Summary Banner */}
      <div className="bg-[#14151a] border border-[#232530] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#ededef] tracking-tight">{currentOrg.name}</h1>
            <span className="text-[10px] font-mono text-[#8b8d98] px-2 py-0.5 rounded bg-[#1a1c24] border border-[#232530]">
              {currentOrg.entityType}
            </span>
            {currentOrg.complianceFlags.hasUdyam && (
              <span className="text-[10px] font-mono text-[#2eb88a] px-2 py-0.5 rounded bg-[#13231e] border border-[#1e3b2e]">
                {currentOrg.udyamTier} MSME
              </span>
            )}
            {currentOrg.complianceFlags.has80G && (
              <span className="text-[10px] font-mono text-[#3b82f6] px-2 py-0.5 rounded bg-[#142033] border border-[#1f3152]">
                80G Certified
              </span>
            )}
          </div>
          <p className="text-xs text-[#8b8d98] line-clamp-1 max-w-3xl">
            {currentOrg.missionDescription}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/eligibility"
            className="px-3 py-1.5 rounded-lg bg-[#1a1c24] hover:bg-[#20222c] text-[#ededef] font-medium text-xs border border-[#232530] flex items-center gap-1.5 transition-colors"
          >
            <GitFork className="w-3.5 h-3.5 text-[#8b8d98]" />
            <span>AST Reasoner</span>
          </Link>
          <Link
            href="/counterfactual"
            className="px-3 py-1.5 rounded-lg bg-[#1a1c24] hover:bg-[#20222c] text-[#ededef] font-medium text-xs border border-[#232530] flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8b8d98]" />
            <span>What-If Simulator</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#14151a] border border-[#232530] rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-[#8b8d98] font-medium block">Eligible Schemes</span>
          <div className="text-xl font-bold text-[#ededef] font-mono">
            {eligibleSchemes.length} <span className="text-xs text-[#5e6170]">/ {schemes.length}</span>
          </div>
          <div className="text-[10px] text-[#2eb88a] font-mono">100% AST pass</div>
        </div>

        <div className="bg-[#14151a] border border-[#232530] rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-[#8b8d98] font-medium block">Potential Grant Value</span>
          <div className="text-xl font-bold text-[#ededef] font-mono">
            {formatINR(potentialFunding, true)}
          </div>
          <div className="text-[10px] text-[#8b8d98]">Across qualified programs</div>
        </div>

        <div className="bg-[#14151a] border border-[#232530] rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-[#8b8d98] font-medium block">Pipeline In-Flight</span>
          <div className="text-xl font-bold text-[#ededef] font-mono">
            {orgApps.length}
          </div>
          <div className="text-[10px] text-[#f59e0b] font-mono">FSM state guarded</div>
        </div>

        <div className="bg-[#14151a] border border-[#232530] rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-[#8b8d98] font-medium block">Sanctioned Disbursals</span>
          <div className="text-xl font-bold text-[#2eb88a] font-mono">
            {formatINR(totalSanctioned, true)}
          </div>
          <div className="text-[10px] text-[#8b8d98]">Form GFR 12-A tracked</div>
        </div>
      </div>

      {/* Two-Pane Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Active Application Pipeline Table */}
        <div className="lg:col-span-7 bg-[#14151a] border border-[#232530] rounded-xl overflow-hidden shadow-sm space-y-0">
          <div className="p-4 border-b border-[#1e2029] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KanbanSquare className="w-4 h-4 text-[#8b8d98]" />
              <h2 className="font-semibold text-xs text-[#ededef] tracking-tight uppercase font-mono">
                Active Grant Applications ({orgApps.length})
              </h2>
            </div>
            <Link href="/pipeline" className="text-[11px] text-[#8b8d98] hover:text-[#ededef] font-medium flex items-center gap-1">
              Open Board <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#1e2029] text-xs">
            {orgApps.map(app => {
              const scheme = schemes.find(s => s.id === app.schemeId);
              return (
                <div key={app.id} className="p-3.5 hover:bg-[#1a1c24] transition-colors flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#8b8d98] text-[10px]">{app.id}</span>
                      <span className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded-full font-medium",
                        app.currentState === "Sanctioned" ? "bg-[#13231e] text-[#2eb88a] border border-[#1e3b2e]"
                        : app.currentState === "Under Review" ? "bg-[#142033] text-[#3b82f6] border border-[#1f3152]"
                        : app.currentState === "Applied" ? "bg-[#201833] text-[#a78bfa] border border-[#2d2248]"
                        : "bg-[#1f1d17] text-[#f59e0b] border border-[#3b341f]"
                      )}>
                        {app.currentState}
                      </span>
                      {app.externalApplicationId && (
                        <span className="text-[10px] font-mono text-[#5e6170] truncate">
                          Ref: {app.externalApplicationId}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-xs text-[#ededef] truncate">
                      {scheme?.title || app.schemeId}
                    </h3>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-xs text-[#ededef]">
                      {formatINR(app.requestedAmount, true)}
                    </div>
                    <div className="text-[10px] text-[#5e6170] font-mono">
                      {formatDate(app.updated_at)}
                    </div>
                  </div>
                </div>
              );
            })}

            {orgApps.length === 0 && (
              <div className="p-8 text-center text-xs text-[#5e6170]">
                No applications in pipeline. Select an eligible scheme on the right to begin.
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Eligible Schemes Feed */}
        <div className="lg:col-span-5 bg-[#14151a] border border-[#232530] rounded-xl overflow-hidden shadow-sm space-y-0">
          <div className="p-4 border-b border-[#1e2029] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8b8d98]" />
              <h2 className="font-semibold text-xs text-[#ededef] tracking-tight uppercase font-mono">
                Scheme Catalog
              </h2>
            </div>
            <Link href="/schemes" className="text-[11px] text-[#8b8d98] hover:text-[#ededef] font-medium flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick Search */}
          <div className="p-3 border-b border-[#1e2029] bg-[#111216]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#5e6170] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter schemes..."
                className="w-full bg-[#14151a] border border-[#232530] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#ededef] placeholder-[#5e6170] focus:outline-none focus:border-[#373a4a]"
              />
            </div>
          </div>

          <div className="divide-y divide-[#1e2029] text-xs max-h-[500px] overflow-y-auto">
            {filteredSchemes.map(({ scheme, evaluation, readiness }) => (
              <div key={scheme.id} className="p-3.5 hover:bg-[#1a1c24] transition-colors space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#5e6170] truncate">
                    {scheme.sourcePortal}
                  </span>
                  {evaluation?.isEligible ? (
                    <span className="text-[10px] font-mono text-[#2eb88a] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 100% Match
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#f59e0b] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {evaluation?.matchScore}% Match
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-xs text-[#ededef] line-clamp-1">
                    {scheme.title}
                  </h3>
                  <p className="text-[11px] text-[#8b8d98] line-clamp-1 mt-0.5">
                    {scheme.ministryOrFunder}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="font-mono text-[#ededef] font-semibold">
                    Cap: {formatINR(scheme.maxFundingAmount, true)}
                  </span>

                  <Link
                    href={`/schemes/${scheme.id}`}
                    className="text-[#8b8d98] hover:text-[#ededef] font-medium flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
