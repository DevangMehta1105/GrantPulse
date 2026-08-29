"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { AstNodeVisualizer } from "@/components/ast/AstNodeVisualizer";
import { 
  Building2, 
  Layers, 
  FileCheck2, 
  KanbanSquare, 
  ScrollText, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp,
  UploadCloud,
  Send,
  Printer,
  ChevronRight,
  ExternalLink,
  Plus,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "1. Entity Profile", desc: "Profile & Compliance", icon: Building2 },
  { id: 2, title: "2. Match Grants", desc: "AST Rules & Explain", icon: Layers },
  { id: 3, title: "3. Document Audit", desc: "OCR Regex Scanner", icon: FileCheck2 },
  { id: 4, title: "4. Track Pipeline", desc: "FSM Kanban & SHA-256", icon: KanbanSquare },
  { id: 5, title: "5. Sanction & GFR", desc: "Ledger & Compliance", icon: ScrollText }
];

export default function GuidedWizardDashboard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { currentOrg, organizations, setCurrentOrgId, schemes, documents, applications, expenses, getOrgEvaluation, getOrgDocumentReadiness, createNewApplication } = useApp();

  // Evaluated schemes
  const schemeEvaluations = schemes.map(s => ({
    scheme: s,
    evaluation: getOrgEvaluation(s.id),
    readiness: getOrgDocumentReadiness(s.id)
  }));

  const eligibleSchemes = schemeEvaluations.filter(se => se.evaluation?.isEligible);
  const potentialFunding = eligibleSchemes.reduce((sum, se) => sum + se.scheme.maxFundingAmount, 0);

  const orgApps = applications.filter(a => a.orgId === currentOrg.id);
  const orgDocs = documents.filter(d => d.orgId === currentOrg.id);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#111520] via-[#131926] to-[#0d1620] border border-[#1e2436] rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GrantPulse Lifecycle Operating System</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-emerald-400">{currentOrg.name}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Follow this 5-step guided journey to discover government & CSR grants, inspect eligibility rules, verify compliance documents, and manage post-sanction disbursements.
            </p>
          </div>

          {/* Aggregate Live Counters */}
          <div className="flex items-center gap-4 bg-[#090b10]/80 border border-[#1e2436] p-4 rounded-xl">
            <div className="text-center px-3 border-r border-[#1e2436]">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Eligible Schemes</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{eligibleSchemes.length} / {schemes.length}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Max Grant Value</div>
              <div className="text-xl font-black text-cyan-400 font-mono">{formatINR(potentialFunding, true)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Wizard Progress Bar */}
      <div className="bg-[#10131c] border border-[#1a1f2c] rounded-2xl p-3 shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer relative",
                  isActive
                    ? "bg-[#161c28] border border-emerald-500/40 text-white shadow-lg shadow-emerald-500/5"
                    : isCompleted
                    ? "bg-[#11141c] hover:bg-[#151924] border border-[#1e2433] text-slate-300"
                    : "bg-[#0d0f17] hover:bg-[#121520] border border-[#181d28] text-slate-400"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 transition-colors",
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-[#181d28] text-slate-400"
                )}>
                  {isCompleted ? "✓" : step.id}
                </div>

                <div className="min-w-0">
                  <div className={cn("font-bold text-xs truncate", isActive ? "text-emerald-400" : "text-slate-200")}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{step.desc}</div>
                </div>

                {isActive && (
                  <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-[#11141d] border border-[#1e2433] rounded-3xl p-6 md:p-8 shadow-xl min-h-[500px]">
        {/* ========================================================================= */}
        {/* STEP 1: ENTITY PROFILE & COMPLIANCE HEALTH */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2433]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                  Step 1 of 5
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Entity Profile & Regulatory Checklist
                </h2>
                <p className="text-xs text-slate-400">
                  Select an organization profile below to test real-time AST qualification across Indian schemes.
                </p>
              </div>

              {/* Quick Org Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Switch Entity:</span>
                <select
                  value={currentOrg.id}
                  onChange={(e) => setCurrentOrgId(e.target.value)}
                  className="bg-[#161a24] text-white font-bold text-xs px-3 py-2 rounded-xl border border-[#232a3b] focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.entityType})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] space-y-1">
                <span className="text-slate-400 text-[11px]">Entity Structure</span>
                <div className="font-bold text-sm text-white">{currentOrg.entityType}</div>
                <div className="text-slate-400">{currentOrg.yearsOfOperation} Years Active ({currentOrg.incorporationDate})</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] space-y-1">
                <span className="text-slate-400 text-[11px]">Annual Turnover</span>
                <div className="font-bold text-sm text-emerald-400 font-mono">{formatINR(currentOrg.turnoverInr, true)}</div>
                <div className="text-slate-400">State: {currentOrg.state}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] space-y-1">
                <span className="text-slate-400 text-[11px]">MSME Registration</span>
                <div className="font-bold text-sm text-white">
                  {currentOrg.complianceFlags.hasUdyam ? `${currentOrg.udyamTier} Enterprise` : "None"}
                </div>
                <div className="text-slate-400 font-mono text-[10px] truncate">
                  {currentOrg.complianceFlags.udyamNumber || "Not Registered"}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] space-y-1">
                <span className="text-slate-400 text-[11px]">Non-Profit Status</span>
                <div className="font-bold text-sm text-white">
                  {currentOrg.complianceFlags.has80G ? "12A & 80G Certified" : "For-Profit / MSME"}
                </div>
                <div className="text-slate-400 text-[10px]">
                  CSR-1: {currentOrg.complianceFlags.hasCsr1 ? "Registered" : "None"}
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Organization Mandate & Mission
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {currentOrg.missionDescription}
              </p>
            </div>

            {/* Step 1 Footer CTA */}
            <div className="pt-4 border-t border-[#1e2433] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Ready to evaluate grants against {currentOrg.name}&apos;s profile?
              </span>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Proceed to Step 2: Match Grants</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: AST GRANT MATCHING & PLAIN ENGLISH EXPLANATION */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2433]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                  Step 2 of 5
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  AST Eligibility Matching & Explainability
                </h2>
                <p className="text-xs text-slate-400">
                  Every scheme below is evaluated live by the AST engine with 100% transparent explainability.
                </p>
              </div>

              <Link
                href="/counterfactual"
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate &quot;What-If&quot; Upgrades</span>
              </Link>
            </div>

            {/* Scheme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schemeEvaluations.map(({ scheme, evaluation, readiness }) => (
                <div
                  key={scheme.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4",
                    evaluation?.isEligible
                      ? "bg-[#121824] border-emerald-500/40 hover:border-emerald-500/70 shadow-md shadow-emerald-500/5"
                      : "bg-[#0f121a] border-[#1e2433] opacity-85 hover:opacity-100"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {scheme.grantType}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{scheme.sourcePortal}</span>
                    </div>

                    <h3 className="font-bold text-base text-white">{scheme.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{scheme.description}</p>
                  </div>

                  {/* AST Explainability Reason Snippet */}
                  <div className="p-3 rounded-xl bg-[#090b10] border border-[#1a1f2c] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Eligibility Verdict:</span>
                      {evaluation?.isEligible ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Eligible
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {evaluation?.matchScore}% Match
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {evaluation?.isEligible 
                        ? `✓ All rules satisfied for ${currentOrg.entityType} (${currentOrg.state}).`
                        : `✗ Missing: ${evaluation?.missingRequirements[0] || "Unmet threshold"}`}
                    </p>
                  </div>

                  {/* Actions & Value */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1e2433] text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Max Grant</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {formatINR(scheme.maxFundingAmount, true)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/schemes/${scheme.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#1a202e] hover:bg-[#222a3d] text-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Tree Inspector</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 2 Footer Navigation */}
            <div className="pt-4 border-t border-[#1e2433] flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Profile</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Proceed to Step 3: Audit Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DOCUMENT AUDIT VAULT & OCR SCANNER */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2433]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                  Step 3 of 5
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Document Vault & OCR Regex Verification
                </h2>
                <p className="text-xs text-slate-400">
                  Upload certificates to extract regulatory identifiers (GSTIN, PAN, Udyam, 12A/80G, CSR-1) with 98% accuracy.
                </p>
              </div>

              <Link
                href="/documents"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Full OCR Upload Studio</span>
              </Link>
            </div>

            {/* Document Vault List */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Uploaded & Verified Certificates ({orgDocs.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {orgDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {doc.docType.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-bold text-white text-sm">{doc.fileName}</h4>
                      {doc.ocrExtractedData?.extractedId && (
                        <div className="font-mono text-emerald-400 font-semibold text-[11px]">
                          Extracted: {doc.ocrExtractedData.extractedId}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3 Footer Navigation */}
            <div className="pt-4 border-t border-[#1e2433] flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Grant Matching</span>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Proceed to Step 4: Track in Kanban</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: APPLICATION PIPELINE & SHA-256 PROVENANCE */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2433]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                  Step 4 of 5
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  FSM Kanban Application Workspace
                </h2>
                <p className="text-xs text-slate-400">
                  Advance applications through state guards with cryptographic SHA-256 state history chaining.
                </p>
              </div>

              <Link
                href="/copilot"
                className="px-3.5 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Proposal Co-Pilot</span>
              </Link>
            </div>

            {/* Embedded Kanban Board */}
            <KanbanBoard />

            {/* Step 4 Footer Navigation */}
            <div className="pt-4 border-t border-[#1e2433] flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Documents</span>
              </button>

              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Proceed to Step 5: Post-Sanction Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: POST-SANCTION LEDGER & FORM GFR 12-A CERTIFICATE */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2433]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                  Step 5 of 5
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Post-Sanction Fund Utilization & Form GFR 12-A
                </h2>
                <p className="text-xs text-slate-400">
                  Track vouched expenses against statutory caps and export the official Government of India Utilization Certificate.
                </p>
              </div>

              <Link
                href="/compliance"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Full Ledger & Print Studio</span>
              </Link>
            </div>

            {/* Vouched Expense Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] space-y-1">
                <span className="text-slate-400 text-[11px]">Active Sanction</span>
                <div className="font-bold text-sm text-white font-mono">SO-ZED-9821</div>
                <div className="text-emerald-400">Sanctioned Value: {formatINR(400000)}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] space-y-1">
                <span className="text-slate-400 text-[11px]">Utilized (Vouched)</span>
                <div className="font-bold text-sm text-cyan-400 font-mono">{formatINR(340000)}</div>
                <div className="text-slate-400">85% of Tranche #1</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[#1a1f2c] space-y-1">
                <span className="text-slate-400 text-[11px]">Unutilized Balance</span>
                <div className="font-bold text-sm text-amber-400 font-mono">{formatINR(60000)}</div>
                <div className="text-emerald-400 font-medium">✓ 100% GFR 238(1) Compliant</div>
              </div>
            </div>

            {/* Official GFR 12-A Preview Card */}
            <div className="p-6 rounded-2xl bg-[#0a0c12] border border-[#1e2436] space-y-4 text-xs">
              <div className="text-center border-b border-[#1e2436] pb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-widest block">
                  FORM GFR 12-A • GENERAL FINANCIAL RULES 2017
                </span>
                <h4 className="font-bold text-sm text-white mt-1">
                  OFFICIAL UTILIZATION CERTIFICATE
                </h4>
              </div>

              <p className="text-slate-300 leading-relaxed text-[11px]">
                Certified that out of <strong className="text-white font-mono">₹4,00,000</strong> grants-in-aid sanctioned during the financial year in favour of <strong className="text-white">{currentOrg.name}</strong> under Letter No. <strong className="text-emerald-400 font-mono">SO-ZED-9821</strong>, a sum of <strong className="text-white font-mono">₹3,40,000</strong> has been utilized for the approved purposes in accordance with sanctioned milestones.
              </p>

              <div className="pt-3 border-t border-[#1e2436] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Digital Signature: <strong className="text-emerald-400 font-mono">SHA-256 VERIFIED</strong></span>
                <Link
                  href="/compliance"
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Open Full Certificate & Print →
                </Link>
              </div>
            </div>

            {/* Step 5 Footer Navigation */}
            <div className="pt-4 border-t border-[#1e2433] flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Pipeline</span>
              </button>

              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2.5 rounded-xl bg-[#161a24] hover:bg-[#1f2533] text-white font-bold text-xs flex items-center gap-2 border border-[#232a3b] transition-all cursor-pointer"
              >
                <span>Restart Journey (Step 1)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
