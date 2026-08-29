"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { schemes, currentOrg, getOrgEvaluation, getOrgDocumentReadiness, createNewApplication, applications } = useApp();
  const [isApplying, setIsApplying] = useState(false);

  const scheme = schemes.find(s => s.id === unwrappedParams.id);
  if (!scheme) {
    return (
      <div className="wrap py-12 text-center text-sm text-[var(--ink-soft)]">
        Scheme not found. <Link href="/schemes" className="text-[var(--ink)] underline">Return to catalog</Link>
      </div>
    );
  }

  const evalResult = getOrgEvaluation(scheme.id);
  const readiness = getOrgDocumentReadiness(scheme.id);
  const existingApp = applications.find(a => a.orgId === currentOrg.id && a.schemeId === scheme.id);

  const handleApply = async () => {
    setIsApplying(true);
    await createNewApplication(scheme.id, scheme.maxFundingAmount);
    setIsApplying(false);
    router.push("/pipeline");
  };

  return (
    <div className="wrap py-12 space-y-8">
      <Link 
        href="/schemes" 
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </Link>

      {/* Program Summary Card */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] p-6 md:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-[11px] uppercase text-[var(--stamp)]">
              {scheme.sourcePortal} · {scheme.grantType}
            </div>
            <h1 className="text-2xl md:text-3xl font-medium serif text-[var(--ink)]">{scheme.title}</h1>
            <p className="text-sm font-medium text-[var(--ink-soft)]">{scheme.ministryOrFunder}</p>
          </div>

          <div>
            {existingApp ? (
              <Link
                href="/pipeline"
                className="btn-ink-ghost text-xs py-2 px-4"
              >
                Track in Pipeline ({existingApp.currentState})
              </Link>
            ) : (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="btn-ink text-xs py-2 px-4"
              >
                {isApplying ? "Adding..." : "Add to Application Pipeline"}
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-4xl">
          {scheme.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dashed border-[var(--rule)] font-mono text-xs">
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px]">MAX FUNDING CAP</span>
            <span className="font-semibold text-sm text-[var(--ink)]">{formatINR(scheme.maxFundingAmount, true)}</span>
          </div>
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px]">DEADLINE</span>
            <span className="text-[var(--ink)]">{formatDate(scheme.deadline)}</span>
          </div>
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px]">AST ELIGIBILITY</span>
            <span className={evalResult?.isEligible ? "text-[var(--verified)] font-bold" : "text-[var(--pending)] font-bold"}>
              {evalResult?.matchScore}% Match
            </span>
          </div>
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px]">DOCUMENT READINESS</span>
            <span className="text-[var(--ink)] font-bold">{readiness.score}%</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: AST + Required Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* AST Visualizer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="font-mono text-xs text-[var(--ink-soft)] uppercase tracking-wider">
            Evaluation Rules Trace ({currentOrg.name}):
          </div>
          {evalResult && (
            <AstNodeVisualizer trace={evalResult.trace} />
          )}
        </div>

        {/* Required Documents */}
        <div className="lg:col-span-4 bg-[var(--paper-deep)] border border-[var(--rule)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h3 className="font-mono text-xs uppercase font-medium text-[var(--ink)]">
              Document Requirements
            </h3>
            <span className="font-mono text-[11px] text-[var(--ink-soft)]">
              {readiness.mandatoryVerified} / {readiness.mandatoryTotal}
            </span>
          </div>

          <div className="space-y-2.5">
            {scheme.requiredDocuments.map((doc, idx) => {
              const isVerified = readiness.verifiedDocs.some(d => d.docType === doc.docType);
              return (
                <div
                  key={idx}
                  className="p-3 bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-xs text-[var(--ink)] truncate">{doc.name}</div>
                    <div className="text-[11px] text-[var(--ink-soft)] truncate">{doc.description}</div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono font-medium px-2 py-0.5 rounded-xs flex-shrink-0",
                    isVerified ? "bg-[var(--verified-bg)] text-[var(--verified)]" : "bg-[var(--pending-bg)] text-[var(--pending)]"
                  )}>
                    {isVerified ? "Verified" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
