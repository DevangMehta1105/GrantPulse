"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { 
  ArrowLeft, 
  Landmark, 
  Calendar, 
  FileCheck2, 
  GitFork, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Send,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { schemes, currentOrg, getOrgEvaluation, getOrgDocumentReadiness, createNewApplication, applications } = useApp();
  const [isApplying, setIsApplying] = useState(false);

  const scheme = schemes.find(s => s.id === unwrappedParams.id);
  if (!scheme) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Scheme Not Found</h2>
        <Link href="/schemes" className="text-emerald-400 text-sm hover:underline">
          Return to Schemes Catalog
        </Link>
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
    <div className="space-y-8">
      {/* Back Link */}
      <Link 
        href="/schemes" 
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </Link>

      {/* Scheme Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase font-mono">
                {scheme.grantType}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Source: {scheme.sourcePortal}
              </span>
              <span className="text-xs text-slate-400">
                • Ingestion: {scheme.sourceType}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {scheme.title}
            </h1>
            <p className="text-sm font-medium text-emerald-400">
              {scheme.ministryOrFunder}
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col items-end gap-2">
            {existingApp ? (
              <Link
                href="/pipeline"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
              >
                <span>Track in Pipeline ({existingApp.currentState})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
                <span>{isApplying ? "Adding..." : "Add to Kanban Pipeline"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Max Funding</span>
            <span className="font-mono font-bold text-base text-emerald-400">{formatINR(scheme.maxFundingAmount, true)}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Filing Deadline</span>
            <span className="font-mono font-bold text-base text-slate-200">{formatDate(scheme.deadline)}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">AST Match Score</span>
            <span className={cn("font-mono font-bold text-base", evalResult?.isEligible ? "text-emerald-400" : "text-amber-400")}>
              {evalResult?.matchScore}%
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Document Readiness</span>
            <span className="font-mono font-bold text-base text-cyan-400">{readiness.score}%</span>
          </div>
        </div>
      </div>

      {/* AST Explainability Visualizer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-emerald-400" />
                  Explainable AST Eligibility Evaluation Tree
                </h2>
                <p className="text-xs text-slate-400">
                  Recursive boolean & threshold rule verification against {currentOrg.name}
                </p>
              </div>
              <div className="text-xs font-mono font-bold">
                {evalResult?.isEligible ? (
                  <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                    ELIGIBLE (PASSED)
                  </span>
                ) : (
                  <span className="text-rose-400 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full">
                    REQUIRES REMEDIATION
                  </span>
                )}
              </div>
            </div>

            {/* AST Visualizer Component */}
            {evalResult && (
              <div className="pt-2">
                <AstNodeVisualizer trace={evalResult.trace} />
              </div>
            )}
          </div>
        </div>

        {/* Right Rail: Required Documents Audit */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                Required Document Audit
              </h3>
              <span className="text-xs font-bold font-mono text-indigo-400">
                {readiness.mandatoryVerified} / {readiness.mandatoryTotal}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {scheme.requiredDocuments.map((doc, idx) => {
                const isVerified = readiness.verifiedDocs.some(d => d.docType === doc.docType);
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-xl border flex items-start justify-between gap-3",
                      isVerified
                        ? "bg-emerald-950/20 border-emerald-500/30 text-slate-200"
                        : "bg-slate-800/60 border-slate-700 text-slate-400"
                    )}
                  >
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {isVerified ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        {doc.name}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{doc.description}</p>
                    </div>

                    <span className={cn(
                      "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded font-mono",
                      isVerified ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"
                    )}>
                      {isVerified ? "Verified" : "Missing"}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/documents"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>Upload to Vault & Run OCR</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
