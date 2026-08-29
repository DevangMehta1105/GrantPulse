"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Calendar,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchemesPage() {
  const { schemes, currentOrg, getOrgEvaluation, getOrgDocumentReadiness } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrantType, setSelectedGrantType] = useState<string>("ALL");
  const [selectedPortal, setSelectedPortal] = useState<string>("ALL");

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.ministryOrFunder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.sector.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedGrantType === "ALL" || scheme.grantType === selectedGrantType;
    const matchesPortal = selectedPortal === "ALL" || scheme.sourcePortal === selectedPortal;

    return matchesSearch && matchesType && matchesPortal;
  });

  const portals = Array.from(new Set(schemes.map(s => s.sourcePortal)));
  const grantTypes = Array.from(new Set(schemes.map(s => s.grantType)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            Indian Grant & Scheme Catalog
          </h1>
          <p className="text-sm text-slate-400">
            Ingested from myScheme.gov.in, CSR Xchange, Startup India, BIRAC & MoMSME
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/eligibility"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AST Rule Inspector</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scheme title, sector, keyword or ministry..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedGrantType}
            onChange={(e) => setSelectedGrantType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Grant Types</option>
            {grantTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedPortal}
            onChange={(e) => setSelectedPortal(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Portals</option>
            {portals.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map(scheme => {
          const evalResult = getOrgEvaluation(scheme.id);
          const readiness = getOrgDocumentReadiness(scheme.id);

          return (
            <div
              key={scheme.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all hover:shadow-lg group"
            >
              <div className="space-y-3">
                {/* Badges & Portal */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                    {scheme.grantType}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {scheme.sourcePortal}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {scheme.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {scheme.ministryOrFunder}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>

                {/* Sector Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scheme.sector.map(sec => (
                    <span key={sec} className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Max Funding:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatINR(scheme.maxFundingAmount, true)}
                  </span>
                </div>

                {/* AST Result Status */}
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    {evalResult?.isEligible ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Eligible
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {evalResult?.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/schemes/${scheme.id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Inspect AST</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
