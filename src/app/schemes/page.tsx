"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchemesPage() {
  const { schemes, getOrgEvaluation } = useApp();
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
    <div className="wrap py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--rule)] pb-6">
        <div className="font-mono text-[12px] tracking-wider uppercase text-[var(--stamp)] mb-2">
          Schemes Database · Ingested &amp; Verified
        </div>
        <h1 className="text-3xl md:text-4xl font-medium serif text-[var(--ink)] tracking-tight">
          Government &amp; CSR Grant Catalog
        </h1>
        <p className="text-[15px] text-[var(--ink-soft)] mt-2 measure">
          Targeting official schemes from myScheme.gov.in, CSR Xchange, Startup India, BIRAC &amp; MoMSME.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--paper-deep)] p-4 border border-[var(--rule)]">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes by title, sector, keyword or ministry..."
            className="w-full bg-[var(--paper)] border border-[var(--rule)] pl-9 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none focus:border-[var(--ink)]"
          />
        </div>

        <select
          value={selectedGrantType}
          onChange={(e) => setSelectedGrantType(e.target.value)}
          className="bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] cursor-pointer"
        >
          <option value="ALL">All Grant Types</option>
          {grantTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map(scheme => {
          const evalResult = getOrgEvaluation(scheme.id);

          return (
            <div
              key={scheme.id}
              className="bg-[var(--paper-deep)] border border-[var(--rule)] p-6 flex flex-col justify-between space-y-4 hover:border-[var(--ink)] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[11px] text-[var(--ink-soft)]">
                  <span>{scheme.sourcePortal}</span>
                  <span className="uppercase text-[var(--stamp)]">{scheme.grantType}</span>
                </div>

                <div>
                  <h3 className="text-xl font-medium serif text-[var(--ink)] leading-snug">
                    {scheme.title}
                  </h3>
                  <p className="text-[13px] text-[var(--ink-soft)] font-medium mt-1">
                    {scheme.ministryOrFunder}
                  </p>
                </div>

                <p className="text-[14px] text-[var(--ink-soft)] line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scheme.sector.map(sec => (
                    <span key={sec} className="text-[11px] font-mono bg-[var(--paper)] text-[var(--ink-soft)] px-2 py-0.5 border border-[var(--rule)]">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-[var(--rule)] flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-[var(--ink-soft)] text-[11px] block">Max Cap</span>
                  <span className="font-medium text-[var(--ink)] text-sm">
                    {formatINR(scheme.maxFundingAmount, true)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-xs font-medium text-[11px]",
                    evalResult?.isEligible ? "bg-[var(--verified-bg)] text-[var(--verified)]" : "bg-[var(--pending-bg)] text-[var(--pending)]"
                  )}>
                    {evalResult?.isEligible ? "✓ Eligible" : `${evalResult?.matchScore}% Match`}
                  </span>

                  <Link
                    href={`/schemes/${scheme.id}`}
                    className="btn-ink text-xs py-1.5 px-3"
                  >
                    Inspect File →
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
