"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { ArrowLeft, Check, AlertTriangle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { schemes, currentOrg, getOrgEvaluation, getOrgDocumentReadiness, createNewApplication, applications } = useApp();
  const [isApplying, setIsApplying] = useState(false);

  const scheme = schemes.find(s => s.id === unwrappedParams.id);
  if (!scheme) {
    return (
      <div className="p-8 text-center text-xs text-[#8b8d98]">
        Scheme not found. <Link href="/schemes" className="text-white underline">Return to catalog</Link>
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
    <div className="space-y-6 text-xs">
      <Link 
        href="/schemes" 
        className="inline-flex items-center gap-1.5 text-xs text-[#8b8d98] hover:text-[#ededef] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </Link>

      {/* Program Summary Card */}
      <div className="bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-[#5e6170] uppercase">
              {scheme.sourcePortal} • {scheme.grantType}
            </div>
            <h1 className="text-base font-bold text-[#ededef]">{scheme.title}</h1>
            <p className="text-xs text-[#8b8d98]">{scheme.ministryOrFunder}</p>
          </div>

          <div className="flex items-center gap-2">
            {existingApp ? (
              <Link
                href="/pipeline"
                className="px-3.5 py-1.5 rounded-md bg-[#1a1c24] text-[#ededef] font-medium border border-[#232530] hover:bg-[#20222c]"
              >
                Track in Pipeline ({existingApp.currentState})
              </Link>
            ) : (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-4 py-1.5 rounded-md bg-[#ededef] text-[#0d0e11] font-semibold hover:bg-white transition-colors cursor-pointer"
              >
                {isApplying ? "Adding..." : "Add to Application Pipeline"}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-[#8b8d98] leading-relaxed max-w-4xl">
          {scheme.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1e2029] font-mono text-[11px]">
          <div>
            <span className="text-[#5e6170] block text-[10px]">MAX FUNDING</span>
            <span className="font-bold text-[#ededef]">{formatINR(scheme.maxFundingAmount, true)}</span>
          </div>
          <div>
            <span className="text-[#5e6170] block text-[10px]">DEADLINE</span>
            <span className="text-[#ededef]">{formatDate(scheme.deadline)}</span>
          </div>
          <div>
            <span className="text-[#5e6170] block text-[10px]">AST MATCH</span>
            <span className={evalResult?.isEligible ? "text-[#2eb88a] font-bold" : "text-[#f59e0b] font-bold"}>
              {evalResult?.matchScore}%
            </span>
          </div>
          <div>
            <span className="text-[#5e6170] block text-[10px]">DOC READINESS</span>
            <span className="text-[#ededef] font-bold">{readiness.score}%</span>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* AST Visualizer */}
        <div className="lg:col-span-8 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2029] pb-3">
            <h2 className="font-semibold text-xs text-[#ededef] uppercase font-mono">
              AST Eligibility Evaluation
            </h2>
            <span className="text-[10px] font-mono text-[#5e6170]">
              {currentOrg.name} profile
            </span>
          </div>

          {evalResult && (
            <AstNodeVisualizer trace={evalResult.trace} />
          )}
        </div>

        {/* Required Documents */}
        <div className="lg:col-span-4 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e2029] pb-3">
            <h3 className="font-semibold text-xs text-[#ededef] uppercase font-mono">
              Document Checklist
            </h3>
            <span className="text-[10px] font-mono text-[#5e6170]">
              {readiness.mandatoryVerified} / {readiness.mandatoryTotal}
            </span>
          </div>

          <div className="space-y-2">
            {scheme.requiredDocuments.map((doc, idx) => {
              const isVerified = readiness.verifiedDocs.some(d => d.docType === doc.docType);
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#111216] border border-[#1e2029] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-[#ededef] truncate">{doc.name}</div>
                    <div className="text-[10px] text-[#5e6170] truncate">{doc.description}</div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded flex-shrink-0",
                    isVerified ? "bg-[#13231e] text-[#2eb88a]" : "bg-[#1f1d17] text-[#f59e0b]"
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
