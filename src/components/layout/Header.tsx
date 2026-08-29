"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { Building2, ChevronDown, Search, Command } from "lucide-react";

export function Header() {
  const { organizations, currentOrg, setCurrentOrgId, applications } = useApp();

  const totalSanctioned = applications
    .filter(a => a.orgId === currentOrg.id && a.currentState === "Sanctioned")
    .reduce((sum, a) => sum + (a.sanctionedAmount || 0), 0);

  const activeApps = applications.filter(
    a => a.orgId === currentOrg.id && a.currentState !== "Sanctioned" && a.currentState !== "Rejected"
  ).length;

  return (
    <header className="h-14 border-b border-[#1e2029] bg-[#0d0e11] px-6 flex items-center justify-between sticky top-0 z-30 text-xs">
      {/* Organization Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#5e6170]" />
          <span className="text-[#5e6170] text-[11px] font-mono uppercase">Entity:</span>
          <div className="relative inline-block">
            <select
              value={currentOrg.id}
              onChange={(e) => setCurrentOrgId(e.target.value)}
              className="appearance-none bg-[#14151a] hover:bg-[#1a1c24] text-[#ededef] font-medium text-xs pl-2.5 pr-7 py-1 rounded-md border border-[#232530] focus:outline-none focus:border-[#373a4a] transition-colors cursor-pointer"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.entityType} • {org.udyamTier !== 'None' ? `${org.udyamTier} MSME` : 'NGO'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#8b8d98] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#1e2029] text-[11px] text-[#8b8d98]">
          <span>{currentOrg.state}</span>
          <span>•</span>
          <span>Turnover: <strong className="text-[#ededef] font-mono">{formatINR(currentOrg.turnoverInr, true)}</strong></span>
        </div>
      </div>

      {/* Right Stats & Quick Search */}
      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
          <div>
            <span className="text-[#5e6170]">Pipeline: </span>
            <span className="text-[#ededef] font-medium">{activeApps} active</span>
          </div>
          <div>
            <span className="text-[#5e6170]">Sanctioned: </span>
            <span className="text-[#2eb88a] font-medium">{formatINR(totalSanctioned, true)}</span>
          </div>
        </div>

        <div className="w-6 h-6 rounded-full bg-[#1e2029] text-[#ededef] font-mono text-[10px] flex items-center justify-center font-bold">
          GP
        </div>
      </div>
    </header>
  );
}
