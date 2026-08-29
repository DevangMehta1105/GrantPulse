"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { Building2, ChevronDown, ShieldCheck, Award, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { organizations, currentOrg, setCurrentOrgId, applications } = useApp();

  const totalSanctioned = applications
    .filter(a => a.orgId === currentOrg.id && a.currentState === "Sanctioned")
    .reduce((sum, a) => sum + (a.sanctionedAmount || 0), 0);

  const activeApps = applications.filter(
    a => a.orgId === currentOrg.id && a.currentState !== "Sanctioned" && a.currentState !== "Rejected"
  ).length;

  return (
    <header className="h-16 border-b border-[#1a1f2c] bg-[#0c0e14]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Organization Switcher */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Building2 className="w-4 h-4" />
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
            Current Entity Profile
          </span>
          <div className="relative inline-block">
            <select
              value={currentOrg.id}
              onChange={(e) => setCurrentOrgId(e.target.value)}
              className="appearance-none bg-[#141923] hover:bg-[#1a202d] text-white font-bold text-xs pl-2.5 pr-7 py-1 rounded-lg border border-[#232a3b] focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.entityType} • {org.udyamTier !== 'None' ? `${org.udyamTier} MSME` : 'NGO'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Entity Highlights */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#1e2433] text-xs">
          <span className="px-2 py-0.5 rounded-md bg-[#131620] text-slate-300 font-medium border border-[#1e2433]">
            {currentOrg.state}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#131620] text-slate-300 font-medium border border-[#1e2433]">
            Turnover: <strong className="text-white font-mono">{formatINR(currentOrg.turnoverInr, true)}</strong>
          </span>
          {currentOrg.complianceFlags.has80G && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 80G Certified
            </span>
          )}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="flex items-center gap-5">
        <div className="text-right hidden sm:block">
          <div className="text-[10px] text-slate-400 font-medium">In Pipeline</div>
          <div className="text-xs font-bold text-amber-400 font-mono">
            {activeApps} Active Grants
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-[10px] text-slate-400 font-medium">Sanctioned Grants</div>
          <div className="text-xs font-bold text-emerald-400 font-mono">
            {formatINR(totalSanctioned, true)}
          </div>
        </div>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md shadow-emerald-500/10">
          GP
        </div>
      </div>
    </header>
  );
}
