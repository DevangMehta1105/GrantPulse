"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { 
  Award, 
  Sparkles, 
  FileCheck, 
  GitFork, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Landmark, 
  ArrowRight,
  ShieldCheck,
  Zap,
  KanbanSquare
} from "lucide-react";

export default function DashboardPage() {
  const { currentOrg, schemes, applications, getOrgEvaluation, getOrgDocumentReadiness } = useApp();

  // Compute matched schemes
  const schemeEvaluations = schemes.map(s => ({
    scheme: s,
    evaluation: getOrgEvaluation(s.id),
    readiness: getOrgDocumentReadiness(s.id)
  }));

  const eligibleCount = schemeEvaluations.filter(se => se.evaluation?.isEligible).length;
  const potentialFunding = schemeEvaluations
    .filter(se => se.evaluation?.isEligible)
    .reduce((sum, se) => sum + se.scheme.maxFundingAmount, 0);

  const totalSanctioned = applications
    .filter(a => a.orgId === currentOrg.id && a.currentState === "Sanctioned")
    .reduce((sum, a) => sum + (a.sanctionedAmount || 0), 0);

  const orgApps = applications.filter(a => a.orgId === currentOrg.id);

  return (
    <div className="space-y-8">
      {/* Top Banner / Org Context */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Operating System Active • Indian Grants & Subsidies</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {currentOrg.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentOrg.missionDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/eligibility"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <GitFork className="w-4 h-4" />
              <span>Run AST Engine</span>
            </Link>
            <Link
              href="/counterfactual"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Simulate What-If</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Eligible Schemes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{eligibleCount} / {schemes.length}</div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Deterministic AST evaluated
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Potential Grant Value</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">{formatINR(potentialFunding, true)}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Across qualified schemes</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Applications</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <KanbanSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{orgApps.length}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">In FSM Kanban pipeline</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Sanctioned Disbursals</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatINR(totalSanctioned, true)}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">100% GFR 12-A tracked</p>
        </div>
      </div>

      {/* Two Column Section: Top Matched Schemes + Live Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Qualified Schemes List */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-400" />
                Scheme Qualification & Explainability Status
              </h2>
              <p className="text-xs text-slate-400">Evaluated live against {currentOrg.name}&apos;s profile</p>
            </div>
            <Link href="/schemes" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {schemeEvaluations.map(({ scheme, evaluation, readiness }) => (
              <div
                key={scheme.id}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase">
                      {scheme.grantType}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {scheme.ministryOrFunder}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {scheme.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Funding Cap: <strong className="text-slate-200">{formatINR(scheme.maxFundingAmount, true)}</strong></span>
                    <span>Docs Readiness: <strong className={readiness.score >= 75 ? "text-emerald-400" : "text-amber-400"}>{readiness.score}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono">
                      {evaluation?.isEligible ? (
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Eligible
                        </span>
                      ) : (
                        <span className="text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {evaluation?.matchScore}% Match
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/schemes/${scheme.id}`}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 transition-colors"
                    title="Inspect AST & Apply"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Rail: Quick Actions & Counterfactual Teaser */}
        <div className="space-y-6">
          {/* Counterfactual Callout */}
          <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Counterfactual Simulator</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Find out what registrations (e.g. 80G, FCRA, Udyam) would unlock additional grants and the exact INR funding delta for your organization.
            </p>
            <Link
              href="/counterfactual"
              className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <span>Explore &quot;What-If&quot; Scenarios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Regulatory Vault Snapshot */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Regulatory Compliance Badges
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                <span className="text-slate-300">GSTIN Registration</span>
                <span className={currentOrg.complianceFlags.hasGstin ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {currentOrg.complianceFlags.hasGstin ? "Active" : "Not Registered"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                <span className="text-slate-300">Udyam Registration</span>
                <span className={currentOrg.complianceFlags.hasUdyam ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {currentOrg.complianceFlags.hasUdyam ? currentOrg.udyamTier : "None"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                <span className="text-slate-300">Section 12A / 80G</span>
                <span className={currentOrg.complianceFlags.has80G ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {currentOrg.complianceFlags.has80G ? "Exempt" : "Uncertified"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                <span className="text-slate-300">MCA Form CSR-1</span>
                <span className={currentOrg.complianceFlags.hasCsr1 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {currentOrg.complianceFlags.hasCsr1 ? "Registered" : "None"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
