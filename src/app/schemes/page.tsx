"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { Search, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchemesPage() {
  const { schemes, currentOrg, getOrgEvaluation, getOrgDocumentReadiness } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrantType, setSelectedGrantType] = useState<string>("ALL");

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.ministryOrFunder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.sector.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedGrantType === "ALL" || scheme.grantType === selectedGrantType;
    return matchesSearch && matchesType;
  });

  const grantTypes = Array.from(new Set(schemes.map(s => s.grantType)));

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#ededef]">Government & CSR Grant Catalog</h1>
        <p className="text-xs text-[#8b8d98]">
          Curated schemes from myScheme.gov.in, CSR Xchange, Startup India, BIRAC & MoMSME.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#14151a] border border-[#232530] rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-[#5e6170] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programs by title, sector, keyword or ministry..."
            className="w-full bg-[#111216] border border-[#232530] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#ededef] placeholder-[#5e6170] focus:outline-none focus:border-[#373a4a]"
          />
        </div>

        <select
          value={selectedGrantType}
          onChange={(e) => setSelectedGrantType(e.target.value)}
          className="bg-[#111216] border border-[#232530] rounded-md px-3 py-1.5 text-xs text-[#ededef] focus:outline-none focus:border-[#373a4a] cursor-pointer"
        >
          <option value="ALL">All Types</option>
          {grantTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchemes.map(scheme => {
          const evalResult = getOrgEvaluation(scheme.id);

          return (
            <div
              key={scheme.id}
              className="bg-[#14151a] border border-[#232530] hover:border-[#323544] rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#5e6170]">
                  <span>{scheme.grantType}</span>
                  <span>{scheme.sourcePortal}</span>
                </div>

                <h3 className="font-semibold text-xs text-[#ededef] line-clamp-2 leading-snug">
                  {scheme.title}
                </h3>
                <p className="text-[11px] text-[#8b8d98] line-clamp-1">
                  {scheme.ministryOrFunder}
                </p>
                <p className="text-[11px] text-[#8b8d98] line-clamp-2 leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1e2029] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#5e6170]">Max Grant</div>
                  <div className="font-mono font-bold text-xs text-[#ededef]">
                    {formatINR(scheme.maxFundingAmount, true)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-mono font-semibold px-2 py-0.5 rounded",
                    evalResult?.isEligible ? "bg-[#13231e] text-[#2eb88a]" : "bg-[#211a14] text-[#f59e0b]"
                  )}>
                    {evalResult?.isEligible ? "100% Match" : `${evalResult?.matchScore}% Match`}
                  </span>

                  <Link
                    href={`/schemes/${scheme.id}`}
                    className="p-1.5 rounded bg-[#1a1c24] hover:bg-[#20222c] text-[#ededef] transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
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
