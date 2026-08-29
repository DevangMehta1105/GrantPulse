"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { Building2, ChevronDown, ShieldCheck, Award, Sparkles } from "lucide-react";

export function Header() {
  const { organizations, currentOrg, setCurrentOrgId, applications } = useApp();

  const totalSanctioned = applications
    .filter(a => a.orgId === currentOrg.id && a.currentState === "Sanctioned")
    .reduce((sum, a) => sum + (a.sanctionedAmount || 0), 0);

  const activeApps = applications.filter(
    a => a.orgId === currentOrg.id && a.currentState !== "Sanctioned" && a.currentState !== "Rejected"
  ).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Active Organization Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Entity Profile</span>
            <div className="relative inline-block">
              <select
                value={currentOrg.id}
                onChange={(e) => setCurrentOrgId(e.target.value)}
                className="appearance-none bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-sm pl-2.5 pr-8 py-1 rounded-md border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.entityType} • {org.udyamTier !== 'None' ? `${org.udyamTier} MSME` : 'NGO'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Badges for active entity */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
            {currentOrg.state}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
            Turnover: {formatINR(currentOrg.turnoverInr, true)}
          </span>
          {currentOrg.complianceFlags.has80G && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 80G Certified
            </span>
          )}
          {currentOrg.complianceFlags.hasUdyam && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium flex items-center gap-1">
              <Award className="w-3 h-3" /> {currentOrg.udyamTier} MSME
            </span>
          )}
        </div>
      </div>

      {/* Right Stats Overview */}
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <div className="text-[11px] text-slate-400 font-medium">Sanctioned Grants</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {formatINR(totalSanctioned, true)}
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-[11px] text-slate-400 font-medium">In Pipeline</div>
          <div className="text-sm font-bold text-amber-400 font-mono">
            {activeApps} Schemes
          </div>
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md">
            GP
          </div>
        </div>
      </div>
    </header>
  );
}
