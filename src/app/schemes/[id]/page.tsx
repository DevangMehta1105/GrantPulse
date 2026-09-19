"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { ArrowLeft, Sparkles, ShieldCheck, FileCheck2, BotMessageSquare, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluateSemanticFit } from "@/lib/semantic/matcher";

export default function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { schemes, currentOrg, getOrgEvaluation, getOrgDocumentReadiness, createNewApplication, applications } = useApp();
  const [isApplying, setIsApplying] = useState(false);

  const scheme = schemes.find(s => s.id === unwrappedParams.id);
  if (!scheme) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-sm text-[var(--ink-soft)] font-mono">
        Scheme not found in catalog. <Link href="/schemes" className="text-[var(--ink)] underline font-bold">Return to catalog</Link>
      </div>
    );
  }

  const evalResult = getOrgEvaluation(scheme.id);
  const readiness = getOrgDocumentReadiness(scheme.id);
  const semanticResult = evaluateSemanticFit(currentOrg, scheme);
  const existingApp = applications.find(a => a.orgId === currentOrg.id && a.schemeId === scheme.id);

  const handleApply = async () => {
    setIsApplying(true);
    await createNewApplication(scheme.id, scheme.maxFundingAmount);
    setIsApplying(false);
    router.push("/pipeline");
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-8 space-y-8 font-sans">
      <Link 
        href="/schemes" 
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Grant Catalog</span>
      </Link>

      {/* Program Summary Card */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-[11px] uppercase text-[var(--stamp)] font-bold">
              {scheme.sourcePortal} · {scheme.grantType}
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
              {scheme.title}
            </h1>
            <p className="text-sm font-medium text-[var(--ink-soft)] font-mono">{scheme.ministryOrFunder}</p>
          </div>

          <div className="flex items-center gap-3">
            {existingApp ? (
              <Link
                href="/pipeline"
                className="px-4 py-2 bg-[var(--paper)] hover:bg-[#E4DCCB] text-[var(--ink)] border border-[var(--rule)] text-xs font-mono font-bold rounded flex items-center gap-2 transition-colors"
              >
                <span>Track in Pipeline ({existingApp.currentState})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-4 py-2 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] text-xs font-mono font-bold rounded flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isApplying ? "Adding to Pipeline..." : "Add to Application Pipeline"}
              </button>
            )}

            <Link
              href="/copilot"
              className="px-4 py-2 bg-[var(--stamp)] hover:bg-[#852F20] text-white text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>Draft Co-Pilot Dossier</span>
            </Link>
          </div>
        </div>

        <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-4xl">
          {scheme.description}
        </p>

        {/* 5-Metric Metadata Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-[var(--rule)] font-mono text-xs">
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px] uppercase">MAX FUNDING CAP</span>
            <span className="font-bold text-sm text-[var(--ink)]">{formatINR(scheme.maxFundingAmount, true)}</span>
          </div>
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px] uppercase">DEADLINE</span>
            <span className="text-[var(--ink)] font-semibold">{formatDate(scheme.deadline)}</span>
          </div>
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px] uppercase">HARD AST ELIGIBILITY</span>
            <span className={evalResult?.isEligible ? "text-[var(--verified)] font-bold text-sm" : "text-[var(--pending)] font-bold text-sm"}>
              {evalResult?.isEligible ? "✓ 100% Eligible" : `${evalResult?.matchScore || 0}% Fit`}
            </span>
          </div>
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px] uppercase">SEMANTIC INTENT FIT</span>
            <span className="text-[var(--verified)] font-bold text-sm">
              🎯 {semanticResult.semanticScore}% Match
            </span>
          </div>
          <div>
            <span className="text-[var(--ink-soft)] block text-[10px] uppercase">DOC READINESS</span>
            <span className="text-[var(--ink)] font-bold text-sm">{readiness.score}% ({readiness.mandatoryVerified}/{readiness.mandatoryTotal})</span>
          </div>
        </div>
      </div>

      {/* Semantic Thematic Synergy Card (Pillar C Highlight) */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--rule)]/60 pb-3">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[var(--ink)]">
            <Sparkles className="w-4 h-4 text-[var(--stamp)]" />
            <span>Pillar C · Thematic Intent &amp; Mission Synergy Analysis</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--verified-bg)] text-[var(--verified)] border border-[var(--verified)]/30">
            {semanticResult.synergyLevel} SYNERGY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="md:col-span-2 space-y-2 font-sans">
            <div className="text-[11px] font-mono text-[var(--ink-soft)] uppercase font-bold">
              Mission Alignment Breakdown:
            </div>
            <p className="text-xs text-[var(--ink)] leading-relaxed bg-[var(--paper)] p-3.5 rounded border border-[var(--rule)]/60">
              {semanticResult.intentExplanation}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[var(--ink-soft)] uppercase font-bold">
              Thematic Overlap Keywords:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {semanticResult.thematicOverlap.map(kw => (
                <span key={kw} className="px-2 py-1 bg-[var(--paper)] text-[var(--ink)] rounded border border-[var(--rule)] text-[11px] font-bold">
                  #{kw}
                </span>
              ))}
              {semanticResult.thematicOverlap.length === 0 && (
                <span className="text-[11px] text-[var(--ink-soft)]">Standard MSME Innovation terms</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: AST Visualizer (Left) + Required Documents (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* AST Visualizer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="font-mono text-xs text-[var(--ink-soft)] uppercase tracking-wider font-bold">
            Deterministic AST Boolean Rules Trace ({currentOrg.name}):
          </div>
          {evalResult && (
            <AstNodeVisualizer trace={evalResult.trace} />
          )}
        </div>

        {/* Required Documents */}
        <div className="lg:col-span-4 bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h3 className="font-mono text-xs uppercase font-bold text-[var(--ink)] flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[var(--stamp)]" />
              <span>Document Requirements</span>
            </h3>
            <span className="font-mono text-[11px] text-[var(--ink-soft)] font-bold">
              {readiness.mandatoryVerified} / {readiness.mandatoryTotal}
            </span>
          </div>

          <div className="space-y-2.5">
            {scheme.requiredDocuments.map((doc, idx) => {
              const isVerified = readiness.verifiedDocs.some(d => d.docType === doc.docType);
              return (
                <div
                  key={idx}
                  className="p-3 bg-[var(--paper)] border border-[var(--rule)] rounded flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[var(--ink)] truncate">{doc.name}</div>
                    <div className="text-[10px] font-mono text-[var(--ink-soft)] truncate">{doc.description}</div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0",
                    isVerified ? "bg-[var(--verified-bg)] text-[var(--verified)] border border-[var(--verified)]/30" : "bg-[var(--pending-bg)] text-[var(--pending)] border border-[var(--pending)]/30"
                  )}>
                    {isVerified ? "✓ Verified" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/documents"
              className="w-full py-2 bg-[var(--paper)] hover:bg-[#E4DCCB] text-[var(--ink)] border border-[var(--rule)] text-xs font-mono font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Upload Missing in Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
