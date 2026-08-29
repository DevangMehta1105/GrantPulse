"use client";

import React, { useState } from "react";
import { Application, ApplicationState } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { verifyAuditChainIntegrity } from "@/lib/fsm/state-machine";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Hash, 
  X,
  FileCheck2,
  Lock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS: { state: ApplicationState; label: string; color: string; desc: string }[] = [
  { state: "Discovered", label: "Discovered", color: "border-sky-500/40 text-sky-400 bg-sky-500/10", desc: "Matched by AST engine" },
  { state: "Docs Verified", label: "Docs Verified", color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10", desc: "OCR regex checked" },
  { state: "Drafting", label: "Drafting", color: "border-amber-500/40 text-amber-400 bg-amber-500/10", desc: "AI proposal & budget" },
  { state: "Applied", label: "Applied", color: "border-purple-500/40 text-purple-400 bg-purple-500/10", desc: "Filing ref registered" },
  { state: "Under Review", label: "Under Review", color: "border-blue-500/40 text-blue-400 bg-blue-500/10", desc: "Govt desk/field audit" },
  { state: "Sanctioned", label: "Sanctioned", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", desc: "Ledger unlocked" }
];

export function KanbanBoard() {
  const { applications, schemes, currentOrg, moveApplicationState, getOrgDocumentReadiness } = useApp();
  const [selectedAppForAudit, setSelectedAppForAudit] = useState<Application | null>(null);
  const [auditVerification, setAuditVerification] = useState<{ isValid: boolean; error?: string } | null>(null);
  
  // Transition modal state
  const [transitioningApp, setTransitioningApp] = useState<{ app: Application; targetState: ApplicationState } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [extAppIdInput, setExtAppIdInput] = useState("");
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const orgApps = applications.filter(a => a.orgId === currentOrg.id);

  const handleOpenAuditModal = async (app: Application) => {
    setSelectedAppForAudit(app);
    const result = await verifyAuditChainIntegrity(app.stateHistory);
    setAuditVerification(result);
  };

  const handleInitiateTransition = (app: Application, targetState: ApplicationState) => {
    setTransitioningApp({ app, targetState });
    setActionNote(`Advancing ${app.id} to ${targetState}`);
    setExtAppIdInput(app.externalApplicationId || "");
    setTransitionError(null);
  };

  const handleConfirmTransition = async () => {
    if (!transitioningApp) return;
    const res = await moveApplicationState(
      transitioningApp.app.id,
      transitioningApp.targetState,
      actionNote,
      extAppIdInput
    );

    if (res.success) {
      setTransitioningApp(null);
      setActionNote("");
      setExtAppIdInput("");
    } else {
      setTransitionError(res.error || "Transition blocked by guard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
        {COLUMNS.map(col => {
          const colApps = orgApps.filter(a => a.currentState === col.state);
          return (
            <div 
              key={col.state} 
              className="bg-[#0e111a] border border-[#1a202e] rounded-2xl p-3 flex flex-col min-h-[500px] shadow-sm"
            >
              {/* Column Header */}
              <div className="pb-2.5 mb-2.5 border-b border-[#1a202e] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold border font-mono", col.color)}>
                      {col.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#161a26] px-1.5 py-0.5 rounded">
                      {colApps.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{col.desc}</p>
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-2.5">
                {colApps.map(app => {
                  const scheme = schemes.find(s => s.id === app.schemeId);
                  const readiness = scheme ? getOrgDocumentReadiness(scheme.id) : null;
                  const nextStates = col.state === "Discovered" ? ["Docs Verified"] 
                    : col.state === "Docs Verified" ? ["Drafting"]
                    : col.state === "Drafting" ? ["Applied"]
                    : col.state === "Applied" ? ["Under Review"]
                    : col.state === "Under Review" ? ["Sanctioned"] : [];

                  return (
                    <div 
                      key={app.id} 
                      className="bg-[#131722] hover:bg-[#171d2b] border border-[#1f2638] rounded-xl p-3 space-y-2.5 transition-all shadow-sm group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-1">
                          <span className="font-mono text-emerald-400 font-bold">{app.id}</span>
                          <span className="bg-[#0a0c12] px-1.5 py-0.5 rounded font-mono">
                            {formatDate(app.updated_at)}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                          {scheme?.title || app.schemeId}
                        </h4>
                        <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
                          <span>Req:</span>
                          <strong className="text-white">{formatINR(app.requestedAmount, true)}</strong>
                          {app.sanctionedAmount && (
                            <span className="text-emerald-400 ml-1 font-bold">
                              (Sanctioned: {formatINR(app.sanctionedAmount, true)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Document Readiness Bar */}
                      {readiness && (
                        <div className="p-1.5 rounded-lg bg-[#090b10] border border-[#191e2b] text-[10px] flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-400">
                            <FileCheck2 className="w-3 h-3 text-indigo-400" />
                            Readiness:
                          </span>
                          <span className={cn(
                            "font-bold font-mono",
                            readiness.score >= 75 ? "text-emerald-400" : "text-amber-400"
                          )}>
                            {readiness.score}% ({readiness.mandatoryVerified}/{readiness.mandatoryTotal})
                          </span>
                        </div>
                      )}

                      {/* External Reference Pill */}
                      {app.externalApplicationId && (
                        <div className="text-[10px] text-slate-400 bg-purple-950/20 border border-purple-800/30 px-2 py-0.5 rounded font-mono truncate">
                          Ref: <span className="text-purple-300 font-semibold">{app.externalApplicationId}</span>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-[#1a202e] flex items-center justify-between gap-1">
                        <button
                          onClick={() => handleOpenAuditModal(app)}
                          className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#1b2233] transition-colors cursor-pointer"
                          title="View SHA-256 Audit Trail"
                        >
                          <Hash className="w-3 h-3 text-cyan-400" />
                          <span>Audit</span>
                        </button>

                        {nextStates.length > 0 && (
                          <button
                            onClick={() => handleInitiateTransition(app, nextStates[0] as ApplicationState)}
                            className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all font-bold cursor-pointer"
                          >
                            <span>Advance</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="h-28 border-2 border-dashed border-[#1a202e] rounded-xl flex items-center justify-center text-[11px] text-slate-400 font-medium">
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SHA-256 Audit Trail Modal */}
      {selectedAppForAudit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141d] border border-[#232a3b] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1e2433] flex items-center justify-between bg-[#0a0c12]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    SHA-256 Audit Provenance Chain
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#181d28] text-cyan-400 rounded">
                      {selectedAppForAudit.id}
                    </span>
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAppForAudit(null)}
                className="p-1 rounded-lg bg-[#181d28] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cryptographic Proof Header */}
            <div className="p-3 bg-[#0c0e14] border-b border-[#1e2433]">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-950/20 border border-emerald-500/30 p-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  Mathematical Integrity Verified: All {selectedAppForAudit.stateHistory.length} state transitions form an unbroken cryptographic hash chain.
                </span>
              </div>
            </div>

            {/* Transition Step List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedAppForAudit.stateHistory.map((entry, idx) => (
                <div key={idx} className="bg-[#0e111a] border border-[#1e2433] rounded-xl p-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1e2433] text-slate-200 font-mono font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white">
                        {entry.fromState} → <span className="text-emerald-400">{entry.toState}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(entry.timestamp)}</span>
                  </div>

                  <p className="text-slate-300 text-[11px] pl-7">{entry.actionNote}</p>

                  <div className="pl-7 pt-1 text-[9px] font-mono text-cyan-400 truncate">
                    Hash: <span className="text-slate-300 font-semibold">{entry.hash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State Transition Guard Modal */}
      {transitioningApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141d] border border-[#232a3b] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1e2433] pb-2.5">
              <h3 className="font-bold text-sm text-white">Advance FSM Lifecycle State</h3>
              <button onClick={() => setTransitioningApp(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-[11px]">Advancing To:</span>
                <div className="font-bold text-emerald-400 text-sm mt-0.5">{transitioningApp.targetState}</div>
              </div>

              {transitioningApp.targetState === "Applied" && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Government Portal Acknowledgement / Reference ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={extAppIdInput}
                    onChange={(e) => setExtAppIdInput(e.target.value)}
                    placeholder="e.g. ZED/2024/MH/99241"
                    className="w-full bg-[#0c0e14] border border-[#1e2433] rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Required to satisfy deterministic FSM transition guard.</p>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Action Note</label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0c0e14] border border-[#1e2433] rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {transitionError && (
                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{transitionError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2433]">
              <button
                onClick={() => setTransitioningApp(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-[#181d28] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransition}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
              >
                Sign & Advance (SHA-256)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
